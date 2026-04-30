import { NextRequest, NextResponse } from 'next/server';
import {
  enforceRateLimitRules,
  getClientIp,
  parseRateLimitNumber,
} from '@/lib/server/rateLimit';
import { createRateLimitedResponse } from '@/lib/server/request';

const DOWNLOAD_ALL_LIMIT = parseRateLimitNumber(
  process.env.DOWNLOAD_ALL_RATE_LIMIT ?? process.env.RATE_LIMIT,
  5,
);
const DOWNLOAD_PART_LIMIT = parseRateLimitNumber(
  process.env.DOWNLOAD_PART_RATE_LIMIT_PER_COLLECTION ??
    process.env.RATE_LIMIT_PARTIAL_PER_COLLECTION,
  15,
);
const DOWNLOAD_WINDOW_MS = parseRateLimitNumber(
  process.env.DOWNLOAD_LEGACY_RATE_LIMIT_WINDOW ??
    process.env.RATE_LIMIT_WINDOW,
  2 * 60 * 60 * 1000,
);

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const collectionId = req.nextUrl.searchParams.get('collectionId');
  const ipAddress = getClientIp(req);

  const rule =
    id === 'download-all'
      ? {
          keyParts: ['download', 'all', 'ip', ipAddress],
          limit: DOWNLOAD_ALL_LIMIT,
          windowMs: DOWNLOAD_WINDOW_MS,
          message:
            'Too many full collection download attempts. Please try again later.',
        }
      : id === 'download-part' && collectionId
        ? {
            keyParts: ['download', 'part', collectionId, 'ip', ipAddress],
            limit: DOWNLOAD_PART_LIMIT,
            windowMs: DOWNLOAD_WINDOW_MS,
            message:
              'Too many part download attempts for this collection. Please try again later.',
          }
        : null;

  if (!rule) {
    return NextResponse.json(
      { message: 'Invalid request parameters', status: 400 },
      { status: 400 },
    );
  }

  try {
    const result = await enforceRateLimitRules([rule]);
    if (!result.ok) {
      return createRateLimitedResponse(result);
    }

    return NextResponse.json(
      { message: 'Success', status: 200 },
      { status: 200 },
    );
  } catch (error) {
    console.error('Rate limiting error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        status: 500,
      },
      { status: 500 },
    );
  }
}
