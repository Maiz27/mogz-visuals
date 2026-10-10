import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { fetchSanityData } from '@/lib/sanity/client';
import {
  COLLECTION_ACCESS_TTL_MS,
  issueCollectionAccessToken,
} from '@/lib/server/collectionAccess';

vi.mock('@/lib/sanity/client', () => ({
  fetchSanityData: vi.fn(),
}));

vi.mock('@/lib/env', () => ({
  ENCRYPTION_KEY: 'test-key',
}));

const PRIVATE_IMAGES = ['https://cdn.sanity.io/private-1.jpg'];

const createRequest = (query: string, cookie?: string) =>
  new NextRequest(`http://localhost/api/gallery?${query}`, {
    headers: cookie ? { cookie } : undefined,
  });

const accessCookie = (collectionId: string, issuedAt?: number) =>
  `collectionAccess=${issueCollectionAccessToken(collectionId, issuedAt).token}`;

describe('GET /api/gallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchSanityData).mockResolvedValue(PRIVATE_IMAGES);
  });

  it('serves public segments without a token', async () => {
    const res = await GET(
      createRequest('collectionId=public-slug&isPrivate=false&start=0&end=20'),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(PRIVATE_IMAGES);
  });

  it('rejects direct private access with no token', async () => {
    const res = await GET(
      createRequest('collectionId=private-1&isPrivate=true&start=0&end=20'),
    );

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: 'Unauthorized' });
    expect(fetchSanityData).not.toHaveBeenCalled();
  });

  it('rejects a token issued for a different collection', async () => {
    const res = await GET(
      createRequest(
        'collectionId=private-2&isPrivate=true&start=0&end=20',
        accessCookie('private-1'),
      ),
    );

    expect(res.status).toBe(401);
    expect(fetchSanityData).not.toHaveBeenCalled();
  });

  it('rejects a malformed token', async () => {
    const res = await GET(
      createRequest(
        'collectionId=private-1&isPrivate=true&start=0&end=20',
        'collectionAccess=not-a-real-token',
      ),
    );

    expect(res.status).toBe(401);
    expect(fetchSanityData).not.toHaveBeenCalled();
  });

  it('rejects an expired token', async () => {
    const res = await GET(
      createRequest(
        'collectionId=private-1&isPrivate=true&start=0&end=20',
        accessCookie('private-1', Date.now() - COLLECTION_ACCESS_TTL_MS - 1000),
      ),
    );

    expect(res.status).toBe(401);
    expect(fetchSanityData).not.toHaveBeenCalled();
  });

  it('serves private segments for a valid scoped token', async () => {
    const res = await GET(
      createRequest(
        'collectionId=private-1&isPrivate=true&start=0&end=20',
        accessCookie('private-1'),
      ),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(PRIVATE_IMAGES);
    expect(fetchSanityData).toHaveBeenCalledWith(expect.any(String), {
      id: 'private-1',
      start: 0,
      end: 20,
    });
  });

  it('rejects a request with no collection id', async () => {
    const res = await GET(createRequest('isPrivate=true&start=0&end=20'));

    expect(res.status).toBe(400);
    expect(fetchSanityData).not.toHaveBeenCalled();
  });
});
