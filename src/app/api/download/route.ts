import { NextRequest, NextResponse } from 'next/server';
import memoryStore from 'memory-store';

const rateLimitWindow = 10 * 60 * 1000; // 10 minutes in milliseconds
const maxRequests = 5; // Maximum allowed downloads in the window

const store = new memoryStore();

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { message: 'Method not allowed' },
      { status: 405 }
    );
  }

  const ip = req.ip;
  const key = `download-limit-${ip}`;

  // Get current attempt count from memory store
  let count = store.get(key) || 0;

  // Check if limit is exceeded
  const now = Date.now();
  if (count > 0 && now - store.get(key + '-time') < rateLimitWindow) {
    if (count >= maxRequests) {
      return NextResponse.json(
        { message: 'Too many download requests' },
        { status: 429 }
      );
    }
    count++;
  } else {
    count = 1;
    store.set(key + '-time', now); // Update timestamp
  }

  // Process download request (call your existing download logic)

  // Update attempt count in memory store
  store.set(key, count);
  store.expire(key, rateLimitWindow); // Set expiration for the key

  return NextResponse.json({ message: 'Download successful' });
}
