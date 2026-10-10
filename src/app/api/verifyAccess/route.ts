import { NextRequest, NextResponse } from 'next/server';
import { VERIFY_ACCESS_RESPONSE_BODY } from '@/lib/types';
import {
  issueCollectionAccessToken,
  setCollectionAccessCookie,
} from '@/lib/server/collectionAccess';
import { checkCollectionAccessCode } from '@/lib/server/collectionSecret';
import { SanityServerConfigError } from '@/lib/sanity/serverClient';
import {
  enforceRateLimitRules,
  getClientIp,
  hashRateLimitValue,
  parseRateLimitNumber,
  peekRateLimitRules,
} from '@/lib/server/rateLimit';
import {
  createRateLimitedResponse,
  verifyTurnstileToken,
} from '@/lib/server/request';

const INVALID_CREDENTIALS = {
  message: 'Invalid collection ID or password',
  status: 401,
} as const;

// Broad guessing across collections from one address.
const ACCESS_IP_LIMIT = parseRateLimitNumber(
  process.env.ACCESS_RATE_LIMIT_IP,
  20,
);
const ACCESS_IP_WINDOW_MS = parseRateLimitNumber(
  process.env.ACCESS_RATE_LIMIT_IP_WINDOW,
  15 * 60 * 1000,
);
// Focused guessing at one collection, from any number of addresses: failed
// attempts only.
const ACCESS_COLLECTION_LIMIT = parseRateLimitNumber(
  process.env.ACCESS_RATE_LIMIT_COLLECTION,
  10,
);
const ACCESS_COLLECTION_WINDOW_MS = parseRateLimitNumber(
  process.env.ACCESS_RATE_LIMIT_COLLECTION_WINDOW,
  15 * 60 * 1000,
);

export async function POST(req: NextRequest) {
  let requestBody: unknown;

  try {
    requestBody = await req.json();
  } catch {
    return NextResponse.json(
      { message: 'Invalid request body', status: 400 },
      { status: 400 },
    );
  }

  const { id, password, token } = (requestBody ?? {}) as Record<
    string,
    unknown
  >;

  if (typeof id !== 'string' || !id || typeof password !== 'string') {
    return NextResponse.json(INVALID_CREDENTIALS, { status: 401 });
  }

  const ipLimit = await enforceRateLimitRules([
    {
      keyParts: ['access', 'ip', getClientIp(req)],
      limit: ACCESS_IP_LIMIT,
      windowMs: ACCESS_IP_WINDOW_MS,
      message: 'Too many attempts. Please try again later.',
    },
  ]);
  if (!ipLimit.ok) {
    return createRateLimitedResponse(ipLimit);
  }

  if (!(await verifyTurnstileToken(String(token ?? '')))) {
    return NextResponse.json(
      { message: 'Invalid Turnstile Token', status: 400 },
      { status: 400 },
    );
  }

  // Counts failed attempts only. Collection IDs are discoverable, so counting
  // every attempt would let anyone lock a client out of their own gallery.
  const collectionFailureRule = {
    keyParts: ['access', 'collection-failures', hashRateLimitValue(id.trim())],
    limit: ACCESS_COLLECTION_LIMIT,
    windowMs: ACCESS_COLLECTION_WINDOW_MS,
    message: 'Too many attempts for this collection. Please try again later.',
  };
  const collectionLimit = await peekRateLimitRules([collectionFailureRule]);
  if (!collectionLimit.ok) {
    return createRateLimitedResponse(collectionLimit);
  }

  let check;
  try {
    check = await checkCollectionAccessCode(id, password);
  } catch (error) {
    // Fail closed: never fall back to the public client or skip the check.
    if (error instanceof SanityServerConfigError) {
      console.error('[Access] Server Sanity client is not configured');
      return NextResponse.json(
        { message: 'Server configuration error', status: 500 },
        { status: 500 },
      );
    }
    console.error('[Access] Access check failed', {
      name: error instanceof Error ? error.name : 'unknown',
    });
    return NextResponse.json(
      { message: 'Unable to verify access right now', status: 503 },
      { status: 503 },
    );
  }

  if (!check.ok) {
    await enforceRateLimitRules([collectionFailureRule]);
    return NextResponse.json(INVALID_CREDENTIALS, { status: 401 });
  }

  const { token: accessToken, expiresAt } = issueCollectionAccessToken(
    check.uniqueId,
  );

  const responseBody: VERIFY_ACCESS_RESPONSE_BODY = {
    status: 200,
    message: 'Access granted, redirecting...',
    id: check.uniqueId,
    expiresAt,
  };

  const response = NextResponse.json(responseBody, { status: 200 });
  setCollectionAccessCookie(req, response, accessToken, expiresAt);

  return response;
}
