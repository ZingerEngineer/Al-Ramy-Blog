import { requireEnv, requireEnvNumber } from '@workspace/utilities/env';
import Redis from 'ioredis';
import type { RedisConfig } from './types';

let testerClient: Redis | null = null;
let ramyClient: Redis | null = null;

function getRedisPort(configPort?: number): number {
  if (configPort !== undefined) return configPort;
  return requireEnvNumber('REDIS_PORT') as number;
}

/**
 * Get Redis client for the 'tester' user (ping only)
 * Used for connection health checks
 */
export function getTesterClient(config?: Partial<RedisConfig>): Redis {
  if (!testerClient) {
    const host = config?.host ?? requireEnv('REDIS_HOST');
    const username = config?.username ?? requireEnv('REDIS_TESTER');
    const password = config?.password ?? requireEnv('REDIS_TESTER_PASSWORD');

    testerClient = new Redis({
      host,
      port: getRedisPort(config?.port),
      username,
      password,
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
    const host = config?.host ?? requireEnv('REDIS_HOST');
    const username = config?.username ?? requireEnv('REDIS_USER');
    const password = config?.password ?? requireEnv('REDIS_PASSWORD');

    ramyClient = new Redis({
      host,
      port: getRedisPort(config?.port),
      username,
      password,
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
