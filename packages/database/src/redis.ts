import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

function createRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    const client = new Redis(url, {
      maxRetriesPerRequest: 1,
      retryStrategy() {
        return null;
      },
      lazyConnect: true,
    });
    return client;
  } catch {
    return null;
  }
}

export function getRedis(): Redis | null {
  if (!globalForRedis.redis) {
    const client = createRedis();
    if (client) {
      globalForRedis.redis = client;
    }
  }
  return globalForRedis.redis ?? null;
}

export async function redisHealth(): Promise<boolean> {
  try {
    const r = getRedis();
    if (!r) return false;
    const result = await r.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
}

export const redis = getRedis;
