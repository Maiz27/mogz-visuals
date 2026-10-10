import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { POST } from './route';
import { signPayload } from '@/lib/server/sanityWebhook';

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));

const SECRET = 'webhook-secret';
const BODY = JSON.stringify({ _id: 'abc', _type: 'heroImages' });

const request = (signature?: string, body = BODY) =>
  new NextRequest('http://localhost/api/revalidate', {
    method: 'POST',
    body,
    headers: signature ? { 'sanity-webhook-signature': signature } : {},
  });

const signed = (body = BODY, secret = SECRET) => {
  const t = Date.now();
  return `t=${t},v1=${signPayload(body, t, secret)}`;
};

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('SANITY_REVALIDATE_SECRET', SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('expires the Sanity cache tag for a signed delivery', async () => {
    const res = await POST(request(signed()));
    expect(res.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith('sanity');
  });

  it("accepts a delivery signed by Sanity's official @sanity/webhook", async () => {
    // Fixture generated with @sanity/webhook@4 encodeSignatureHeader().
    vi.useFakeTimers();
    vi.setSystemTime(1_760_000_000_000);
    vi.stubEnv('SANITY_REVALIDATE_SECRET', 'mogz-test-secret');
    try {
      const res = await POST(
        request(
          't=1760000000000,v1=tB5pn8cihsGJ40-rNSWkPGsEt_1QgXT3u_qD_M-pQBQ',
          JSON.stringify({ _id: 'hero-1', _type: 'heroImages' }),
        ),
      );
      expect(res.status).toBe(200);
      expect(revalidateTag).toHaveBeenCalledWith('sanity');
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects an unsigned or wrongly signed delivery without revalidating', async () => {
    expect((await POST(request())).status).toBe(401);
    expect((await POST(request(signed(BODY, 'wrong')))).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('fails closed when the secret is not configured', async () => {
    vi.stubEnv('SANITY_REVALIDATE_SECRET', '');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await POST(request(signed()))).status).toBe(500);
    expect(revalidateTag).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
