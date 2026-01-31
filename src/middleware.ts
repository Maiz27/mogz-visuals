import CryptoJS from 'crypto-js';
import { NextRequest, NextResponse } from 'next/server';
import { ENCRYPTION_KEY } from './lib/env';

export function middleware(req: NextRequest) {
  //   const url = req.nextUrl.clone();
  //   const cookies = req.cookies;
  //   const slug = url.searchParams.get('id');
  //   const encryptedCookie = cookies.get('collectionAccess');
  //   if (!encryptedCookie) {
  //     url.searchParams.delete('id');
  //     url.pathname = '/';
  //     return NextResponse.redirect(url);
  //   }
  //   const parsedCookie = JSON.parse(encryptedCookie.value);
  //   const decryptedSlug = CryptoJS.AES.decrypt(
  //     parsedCookie.slug,
  //     ENCRYPTION_KEY
  //   ).toString(CryptoJS.enc.Utf8);
  //   if (slug !== decryptedSlug) {
  //     url.searchParams.delete('id');
  //     url.pathname = '/';
  //     return NextResponse.redirect(url);
  //   }
  //   return NextResponse.next();
}

export const config = {
  //   matcher: '/private/:path*',
};
