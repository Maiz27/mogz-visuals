import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { fetchSanityData } from '@/lib/sanity/client';
import {
  COLLECTION_ACCESS_TTL_MS,
  issueCollectionAccessToken,
} from '@/lib/server/collectionAccess';

// Mock Dependencies
vi.mock('@/lib/sanity/client', () => ({
  fetchSanityData: vi.fn(),
}));

vi.mock('@/lib/env', () => ({
  ENCRYPTION_KEY: 'test-key',
}));

describe('POST /api/download/info', () => {
  const mockFetchSanity = vi.mocked(fetchSanityData);

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  const createRequest = (body: FormData, cookie?: string) =>
    new NextRequest('http://localhost/api/download/info', {
      method: 'POST',
      body,
      headers: cookie ? { cookie } : undefined,
    });

  const privateFormData = () => {
    const formData = new FormData();
    formData.append('collectionId', 'private-1');
    formData.append('isPrivate', 'true');
    return formData;
  };

  it('should calculate size using correct sample ratio', async () => {
    // Mock Sanity Data: 20 items, each 1000 bytes
    const mockItems = Array.from({ length: 20 }, (_, i) => ({
      url: `http://cdn.sanity.io/img${i}.jpg`,
      size: 1000,
    }));

    mockFetchSanity.mockResolvedValue({
      title: 'Test Collection',
      gallery: mockItems,
    });

    // Mock HEAD requests: Real size is 500 bytes (0.5 ratio)
    (global.fetch as any).mockResolvedValue({
      ok: true,
      headers: { get: () => '500' },
    });

    const formData = new FormData();
    formData.append('slug', 'test-slug');

    const res = await POST(createRequest(formData));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.count).toBe(20);
    // Logic:
    // Ratio = 500 / 1000 = 0.5
    // Total Size = (20 * 1000 * 0.5) + Overhead(approx)
    // 10,000 + Overhead.
    // We just verify it's less than raw size (20000)
    expect(data.size).toBeLessThan(20000);
    expect(data.size).toBeGreaterThan(10000);
  });

  it('should retry HEAD requests on failure', async () => {
    const mockItems = [{ url: 'http://cdn.sanity.io/img1.jpg', size: 1000 }];
    mockFetchSanity.mockResolvedValue({
      title: 'Retry Test',
      gallery: mockItems,
    });

    // Mock Fetch: Fail twice, succeed third time
    const fetchMock = global.fetch as any;
    fetchMock
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue({
        ok: true,
        headers: { get: () => '500' },
      });

    const formData = new FormData();
    formData.append('slug', 'retry-test');

    await POST(createRequest(formData));

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('should include User-Agent in HEAD requests', async () => {
    mockFetchSanity.mockResolvedValue({
      title: 'UA Test',
      gallery: [{ url: 'http://cdn.sanity.io/img1.jpg', size: 1000 }],
    });
    (global.fetch as any).mockResolvedValue({
      ok: true,
      headers: { get: () => '500' },
    });

    const formData = new FormData();
    formData.append('slug', 'ua-test');

    await POST(createRequest(formData));

    const calls = (global.fetch as any).mock.calls;
    const headers = calls[0][1].headers;
    expect(headers['User-Agent']).toBeDefined();
    expect(headers['User-Agent']).toContain('Mozilla');
  });

  it('should return null (ratio 1) if all HEAD requests fail', async () => {
    mockFetchSanity.mockResolvedValue({
      title: 'Fail Test',
      gallery: [{ url: 'http://cdn.sanity.io/img1.jpg', size: 1000 }],
    });
    // Always fail
    (global.fetch as any).mockResolvedValue({ ok: false, status: 500 });

    const formData = new FormData();
    formData.append('slug', 'fail-test');

    const res = await POST(createRequest(formData));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(typeof data.size).toBe('number');
    expect(data.size).toBeGreaterThan(1000);
  });

  it('rejects private collections without a token', async () => {
    const res = await POST(createRequest(privateFormData()));

    expect(res.status).toBe(401);
    expect(mockFetchSanity).not.toHaveBeenCalled();
  });

  it('rejects a token issued for another collection', async () => {
    const res = await POST(
      createRequest(
        privateFormData(),
        `collectionAccess=${issueCollectionAccessToken('private-2').token}`,
      ),
    );

    expect(res.status).toBe(401);
    expect(mockFetchSanity).not.toHaveBeenCalled();
  });

  it('rejects malformed and expired tokens', async () => {
    const malformed = await POST(
      createRequest(privateFormData(), 'collectionAccess=nonsense'),
    );
    expect(malformed.status).toBe(401);

    const expired = await POST(
      createRequest(
        privateFormData(),
        `collectionAccess=${
          issueCollectionAccessToken(
            'private-1',
            Date.now() - COLLECTION_ACCESS_TTL_MS - 1000,
          ).token
        }`,
      ),
    );
    expect(expired.status).toBe(401);
    expect(mockFetchSanity).not.toHaveBeenCalled();
  });

  it('serves private collections for a valid scoped token', async () => {
    mockFetchSanity.mockResolvedValue({
      title: 'Private Collection',
      gallery: [{ url: 'http://cdn.sanity.io/img1.jpg', size: 1000 }],
    });
    (global.fetch as any).mockResolvedValue({
      ok: true,
      headers: { get: () => '500' },
    });

    const res = await POST(
      createRequest(
        privateFormData(),
        `collectionAccess=${issueCollectionAccessToken('private-1').token}`,
      ),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ count: 1 });
  });
});
