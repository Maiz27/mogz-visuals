import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out' });

  // Clear the httpOnly cookie by setting maxAge to 0
  response.cookies.delete('collectionAccess');

  return response;
}
