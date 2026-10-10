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
