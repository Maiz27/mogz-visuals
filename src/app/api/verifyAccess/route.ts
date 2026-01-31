import CryptoJS from 'crypto-js';
import { NextRequest, NextResponse } from 'next/server';
import { fetchSanityData } from '@/lib/sanity/client';
import { getCollectionCredentials } from '@/lib/sanity/queries';
import {
  COLLECTION_CREDENTIALS,
  VERIFY_ACCESS_RESPONSE_BODY,
} from '@/lib/types';
import { ENCRYPTION_KEY } from '@/lib/Constants';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { message: 'Method not allowed', status: 405 },
      { status: 405 },
    );
  }
  const requestBody = await req.json();
  const { id, password, token } = requestBody;

  // Verify Turnstile Token
  const verifyRes = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    },
  );

  const verifyData = await verifyRes.json();

  if (!verifyData.success) {
    return NextResponse.json(
      { message: 'Invalid Turnstile Token', status: 400 },
      { status: 400 },
    );
  }

  const credentials: COLLECTION_CREDENTIALS = await fetchSanityData(
    getCollectionCredentials,
    { id },
  );

  if (!credentials || credentials.password !== password) {
    return NextResponse.json(
      { message: 'Invalid collection ID or password', status: 401 },
      { status: 401 },
    );
  }

  const payload = {
    uniqueId: credentials.uniqueId,
    timestamp: Date.now(),
  };

  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    ENCRYPTION_KEY,
  ).toString();

  const responseBody: VERIFY_ACCESS_RESPONSE_BODY = {
    status: 200,
    message: 'Access granted, redirecting...',
    id: credentials.uniqueId,
    secret: encryptedData,
  };

  return NextResponse.json(responseBody, { status: 200 });
}
