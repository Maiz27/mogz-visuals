import { describe, expect, it } from 'vitest';
import { getClientIp } from './rateLimit';

const withHeaders = (headers: Record<string, string>) => ({
  headers: new Headers(headers),
});

describe('getClientIp', () => {
  it("uses Cloudflare's client address", () => {
    expect(
      getClientIp(
        withHeaders({
          'cf-connecting-ip': '203.0.113.9',
          'x-forwarded-for': '198.51.100.7',
        }),
      ),
    ).toBe('203.0.113.9');
  });

  it('accepts an IPv6 client address', () => {
    expect(getClientIp(withHeaders({ 'cf-connecting-ip': '2001:db8::1' }))).toBe(
      '2001:db8::1',
    );
  });

  it('ignores a Cloudflare header that is not an IP address', () => {
    expect(
      getClientIp(
        withHeaders({
          'cf-connecting-ip': `rotating-bucket-${Math.random()}`,
          'x-forwarded-for': '198.51.100.7, 10.0.0.1',
        }),
      ),
    ).toBe('198.51.100.7');
  });
});
