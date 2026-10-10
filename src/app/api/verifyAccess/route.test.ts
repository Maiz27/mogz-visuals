import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { verifyCollectionAccessToken } from '@/lib/server/collectionAccess';
import {
  SanityServerConfigError,
  getSanityServerClient,
} from '@/lib/sanity/serverClient';
import {
  enforceRateLimitRules,
  peekRateLimitRules,
} from '@/lib/server/rateLimit';

const sanityFetch = vi.fn();
const getDocument = vi.fn();

vi.mock('@/lib/sanity/serverClient', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/sanity/serverClient')>();
  return {
    ...actual,
    getSanityServerClient: vi.fn(),
  };
});

vi.mock('@/lib/server/rateLimit', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/server/rateLimit')>();
  return {
    ...actual,
    enforceRateLimitRules: vi.fn(actual.enforceRateLimitRules),
    peekRateLimitRules: vi.fn(actual.peekRateLimitRules),
  };
});

vi.mock('@/lib/env', () => ({
  ENCRYPTION_KEY: 'test-key',
}));

const COLLECTION = { _id: 'doc-abc', uniqueId: 'collection-1' };
const SECRET = {
  _id: 'collectionSecret.doc-abc',
  _type: 'collectionSecret',
  collectionId: 'doc-abc',
  uniqueId: 'collection-1',
  accessCode: 'garden-party',
};

const createRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/verifyAccess', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });

const submit = (password: string, id = 'collection-1') =>
  POST(createRequest({ id, password, token: 'turnstile' }));

const parseSetCookie = (header: string | null) => {
  const attributes = (header ?? '').split(';').map((part) => part.trim());
  return {
    value: attributes[0]?.split('=').slice(1).join('=') ?? '',
    flags: attributes.slice(1).map((flag) => flag.toLowerCase()),
  };
};

const INVALID = { message: 'Invalid collection ID or password', status: 401 };

