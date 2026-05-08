import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
  subscriber: Redis | undefined;
};

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

export function getSubscriber(): Redis | null {
  if (!globalForRedis.subscriber) {
    const client = createRedis();
    if (client) {
      globalForRedis.subscriber = client;
    }
  }
  return globalForRedis.subscriber ?? null;
}

export function publishEvent(channel: string, message: object): void {
  try {
    const r = getRedis();
    if (!r) return;
    r.publish(channel, JSON.stringify(message)).catch(() => {});
  } catch {
    // silently fail — Redis is optional
  }
}

export function subscribeToChannel(
  channel: string,
  callback: (message: string) => void,
): (() => void) | null {
  try {
    const sub = getSubscriber();
    if (!sub) return null;

    sub.subscribe(channel).catch(() => {});
    sub.on('message', (ch: string, message: string) => {
      if (ch === channel) {
        callback(message);
      }
    });

    return () => {
      sub.unsubscribe(channel).catch(() => {});
    };
  } catch {
    return null;
  }
}

export const redis = getRedis;
