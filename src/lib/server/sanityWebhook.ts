import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verifies a Sanity webhook signature without extra dependencies. Same scheme as
 * Sanity's official @sanity/webhook package:
 *
 *   sanity-webhook-signature: t=<unix ms>,v1=<base64url HMAC-SHA256>
 *   HMAC input: `${t}.${rawBody}`
 *
 * Also rejects stale timestamps, so a captured delivery can't be replayed later.
 */

export const SIGNATURE_HEADER = 'sanity-webhook-signature';
export const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000;
const MAX_CLOCK_SKEW_MS = 60 * 1000;
const HEADER_PATTERN = /^t=(\d{10,16})[, ]+v1=([A-Za-z0-9_-]{43})$/;

export type SignatureCheck =
  | { ok: true }
  | { ok: false; reason: 'missing' | 'malformed' | 'stale' | 'mismatch' };

export const signPayload = (
  rawBody: string,
  timestamp: number,
  secret: string,
) =>
  createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('base64url');

export function verifySanitySignature(
  rawBody: string,
  header: string | null | undefined,
  secret: string,
  now: number = Date.now(),
): SignatureCheck {
  if (!header) return { ok: false, reason: 'missing' };

  const match = header.trim().match(HEADER_PATTERN);
  if (!match) return { ok: false, reason: 'malformed' };

  const timestamp = Number(match[1]);
  if (
    !Number.isSafeInteger(timestamp) ||
    now - timestamp > MAX_SIGNATURE_AGE_MS ||
    timestamp - now > MAX_CLOCK_SKEW_MS
  ) {
    return { ok: false, reason: 'stale' };
  }

  const expected = Buffer.from(signPayload(rawBody, timestamp, secret));
  const received = Buffer.from(match[2]);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return { ok: false, reason: 'mismatch' };
  }

  return { ok: true };
}
