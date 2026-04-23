import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { enforceRateLimitRules } from '@/lib/server/rateLimit';

vi.mock('@/lib/server/rateLimit', () => ({
  enforceRateLimitRules: vi.fn(),
  getClientIp: vi.fn(() => '127.0.0.1'),
  getRateLimitHeaders: vi.fn(() => ({ 'Retry-After': '60' })),
  hashRateLimitValue: vi.fn((value: string) => `hash:${value}`),
  normalizeRateLimitEmail: vi.fn((value: string) => value.trim().toLowerCase()),
  parseRateLimitNumber: vi.fn((_value: string | undefined, fallback: number) => fallback),
}));

vi.mock('resend', () => {
  return {
    Resend: class {
      emails = {
        send: vi.fn().mockResolvedValue({ data: { id: 'email-id' }, error: null }),
      };
    },
  };
});

describe('POST /api/contact', () => {
  const validPayload = {
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello there',
    token: 'valid-token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(enforceRateLimitRules).mockResolvedValue({
      ok: true,
      enabled: false,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }) as any;
  });

  it('returns 200 for a valid contact request', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify(validPayload),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('email-id');
  });

  it('returns 429 when contact requests are rate limited', async () => {
    vi.mocked(enforceRateLimitRules).mockResolvedValue({
      ok: false,
      message: 'Too many contact attempts. Please try again later.',
      retryAfterSeconds: 60,
    });

    const response = await POST(
      new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify(validPayload),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.message).toBe('Too many contact attempts. Please try again later.');
  });

  it('returns 429 when the identity limiter blocks a verified request', async () => {
    vi.mocked(enforceRateLimitRules)
      .mockResolvedValueOnce({
        ok: true,
        enabled: false,
      })
      .mockResolvedValueOnce({
        ok: false,
        message:
          'We recently received several messages from this email address. Please wait before trying again.',
        retryAfterSeconds: 60,
      });

    const response = await POST(
      new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify(validPayload),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.message).toBe(
      'We recently received several messages from this email address. Please wait before trying again.',
    );
    expect(enforceRateLimitRules).toHaveBeenCalledTimes(2);
  });

  it('returns 400 when turnstile verification fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false }),
    }) as any;

    const response = await POST(
      new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify(validPayload),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Invalid Turnstile Token');
    expect(enforceRateLimitRules).toHaveBeenCalledTimes(1);
  });
});
