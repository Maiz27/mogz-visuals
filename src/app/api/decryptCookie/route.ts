import CryptoJS from 'crypto-js';
import { NextRequest, NextResponse } from 'next/server';
import { ENCRYPTION_KEY } from '@/lib/Constants';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { message: 'Method not allowed', status: 405 },
      { status: 405 }
    );
  }

  try {
    const { encryptedCookie } = await req.json();

    const decryptedCookie = CryptoJS.AES.decrypt(
      encryptedCookie,
      ENCRYPTION_KEY
    ).toString(CryptoJS.enc.Utf8);

    const responseBody = {
      decryptedCookie,
    };

    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    console.error('Error decrypting cookie:', error);
    return NextResponse.json({
      message: 'Error decrypting cookie',
      status: 500,
    });
  }
}
