import type { NextRequest, NextResponse } from 'next/server';
import { signToken, verifyToken } from './signedToken';

/**
 * The single source of truth for private-collection authorization.
 *
 * Every server path that returns private collection metadata or images must go
 * through `verifyCollectionAccessToken` (or `readCollectionAccess`) before it
 * touches Sanity. The token is scoped to one collection id, so a session for
 * one collection can never read another.
 */

export const COLLECTION_ACCESS_COOKIE = 'collectionAccess';
export const COLLECTION_ACCESS_TTL_MS = 60 * 60 * 1000; // 1 hour

const TOKEN_PURPOSE = 'collection-access';

type CollectionAccessPayload = {
  cid: string;
};

export type CollectionAccessFailure =
  | 'missing'
  | 'malformed'
  | 'expired'
  | 'mismatch';

export type CollectionAccessResult =
  | { ok: true; collectionId: string; expiresAt: number }
  | { ok: false; reason: CollectionAccessFailure };

export const issueCollectionAccessToken = (
  collectionId: string,
  now: number = Date.now(),
) => {
  const expiresAt = now + COLLECTION_ACCESS_TTL_MS;

  return {
    token: signToken<CollectionAccessPayload>(
      TOKEN_PURPOSE,
      { cid: collectionId },
      expiresAt,
    ),
    expiresAt,
  };
};

export const verifyCollectionAccessToken = (
  token: string | undefined | null,
  expectedCollectionId?: string | null,
  now: number = Date.now(),
): CollectionAccessResult => {
  const result = verifyToken<CollectionAccessPayload>(
    TOKEN_PURPOSE,
    token,
    now,
  );

  if (!result.ok) {
    if (result.reason === 'missing') {
      return { ok: false, reason: 'missing' };
    }
    if (result.reason === 'expired') {
      return { ok: false, reason: 'expired' };
    }
    return { ok: false, reason: 'malformed' };
  }

  const collectionId = result.payload.cid;
  if (typeof collectionId !== 'string' || !collectionId) {
    return { ok: false, reason: 'malformed' };
  }

  if (expectedCollectionId && collectionId !== expectedCollectionId) {
    return { ok: false, reason: 'mismatch' };
  }

  return { ok: true, collectionId, expiresAt: result.expiresAt };
};

export const readCollectionAccess = (
  req: NextRequest,
  expectedCollectionId?: string | null,
  now: number = Date.now(),
): CollectionAccessResult =>
  verifyCollectionAccessToken(
    req.cookies.get(COLLECTION_ACCESS_COOKIE)?.value,
    expectedCollectionId,
    now,
  );

/**
 * `Secure` must be set in production, but it would make the cookie unusable on
 * a plain-http local dev server, so mirror the request's own scheme.
 */
const isSecureRequest = (req: NextRequest) => {
  if (process.env.NODE_ENV === 'production') {
    return true;
  }

  const forwardedProto = req.headers
    .get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim()
    .toLowerCase();

  return forwardedProto === 'https' || req.nextUrl.protocol === 'https:';
};

export const setCollectionAccessCookie = (
  req: NextRequest,
  res: NextResponse,
  token: string,
  expiresAt: number,
) => {
  res.cookies.set({
    name: COLLECTION_ACCESS_COOKIE,
    value: token,
    httpOnly: true,
    secure: isSecureRequest(req),
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
    maxAge: Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
  });
};

export const clearCollectionAccessCookie = (
  req: NextRequest,
  res: NextResponse,
) => {
  res.cookies.set({
    name: COLLECTION_ACCESS_COOKIE,
    value: '',
    httpOnly: true,
    secure: isSecureRequest(req),
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });
};
