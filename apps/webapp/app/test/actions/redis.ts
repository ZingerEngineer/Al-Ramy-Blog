'use server';

import { getRamyClient, getTesterClient } from '@workspace/services/redis';
import type {
  RedisCredentials,
  RedisKeyResult,
  RedisSetKeyResult,
  RedisTestResult,
} from '@/types/redis';

function getRedisCredentials(user: 'tester' | 'ramy'): RedisCredentials {
  const host = process.env.REDIS_HOST ?? 'localhost';
  const port = parseInt(process.env.REDIS_PORT ?? '6379', 10);
  const username =
    user === 'tester' ? (process.env.REDIS_TESTER ?? 'tester') : (process.env.REDIS_USER ?? 'ramy');

  return { user: username, host, port };
}

export async function testRedisConnection(): Promise<RedisTestResult> {
  const start = Date.now();
  const redis = getTesterClient();
  const credentials = getRedisCredentials('tester');

  try {
    await redis.ping();
    const latencyMs = Date.now() - start;

    return { connected: true, latencyMs, credentials };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      credentials,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function setRedisTestKey(ttlSeconds: number): Promise<RedisSetKeyResult> {
  // Enforce max TTL of 30 seconds
  const safeTtl = Math.min(Math.max(1, ttlSeconds), 30);
  const key = `test:key:${Date.now()}`;
  const value = `test-value-${new Date().toISOString()}`;
  const issuedBy = process.env.REDIS_USER ?? 'ramy';

  const redis = getRamyClient();

  try {
    await redis.set(key, value, 'EX', safeTtl);
    return { success: true, key, issuedBy };
  } catch (error) {
    return {
      success: false,
      key,
      issuedBy,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function checkRedisKey(key: string): Promise<RedisKeyResult> {
  const redis = getTesterClient();

  try {
    const exists = await redis.exists(key);
    const value = exists ? await redis.get(key) : null;
    const ttl = await redis.ttl(key);

    return {
      exists: exists === 1,
      value,
      ttl,
    };
  } catch {
    return {
      exists: false,
      value: null,
      ttl: -2,
    };
  }
}
