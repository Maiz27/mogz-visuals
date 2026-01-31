import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';
import { ENCRYPTION_KEY } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('collectionAccess')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
      const bytes = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      // Validate structure (check for uniqueId and timestamp)
      if (!decryptedData.uniqueId || !decryptedData.timestamp) {
        throw new Error('Invalid token structure');
      }

      // Token is valid and readable
      return NextResponse.json({
        authenticated: true,
        uniqueId: decryptedData.uniqueId,
      });
    } catch (error) {
      // Decryption failed or invalid JSON
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
