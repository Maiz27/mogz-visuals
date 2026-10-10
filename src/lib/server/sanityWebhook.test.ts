import { describe, expect, it } from 'vitest';
import {
  MAX_SIGNATURE_AGE_MS,
  signPayload,
  verifySanitySignature,
} from './sanityWebhook';

const SECRET = 'webhook-secret';
const BODY = JSON.stringify({ _id: 'abc', _type: 'collection' });
const NOW = 1_760_000_000_000;
const header = (body = BODY, t = NOW, secret = SECRET) =>
  `t=${t},v1=${signPayload(body, t, secret)}`;

describe('verifySanitySignature', () => {
  it('accepts a correctly signed, fresh delivery', () => {
    expect(verifySanitySignature(BODY, header(), SECRET, NOW)).toEqual({ ok: true });
  });

  it("verifies a header produced by Sanity's official @sanity/webhook", () => {
    // Generated independently with @sanity/webhook@4 encodeSignatureHeader():
    // payload below, timestamp 1760000000000, secret "mogz-test-secret".
    const body = JSON.stringify({ _id: 'hero-1', _type: 'heroImages' });
    const official =
      't=1760000000000,v1=tB5pn8cihsGJ40-rNSWkPGsEt_1QgXT3u_qD_M-pQBQ';
    expect(
      verifySanitySignature(body, official, 'mogz-test-secret', NOW),
    ).toEqual({ ok: true });
    expect(signPayload(body, 1_760_000_000_000, 'mogz-test-secret')).toBe(
      'tB5pn8cihsGJ40-rNSWkPGsEt_1QgXT3u_qD_M-pQBQ',
    );
  });

  it('rejects a missing or malformed header', () => {
    expect(verifySanitySignature(BODY, null, SECRET, NOW)).toEqual({ ok: false, reason: 'missing' });
    expect(verifySanitySignature(BODY, 'v1=abc', SECRET, NOW).ok).toBe(false);
    expect(verifySanitySignature(BODY, `t=${NOW},v1=!!!`, SECRET, NOW).ok).toBe(false);
  });

  it('rejects a different secret or a tampered body', () => {
    expect(verifySanitySignature(BODY, header(BODY, NOW, 'other'), SECRET, NOW)).toEqual({ ok: false, reason: 'mismatch' });
    expect(verifySanitySignature(`${BODY} `, header(), SECRET, NOW)).toEqual({ ok: false, reason: 'mismatch' });
  });

  it('rejects a replayed old delivery and a timestamp far in the future', () => {
    const old = NOW - MAX_SIGNATURE_AGE_MS - 1;
    expect(verifySanitySignature(BODY, header(BODY, old), SECRET, NOW)).toEqual({ ok: false, reason: 'stale' });
    const future = NOW + 5 * 60 * 1000;
    expect(verifySanitySignature(BODY, header(BODY, future), SECRET, NOW)).toEqual({ ok: false, reason: 'stale' });
  });
});
