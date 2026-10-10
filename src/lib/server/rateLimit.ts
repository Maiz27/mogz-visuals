import { createHash } from 'crypto';
import { isIP } from 'net';
import type { NextRequest } from 'next/server';
import Redis from 'ioredis';

type RateLimitKeyPart = string | number | boolean | null | undefined;

export type RateLimitRule = {
  keyParts: RateLimitKeyPart[];
  limit: number;
  windowMs: number;
  message: string;
  skip?: boolean;
};

export type RateLimitSuccess = {
  ok: true;
  enabled: boolean;
};

export type RateLimitFailure = {
  ok: false;
  message: string;
  retryAfterSeconds: number;
};

export type RateLimitResult = RateLimitSuccess | RateLimitFailure;

let redisClient: Redis | null | undefined;

const DEFAULT_IP_ADDRESS = '127.0.0.1';

const isRateLimitingEnabled = () =>
  process.env.NODE_ENV !== 'development' &&
  process.env.REDIS_ENABLED === 'true' &&
  Boolean(process.env.REDIS_URL);

const getRedisClient = () => {
  if (!isRateLimitingEnabled()) {
    return null;
  }

  if (redisClient === undefined) {
    redisClient = new Redis(process.env.REDIS_URL!);
  }

  return redisClient;
};

const serializeKeyPart = (part: RateLimitKeyPart) =>
  encodeURIComponent(String(part ?? '').trim());

const buildRateLimitKey = (keyParts: RateLimitKeyPart[]) => {
  const normalizedParts = keyParts
    .map(serializeKeyPart)
    .filter(Boolean);

  return normalizedParts.length > 0
    ? `rateLimit:${normalizedParts.join(':')}`
    : null;
};

export const parseRateLimitNumber = (
  value: string | undefined,
  fallback: number,
) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getClientIp = (req: Pick<NextRequest, 'headers'>) => {
  // Cloudflare sets this and overwrites any value the visitor sent, so it is
  // trustworthy only while the origin is reachable through Cloudflare alone.
  // A value that isn't an IP address was not set by Cloudflare: ignore it.
  const cfConnectingIp = req.headers.get('cf-connecting-ip')?.trim();
  if (cfConnectingIp && isIP(cfConnectingIp)) {
    return cfConnectingIp;
  }

  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const forwardedIp = forwardedFor
      .split(',')
      .map((part) => part.trim())
      .find(Boolean);

    if (forwardedIp) {
      return forwardedIp;
    }
  }

  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) {
    return realIp;
  }

  return DEFAULT_IP_ADDRESS;
};

export const normalizeRateLimitEmail = (value: string) =>
  value.trim().toLowerCase();

export const normalizeRateLimitPhone = (value: string) => {
  const digitsOnly = value.replace(/\D+/g, '');
  return digitsOnly || value.trim();
};

export const hashRateLimitValue = (value: string) =>
  createHash('sha256').update(value).digest('hex');

export const getRateLimitHeaders = (result: RateLimitFailure) => ({
  'Retry-After': String(result.retryAfterSeconds),
});

async function consumeRateLimitRule(
  client: Redis,
  rule: RateLimitRule,
): Promise<RateLimitResult> {
  const key = buildRateLimitKey(rule.keyParts);
  if (!key) {
    return { ok: true, enabled: true };
  }

  const pipeline = client.multi();
  pipeline.incr(key);
  pipeline.pttl(key);

  const result = await pipeline.exec();
  const count = Number(result?.[0]?.[1] ?? 0);
  let ttlMs = Number(result?.[1]?.[1] ?? -1);

  if (count === 1 || ttlMs < 0) {
    await client.pexpire(key, rule.windowMs);
    ttlMs = rule.windowMs;
  }

  if (count > rule.limit) {
    return {
      ok: false,
      message: rule.message,
      retryAfterSeconds: Math.max(1, Math.ceil(ttlMs / 1000)),
    };
  }

  return { ok: true, enabled: true };
}

// Gives back one counted attempt, never going below zero or reviving an expired key.
const RELEASE_SCRIPT = `
local count = tonumber(redis.call('GET', KEYS[1]) or '0')
if count > 0 then
  return redis.call('DECR', KEYS[1])
end
return 0`;

/**
 * Returns attempts counted by enforceRateLimitRules for requests that turned
 * out not to count (e.g. a correct code). Counting first and giving back after
 * keeps concurrent requests from all passing a limit before any is recorded.
 */
export async function releaseRateLimitRules(
  rules: RateLimitRule[],
): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    return;
  }

  await Promise.all(
    rules.map(async (rule) => {
      if (rule.skip || rule.limit <= 0 || rule.windowMs <= 0) {
        return;
      }
      const key = buildRateLimitKey(rule.keyParts);
      if (key) {
        await client.eval(RELEASE_SCRIPT, 1, key);
      }
    }),
  );
}

export async function enforceRateLimitRules(
  rules: RateLimitRule[],
): Promise<RateLimitResult> {
  const client = getRedisClient();
  if (!client) {
    return { ok: true, enabled: false };
  }

  for (const rule of rules) {
    if (rule.skip || rule.limit <= 0 || rule.windowMs <= 0) {
      continue;
    }

    const result = await consumeRateLimitRule(client, rule);
    if (!result.ok) {
      return result;
    }
  }

  return { ok: true, enabled: true };
}
