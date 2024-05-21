import { NextRequest, NextResponse } from 'next/server';
import { fetchSanityData } from '@/lib/sanity/client';
import { getCollectionCredentials } from '@/lib/sanity/queries';
import {
  COLLECTION_CREDENTIALS,
  VERIFY_ACCESS_RESPONSE_BODY,
} from '@/lib/types';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { message: 'Method not allowed', status: 405 },
      { status: 405 }
    );
  }
  const requestBody = await req.json();
  const { id, password } = requestBody;

  const credentials: COLLECTION_CREDENTIALS = await fetchSanityData(
    getCollectionCredentials,
    { id }
  );

  if (!credentials || credentials.password !== password) {
    return NextResponse.json(
      { message: 'Invalid collection ID or password', status: 401 },
      { status: 401 }
    );
  }

  const responseBody: VERIFY_ACCESS_RESPONSE_BODY = {
    status: 200,
    message: 'Access granted, redirecting...',
    slug: credentials.slug.current,
    // expires: Date.now() + 1 * 60 * 1000, // 1 hour in milliseconds
  };

  return NextResponse.json(responseBody, { status: 200 });
}
