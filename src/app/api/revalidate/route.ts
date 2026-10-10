import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { SANITY_CACHE_TAG } from '@/lib/sanity/cacheTags';
import {
  SIGNATURE_HEADER,
  verifySanitySignature,
} from '@/lib/server/sanityWebhook';

export const runtime = 'nodejs';

/**
 * Sanity webhook: on any content change, expire the cached Sanity reads so the
 * site shows the edit on the next request. Configure the webhook in Sanity
 * (see README) with the same secret as SANITY_REVALIDATE_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    console.error('[Revalidate] SANITY_REVALIDATE_SECRET is not configured');
    return NextResponse.json(
      { message: 'Revalidation is not configured.' },
      { status: 500 },
    );
  }

  const rawBody = await req.text();
  const check = verifySanitySignature(
    rawBody,
    req.headers.get(SIGNATURE_HEADER),
    secret,
  );
  if (!check.ok) {
    return NextResponse.json(
      { message: 'Invalid webhook signature.' },
      { status: 401 },
    );
  }

  revalidateTag(SANITY_CACHE_TAG);

  return NextResponse.json({ ok: true, revalidated: [SANITY_CACHE_TAG] });
}
