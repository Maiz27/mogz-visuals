import { describe, expect, it, vi } from 'vitest';
import {
  COLLECTION_ACCESS_TTL_MS,
  issueCollectionAccessToken,
  verifyCollectionAccessToken,
} from './collectionAccess';

vi.mock('@/lib/env', () => ({
  ENCRYPTION_KEY: 'test-key',
}));

describe('collection access tokens', () => {
  it('accepts a token for the collection it was issued for', () => {
    const { token, expiresAt } = issueCollectionAccessToken('collection-1');

    expect(verifyCollectionAccessToken(token, 'collection-1')).toEqual({
      ok: true,
      collectionId: 'collection-1',
      expiresAt,
    });
  });

  it('rejects a token issued for a different collection', () => {
    const { token } = issueCollectionAccessToken('collection-1');

    expect(verifyCollectionAccessToken(token, 'collection-2')).toEqual({
      ok: false,
      reason: 'mismatch',
    });
  });

  it('rejects a missing token', () => {
    expect(verifyCollectionAccessToken(undefined, 'collection-1')).toEqual({
      ok: false,
      reason: 'missing',
    });
    expect(verifyCollectionAccessToken('', 'collection-1')).toEqual({
      ok: false,
      reason: 'missing',
    });
  });

  it('rejects malformed tokens', () => {
    for (const token of [
      'not-a-token',
      'v1.only-two-parts',
      'v2.abc.def',
      'v1..signature',
    ]) {
      expect(verifyCollectionAccessToken(token, 'collection-1').ok).toBe(false);
    }

    expect(verifyCollectionAccessToken('not-a-token', 'collection-1')).toEqual({
      ok: false,
      reason: 'malformed',
    });
  });

  it('rejects a token whose payload was tampered with', () => {
    const { token } = issueCollectionAccessToken('collection-1');
    const [version, , signature] = token.split('.');
    const forgedBody = Buffer.from(
      JSON.stringify({ cid: 'collection-2', exp: Date.now() + 60_000 }),
      'utf8',
    ).toString('base64url');

    expect(
      verifyCollectionAccessToken(
        `${version}.${forgedBody}.${signature}`,
        'collection-2',
      ),
    ).toEqual({ ok: false, reason: 'malformed' });
  });

  it('rejects an expired token', () => {
    const issuedAt = Date.now() - COLLECTION_ACCESS_TTL_MS - 1_000;
    const { token } = issueCollectionAccessToken('collection-1', issuedAt);

    expect(verifyCollectionAccessToken(token, 'collection-1')).toEqual({
      ok: false,
      reason: 'expired',
    });
  });

  it('accepts a token that has not expired yet', () => {
    const issuedAt = Date.now() - COLLECTION_ACCESS_TTL_MS + 60_000;
    const { token } = issueCollectionAccessToken('collection-1', issuedAt);

    expect(verifyCollectionAccessToken(token, 'collection-1').ok).toBe(true);
  });

  it('resolves the collection id when no expectation is supplied', () => {
    const { token } = issueCollectionAccessToken('collection-1');
    const result = verifyCollectionAccessToken(token);

    expect(result.ok && result.collectionId).toBe('collection-1');
  });
});
