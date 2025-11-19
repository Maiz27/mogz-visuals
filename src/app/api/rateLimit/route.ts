import Redis from 'ioredis';
import { NextRequest, NextResponse } from 'next/server';

const isDevelopment = process.env.NODE_ENV === 'development';
let redisClient: Redis | null = null;

if (!isDevelopment) {
  redisClient = new Redis(process.env.REDIS_URL!);
}

const limit = parseInt(process.env.RATE_LIMIT!) || 10;
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW!) || 60 * 1000; // 1 minute

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
    const { message, status } = await rateLimit(req, id!);
    return NextResponse.json({ message, status }, { status });
  } catch (error) {
    console.error('Rate limiting error:', error);
    return NextResponse.json({
      message: 'Internal server error',
      status: 500,
    });
  }
}

const rateLimit = async (req: NextRequest, id: string) => {
  const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const key = `rateLimit:${id}:${ipAddress}`;

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
