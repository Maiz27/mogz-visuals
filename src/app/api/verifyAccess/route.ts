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
// Failed attempts at one collection from one address. Scoped to the address so
// a stranger who knows a (discoverable) collection ID can only lock themselves
// out, never the client.
const ACCESS_COLLECTION_LIMIT = parseRateLimitNumber(
  process.env.ACCESS_RATE_LIMIT_COLLECTION,
  10,
);
const ACCESS_COLLECTION_WINDOW_MS = parseRateLimitNumber(
  process.env.ACCESS_RATE_LIMIT_COLLECTION_WINDOW,
  15 * 60 * 1000,
);
// Failed attempts at one collection from all addresses together: a high ceiling
// that only slows guessing spread across many addresses.
const ACCESS_COLLECTION_GLOBAL_LIMIT = parseRateLimitNumber(
  process.env.ACCESS_RATE_LIMIT_COLLECTION_GLOBAL,
  100,
);
const ACCESS_COLLECTION_GLOBAL_WINDOW_MS = parseRateLimitNumber(
  process.env.ACCESS_RATE_LIMIT_COLLECTION_GLOBAL_WINDOW,
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

  // Failed attempts only, checked before and counted after the code check.
  const collectionHash = hashRateLimitValue(id.trim());
  const failureRules = [
    {
      keyParts: ['access', 'source-failures', collectionHash, getClientIp(req)],
      limit: ACCESS_COLLECTION_LIMIT,
      windowMs: ACCESS_COLLECTION_WINDOW_MS,
      message: 'Too many attempts for this collection. Please try again later.',
    },
    {
      keyParts: ['access', 'collection-failures', collectionHash],
      limit: ACCESS_COLLECTION_GLOBAL_LIMIT,
      windowMs: ACCESS_COLLECTION_GLOBAL_WINDOW_MS,
      message: 'Too many attempts for this collection. Please try again later.',
    },
  ];
  const collectionLimit = await peekRateLimitRules(failureRules);
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
    // Count against both; one call per rule so neither is skipped.
    await Promise.all(
      failureRules.map((rule) => enforceRateLimitRules([rule])),
    );
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
