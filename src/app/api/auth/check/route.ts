import { NextRequest, NextResponse } from 'next/server';
import { readCollectionAccess } from '@/lib/server/collectionAccess';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const expectedCollectionId = req.nextUrl.searchParams.get('id');
  const access = readCollectionAccess(req, expectedCollectionId);

  if (!access.ok) {
    return NextResponse.json(
      { authenticated: false, reason: access.reason },
      { status: 401 },
    );
  }

  return NextResponse.json({
    authenticated: true,
    uniqueId: access.collectionId,
    expiresAt: access.expiresAt,
  });
}
