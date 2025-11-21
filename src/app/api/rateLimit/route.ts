import Redis from 'ioredis';
import { NextRequest, NextResponse } from 'next/server';

const isDevelopment = process.env.NODE_ENV === 'development';
let redisClient: Redis | null = null;

if (!isDevelopment) {
  redisClient = new Redis(process.env.REDIS_URL!);
}

const limitFull = parseInt(process.env.RATE_LIMIT!) || 5;
const limitPartialPerCollection =
  parseInt(process.env.RATE_LIMIT_PARTIAL_PER_COLLECTION!) || 15;
const windowMs =
  parseInt(process.env.RATE_LIMIT_WINDOW!) || 60 * 60 * 1000 * 2; // 2 hours

export async function GET(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json(
      { message: 'Method not allowed', status: 405 },
      { status: 405 }
    );
  }

  if (isDevelopment) {
    return NextResponse.json(
      { message: 'Success (dev mode)', status: 200 },
      { status: 200 }
    );
  }

  try {
    const id = req.nextUrl.searchParams.get('id');
    const collectionId = req.nextUrl.searchParams.get('collectionId');
    let limit: number;
    let keyParts: (string | null)[];

    if (id === 'download-all') {
      limit = limitFull;
      keyParts = [id];
    } else if (id === 'download-part' && collectionId) {
      limit = limitPartialPerCollection;
      keyParts = [id, collectionId];
    } else {
      return NextResponse.json(
        { message: 'Invalid request parameters', status: 400 },
        { status: 400 }
      );
    }

    const { message, status } = await rateLimit(req, keyParts, limit);
    return NextResponse.json({ message, status }, { status });
  } catch (error) {
    console.error('Rate limiting error:', error);
    return NextResponse.json({
      message: 'Internal server error',
      status: 500,
    });
  }
}

const rateLimit = async (
  req: NextRequest,
  keyParts: (string | null)[],
  limit: number
) => {
  const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const key = `rateLimit:${keyParts.join(':')}:${ipAddress}`;

  if (!redisClient) {
    return { message: 'Redis not configured', status: 500 };
  }
  const currentCount = await redisClient.get(key);

  if (currentCount && parseInt(currentCount) >= limit) {
    return { message: 'Rate limit exceeded', status: 429 };
  }

  const pipeline = redisClient.pipeline();
  pipeline.incr(key);
  pipeline.pexpire(key, windowMs); // pexpire takes milliseconds
  await pipeline.exec();

  return { message: 'Success', status: 200 };
};