describe('POST /api/verifyAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Drop any queued one-off values a previous test left unconsumed.
    sanityFetch.mockReset();
    getDocument.mockReset();
    global.fetch = vi.fn(async () => ({
      json: async () => ({ success: true }),
    })) as any;
    vi.mocked(getSanityServerClient).mockReturnValue({
      fetch: sanityFetch,
      getDocument,
    } as any);
    sanityFetch.mockResolvedValue(COLLECTION);
    getDocument.mockResolvedValue(SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('checks the code in the companion document and issues a scoped httpOnly cookie', async () => {
    const res = await submit('garden-party');

    expect(res.status).toBe(200);
    expect(getDocument).toHaveBeenCalledWith('collectionSecret.doc-abc');

    const body = await res.json();
    expect(body.id).toBe('collection-1');
    expect(JSON.stringify(body)).not.toContain('garden-party');

    const cookie = parseSetCookie(res.headers.get('set-cookie'));
    expect(cookie.flags).toContain('httponly');
    expect(cookie.flags).toContain('samesite=lax');
    expect(cookie.flags.some((flag) => flag.startsWith('expires='))).toBe(true);

    const token = decodeURIComponent(cookie.value);
    expect(verifyCollectionAccessToken(token, 'collection-1').ok).toBe(true);
    expect(verifyCollectionAccessToken(token, 'collection-2').ok).toBe(false);
  });

  it('marks the cookie Secure in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const res = await submit('garden-party');
    expect(parseSetCookie(res.headers.get('set-cookie')).flags).toContain(
      'secure',
    );
  });

  it('rejects a wrong code without setting a cookie', async () => {
    const res = await submit('garden-part');
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual(INVALID);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('answers an unknown collection exactly like a wrong code', async () => {
    sanityFetch.mockResolvedValue(null);
    const res = await submit('garden-party', 'missing');
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual(INVALID);
    expect(getDocument).not.toHaveBeenCalled();
  });

  it('answers a missing companion document exactly like a wrong code', async () => {
    getDocument.mockResolvedValue(null);
    const res = await submit('garden-party');
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual(INVALID);
    // The legacy public-field fallback is off unless explicitly enabled.
    expect(sanityFetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['another collection', { collectionId: 'doc-other' }],
    ['the wrong type', { _type: 'collection' }],
    ['no code', { accessCode: '' }],
  ])('rejects a companion document for %s', async (_label, override) => {
    getDocument.mockResolvedValue({ ...SECRET, ...override });
    const res = await submit('garden-party');
    expect(res.status).toBe(401);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('still unlocks when the companion holds a stale copy of the client-facing ID', async () => {
    // An editor regenerated the ID in a draft and re-linked before publishing.
    getDocument.mockResolvedValue({ ...SECRET, uniqueId: 'regenerated-id' });
    const res = await submit('garden-party');
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ id: 'collection-1' });
  });

  it('can check the legacy public code during the migration window only', async () => {
    vi.stubEnv('COLLECTION_ACCESS_LEGACY_PUBLIC_FALLBACK', 'true');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    getDocument.mockResolvedValue(null);
    sanityFetch
      .mockResolvedValueOnce(COLLECTION)
      .mockResolvedValueOnce('legacy-code');

    const res = await submit('legacy-code');

    expect(res.status).toBe(200);
    // Logs the document ID, never the code.
    expect(JSON.stringify(warn.mock.calls)).toContain('doc-abc');
    expect(JSON.stringify(warn.mock.calls)).not.toContain('legacy-code');
    warn.mockRestore();
  });

  it('prefers the companion document over a legacy public code', async () => {
    vi.stubEnv('COLLECTION_ACCESS_LEGACY_PUBLIC_FALLBACK', 'true');
    sanityFetch
      .mockResolvedValueOnce(COLLECTION)
      .mockResolvedValueOnce('legacy-code');

    expect((await submit('legacy-code')).status).toBe(401);
    expect(sanityFetch).toHaveBeenCalledTimes(1);
  });

  it('fails closed when the server read token is missing', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(getSanityServerClient).mockImplementation(() => {
      throw new SanityServerConfigError('SANITY_API_READ_TOKEN is not set.');
    });
    const res = await submit('garden-party');
    expect(res.status).toBe(500);
    expect(res.headers.get('set-cookie')).toBeNull();
    error.mockRestore();
  });

  it('reports a Sanity outage without granting access or leaking details', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    sanityFetch.mockRejectedValue(new Error('upstream 502 with token sk_live'));
    const res = await submit('garden-party');
    expect(res.status).toBe(503);
    expect(res.headers.get('set-cookie')).toBeNull();
    expect(JSON.stringify(error.mock.calls)).not.toContain('sk_live');
    error.mockRestore();
  });

  it('rejects a failed human check before reading Sanity', async () => {
    global.fetch = vi.fn(async () => ({
      json: async () => ({ success: false }),
    })) as any;
    const res = await submit('garden-party');
    expect(res.status).toBe(400);
    expect(sanityFetch).not.toHaveBeenCalled();
    expect(getDocument).not.toHaveBeenCalled();
  });

  it('limits attempts by IP before the human check', async () => {
    vi.mocked(enforceRateLimitRules).mockResolvedValueOnce({
      ok: false,
      message: 'Too many attempts. Please try again later.',
      retryAfterSeconds: 60,
    });
    const res = await submit('garden-party');
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('60');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(sanityFetch).not.toHaveBeenCalled();
  });

  it('blocks a collection that has too many failed attempts, before reading Sanity', async () => {
    vi.mocked(peekRateLimitRules).mockResolvedValueOnce({
      ok: false,
      message: 'Too many attempts for this collection.',
      retryAfterSeconds: 120,
    });
    const res = await submit('garden-party');
    expect(res.status).toBe(429);
    expect(sanityFetch).not.toHaveBeenCalled();

    const [[collectionRule]] = vi
      .mocked(peekRateLimitRules)
      .mock.calls.map((call) => call[0]);
    // Keyed by a hash of the collection ID, not the raw ID.
    expect(collectionRule.keyParts).not.toContain('collection-1');
  });

  it('counts a failed attempt against the collection', async () => {
    await submit('wrong-code');
    const rules = vi
      .mocked(enforceRateLimitRules)
      .mock.calls.map((call) => call[0][0].keyParts[1]);
    expect(rules).toEqual(['ip', 'collection-failures']);
  });

  it('does not count a successful unlock against the collection', async () => {
    await submit('garden-party');
    const rules = vi
      .mocked(enforceRateLimitRules)
      .mock.calls.map((call) => call[0][0].keyParts[1]);
    expect(rules).toEqual(['ip']);
  });

  it('rejects a malformed body', async () => {
    const res = await POST(
      createRequest({ password: 'no-id', token: 'turnstile' }),
    );
    expect(res.status).toBe(401);
    expect(sanityFetch).not.toHaveBeenCalled();
  });
});
