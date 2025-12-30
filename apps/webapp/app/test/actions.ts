'use server';

import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { prisma } from '@workspace/database';
import { getRamyClient, getTesterClient } from '@workspace/services/redis';
import { BUCKET_NAME, getS3Client, getS3Endpoint } from '@workspace/services/s3';

// ============== DATABASE ACTIONS ==============

export interface DatabaseTestResult {
  connected: boolean;
  latencyMs: number;
  error?: string;
}

export interface SeededRecord {
  id: string;
  name: string;
  createdAt: Date;
}

export async function testDatabaseConnection(): Promise<DatabaseTestResult> {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;

    return { connected: true, latencyMs };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function seedTestData(): Promise<{
  success: boolean;
  records: SeededRecord[];
  error?: string;
}> {
  try {
    const timestamp = Date.now();
    const testTags = await Promise.all([
      prisma.tag.upsert({
        where: { slug: `test-tag-${timestamp}-1` },
        update: { usageCount: { increment: 1 } },
        create: {
          name: `Test Tag ${timestamp}-1`,
          slug: `test-tag-${timestamp}-1`,
          usageCount: 1,
        },
      }),
      prisma.tag.upsert({
        where: { slug: `test-tag-${timestamp}-2` },
        update: { usageCount: { increment: 1 } },
        create: {
          name: `Test Tag ${timestamp}-2`,
          slug: `test-tag-${timestamp}-2`,
          usageCount: 1,
        },
      }),
      prisma.tag.upsert({
        where: { slug: `test-tag-${timestamp}-3` },
        update: { usageCount: { increment: 1 } },
        create: {
          name: `Test Tag ${timestamp}-3`,
          slug: `test-tag-${timestamp}-3`,
          usageCount: 1,
        },
      }),
    ]);

    return {
      success: true,
      records: testTags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        createdAt: tag.createdAt,
      })),
    };
  } catch (error) {
    return {
      success: false,
      records: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getSeededRecords(): Promise<SeededRecord[]> {
  try {
    const tags = await prisma.tag.findMany({
      where: { slug: { startsWith: 'test-tag' } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt,
    }));
  } catch {
    return [];
  }
}

// ============== REDIS ACTIONS ==============

export interface RedisTestResult {
  connected: boolean;
  latencyMs: number;
  error?: string;
}

export interface RedisKeyResult {
  exists: boolean;
  value: string | null;
  ttl: number;
}

export async function testRedisConnection(): Promise<RedisTestResult> {
  const start = Date.now();
  const redis = getTesterClient();

  try {
    await redis.ping();
    const latencyMs = Date.now() - start;

    return { connected: true, latencyMs };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function setRedisTestKey(
  ttlSeconds: number,
): Promise<{ success: boolean; key: string; error?: string }> {
  // Enforce max TTL of 30 seconds
  const safeTtl = Math.min(Math.max(1, ttlSeconds), 30);
  const key = `test:key:${Date.now()}`;
  const value = `test-value-${new Date().toISOString()}`;

  const redis = getRamyClient();

  try {
    await redis.set(key, value, 'EX', safeTtl);
    return { success: true, key };
  } catch (error) {
    return {
      success: false,
      key,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function checkRedisKey(key: string): Promise<RedisKeyResult> {
  const redis = getRamyClient();

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

// ============== S3 ACTIONS ==============

export interface S3TestResult {
  connected: boolean;
  bucketExists: boolean;
  latencyMs: number;
  error?: string;
}

export interface S3FileInfo {
  key: string;
  size: number;
  lastModified: string;
}

export interface S3UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

export async function testS3Connection(): Promise<S3TestResult> {
  const start = Date.now();
  const s3 = getS3Client();

  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1,
    });

    await s3.send(command);
    const latencyMs = Date.now() - start;

    return { connected: true, bucketExists: true, latencyMs };
  } catch (error) {
    return {
      connected: false,
      bucketExists: false,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function uploadTestFile(): Promise<S3UploadResult> {
  const s3 = getS3Client();
  const key = `test-files/test-${Date.now()}.txt`;
  const content = `Test file created at ${new Date().toISOString()}`;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: content,
      ContentType: 'text/plain',
    });

    await s3.send(command);
    const url = `${getS3Endpoint()}/${BUCKET_NAME}/${key}`;

    return { success: true, key, url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function checkFileExists(key: string): Promise<boolean> {
  const s3 = getS3Client();

  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3.send(command);
    return true;
  } catch {
    return false;
  }
}

export async function listBucketFiles(): Promise<S3FileInfo[]> {
  const s3 = getS3Client();

  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'test-files/',
      MaxKeys: 20,
    });

    const response = await s3.send(command);

    return (response.Contents ?? []).map((obj) => ({
      key: obj.Key ?? '',
      size: obj.Size ?? 0,
      lastModified: obj.LastModified?.toISOString() ?? '',
    }));
  } catch {
    return [];
  }
}

export async function getFileContent(
  key: string,
): Promise<{ success: boolean; content?: string; error?: string }> {
  const s3 = getS3Client();

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3.send(command);
    const content = await response.Body?.transformToString();

    return { success: true, content };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
