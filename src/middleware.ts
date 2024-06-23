import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const cookies = req.cookies;

  const slug = url.searchParams.get('slug');

  const collectionCookie = cookies.get(slug ?? '');

  if (!collectionCookie) {
    url.searchParams.delete('slug');
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/private/:path*',
};
