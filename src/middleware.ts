import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Get the cookies from the request
  const url = req.url;
  const cookies = req.cookies;

  // [ 'http:', '', 'domain', 'gallery', '${slug}' ]
  const slug = url.split('/')[4];

  const collectionCookie = cookies.get(slug ?? '');

  if (!collectionCookie) {
    return NextResponse.next();
  }

  // Encode the cookie value
  const encodedValue = encodeURIComponent(collectionCookie.value);

  // Rewrite the URL to include the cookie as a query parameter
  return NextResponse.rewrite(`${url}?${slug}=${encodedValue}`);
}

export const config = {
  matcher: '/gallery/:path*',
};
