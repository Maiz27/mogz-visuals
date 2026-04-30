import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { enforceRateLimitRules } from '@/lib/server/rateLimit';

vi.mock('@/lib/server/rateLimit', () => ({
  enforceRateLimitRules: vi.fn(),
  getClientIp: vi.fn(() => '127.0.0.1'),
  getRateLimitHeaders: vi.fn(() => ({ 'Retry-After': '60' })),
  parseRateLimitNumber: vi.fn((_value: string | undefined, fallback: number) => fallback),
}));

describe('GET /api/rateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(enforceRateLimitRules).mockResolvedValue({
      ok: true,
      enabled: false,
    });
  });

  it('returns 200 for an allowed download-all request', async () => {
    const response = await GET(
      new NextRequest('http://localhost/api/rateLimit?id=download-all'),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ message: 'Success', status: 200 });
  });

  it('returns 429 when the download-all request is limited', async () => {
    vi.mocked(enforceRateLimitRules).mockResolvedValue({
      ok: false,
      message:
        'Too many full collection download attempts. Please try again later.',
      retryAfterSeconds: 60,
    });

    const response = await GET(
      new NextRequest('http://localhost/api/rateLimit?id=download-all'),
    );
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data).toEqual({
      message:
        'Too many full collection download attempts. Please try again later.',
      status: 429,
    });
  });

  it('returns 400 for invalid parameters', async () => {
    const response = await GET(
      new NextRequest('http://localhost/api/rateLimit?id=download-part'),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      message: 'Invalid request parameters',
      status: 400,
    });
  });
});
