import crypto from 'node:crypto';
import { ENCRYPTION_KEY } from '@/lib/env';

/**
 * Compact, authenticated tokens: `v1.<base64url(payload)>.<base64url(hmac)>`.
 *
 * The payload is signed, not encrypted — never put a secret in it. Signing keys
 * are derived per purpose so a token minted for one purpose can never be
 * replayed against another.
 */

const TOKEN_VERSION = 'v1';
const SIGNING_INFO_PREFIX = 'mogz:signed-token:';

const signingKeys = new Map<string, Buffer>();

const getSigningKey = (purpose: string) => {
  const cached = signingKeys.get(purpose);
  if (cached) {
    return cached;
  }

  const key = Buffer.from(
    crypto.hkdfSync(
      'sha256',
      Buffer.from(ENCRYPTION_KEY, 'utf8'),
      Buffer.alloc(0),
      Buffer.from(`${SIGNING_INFO_PREFIX}${purpose}`, 'utf8'),
      32,
    ),
  );

  signingKeys.set(purpose, key);
  return key;
};

const sign = (purpose: string, data: string) =>
  crypto.createHmac('sha256', getSigningKey(purpose)).update(data).digest();

export type SignedTokenFailure =
  | 'missing'
  | 'malformed'
  | 'signature'
  | 'expired';

export type SignedTokenResult<T> =
  | { ok: true; payload: T; expiresAt: number }
  | { ok: false; reason: SignedTokenFailure };

type WithExpiry = { exp: number };

export const signToken = <T extends object>(
  purpose: string,
  payload: T,
  expiresAt: number,
) => {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: expiresAt }),
    'utf8',
  ).toString('base64url');
  const signed = `${TOKEN_VERSION}.${body}`;

  return `${signed}.${sign(purpose, signed).toString('base64url')}`;
};

export const verifyToken = <T extends object>(
  purpose: string,
  token: string | undefined | null,
  now: number = Date.now(),
): SignedTokenResult<T & WithExpiry> => {
  if (!token) {
    return { ok: false, reason: 'missing' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { ok: false, reason: 'malformed' };
  }

  const [version, body, signature] = parts;
  if (version !== TOKEN_VERSION || !body || !signature) {
    return { ok: false, reason: 'malformed' };
  }

  const expected = sign(purpose, `${version}.${body}`);
  const provided = Buffer.from(signature, 'base64url');

  if (
    provided.length !== expected.length ||
    !crypto.timingSafeEqual(provided, expected)
  ) {
    return { ok: false, reason: 'signature' };
  }

  let payload: T & WithExpiry;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  if (
    !payload ||
    typeof payload !== 'object' ||
    typeof payload.exp !== 'number' ||
    !Number.isFinite(payload.exp)
  ) {
    return { ok: false, reason: 'malformed' };
  }

  if (payload.exp <= now) {
    return { ok: false, reason: 'expired' };
  }

  return { ok: true, payload, expiresAt: payload.exp };
};
