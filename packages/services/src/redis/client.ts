import Redis from 'ioredis';
import type { RedisConfig } from './types';

let testerClient: Redis | null = null;
let ramyClient: Redis | null = null;

function getRedisPort(configPort?: number): number {
  if (configPort !== undefined) return configPort;
  const envPort = process.env.REDIS_PORT;
  if (envPort) {
    const parsed = parseInt(envPort, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 6379;
}

/**
 * Get Redis client for the 'tester' user (ping only)
 * Used for connection health checks
 */
export function getTesterClient(config?: Partial<RedisConfig>): Redis {
  if (!testerClient) {
    testerClient = new Redis({
      host: config?.host ?? process.env.REDIS_HOST ?? 'localhost',
      port: getRedisPort(config?.port),
      username: 'tester',
      password: config?.password ?? process.env.REDIS_PASSWORD ?? '',
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
      },
    });
  }
  return testerClient;
}

/**
 * Get Redis client for the 'ramy' user (key operations)
 * Used for get, set, del, ttl, expire, etc.
 */
export function getRamyClient(config?: Partial<RedisConfig>): Redis {
  if (!ramyClient) {
    ramyClient = new Redis({
      host: config?.host ?? process.env.REDIS_HOST ?? 'localhost',
      port: getRedisPort(config?.port),
      username: config?.username ?? process.env.REDIS_USER ?? 'ramy',
      password: config?.password ?? process.env.REDIS_PASSWORD ?? '',
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
      },
    });
  }
  return ramyClient;
}

/**
 * Close all Redis clients
 */
export async function closeRedisClients(): Promise<void> {
  if (testerClient) {
    await testerClient.quit();
    testerClient = null;
  }
  if (ramyClient) {
    await ramyClient.quit();
    ramyClient = null;
  }
}
