import Redis from 'ioredis';
import { NextRequest, NextResponse } from 'next/server';

const redisClient = new Redis(process.env.REDIS_URL!);
const limit = parseInt(process.env.RATE_LIMIT!);
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW!) || 60 * 60 * 1000 * 4;

export async function GET(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json(
      { message: 'Method not allowed', status: 405 },
      { status: 405 }
    );
  }

  try {
    const id = req.nextUrl.searchParams.get('id');
    const { message, status } = await rateLimit(req, id!);
    console.log('rateLimit result', { message, status });
    return NextResponse.json({ message, status }, { status });
  } catch (error) {
    console.error('Error decrypting cookie:', error);
    return NextResponse.json({
      message: 'Error decrypting cookie',
      status: 500,
    });
  }
}

const rateLimit = async (req: NextRequest, id: string) => {
  const ipAddress = req.headers.get('x-forwarded-for');
  const key = `rateLimit:${id}:${ipAddress!}`;
  const currentCount = await redisClient.get(key);

  console.log('currentCount', currentCount);

  if (currentCount && parseInt(currentCount) >= limit) {
    return { message: 'Rate limit exceeded', status: 429 };
  }

  // Increment the request count for the IP address
  if (currentCount) {
    await redisClient.incr(key);
  }

  // Set the key with an expiry if it's a new key
  await redisClient.set(key, 1, 'PX', windowMs);

  return { message: 'Success', status: 200 };
};
