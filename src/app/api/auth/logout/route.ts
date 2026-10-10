import { NextRequest, NextResponse } from 'next/server';
import { clearCollectionAccessCookie } from '@/lib/server/collectionAccess';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out' });

  // Expire the httpOnly cookie with the same attributes it was issued under,
  // otherwise the browser keeps the original cookie.
  clearCollectionAccessCookie(req, response);

  return response;
}
