import { NextResponse } from 'next/server';
import type { RateLimitFailure } from '@/lib/server/rateLimit';
import { getRateLimitHeaders } from '@/lib/server/rateLimit';

export function isJsonObject(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function createRateLimitedResponse(result: RateLimitFailure) {
  return NextResponse.json(
    { message: result.message, status: 429 },
    {
      status: 429,
      headers: getRateLimitHeaders(result),
    },
  );
}

export async function verifyTurnstileToken(token: string) {
  const verifyResponse = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    },
  );
  const verifyData = await verifyResponse.json();

  return Boolean(verifyData.success);
}
