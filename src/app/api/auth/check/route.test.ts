import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { POST as LOGOUT } from '../logout/route';
import {
  COLLECTION_ACCESS_TTL_MS,
  issueCollectionAccessToken,
} from '@/lib/server/collectionAccess';

vi.mock('@/lib/env', () => ({
  ENCRYPTION_KEY: 'test-key',
}));

const createRequest = (query = '', cookie?: string) =>
  new NextRequest(`http://localhost/api/auth/check${query}`, {
    headers: cookie ? { cookie } : undefined,
  });

describe('GET /api/auth/check', () => {
  it('reports the collection and expiry for a valid token', async () => {
    const { token, expiresAt } = issueCollectionAccessToken('collection-1');

    const res = await GET(
      createRequest('?id=collection-1', `collectionAccess=${token}`),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      authenticated: true,
      uniqueId: 'collection-1',
      expiresAt,
    });
  });

  it('refuses a token scoped to another collection', async () => {
    const { token } = issueCollectionAccessToken('collection-1');

    const res = await GET(
      createRequest('?id=collection-2', `collectionAccess=${token}`),
    );

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({
      authenticated: false,
      reason: 'mismatch',
    });
  });

  it('refuses an expired token', async () => {
    const { token } = issueCollectionAccessToken(
      'collection-1',
      Date.now() - COLLECTION_ACCESS_TTL_MS - 1000,
    );

    const res = await GET(
      createRequest('?id=collection-1', `collectionAccess=${token}`),
    );

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({ reason: 'expired' });
  });

  it('refuses a missing token', async () => {
    const res = await GET(createRequest('?id=collection-1'));

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({ reason: 'missing' });
  });
});

describe('POST /api/auth/logout', () => {
  it('expires the access cookie server-side', async () => {
    const res = await LOGOUT(
      new NextRequest('http://localhost/api/auth/logout', { method: 'POST' }),
    );

    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('collectionAccess=');
    expect(setCookie).toContain('Max-Age=0');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Path=/');
  });
});
