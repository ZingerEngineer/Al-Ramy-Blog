'use server';

import { prisma } from '@workspace/database';
import type { DatabaseCredentials, DatabaseTestResult, SeededRecord } from '@/types/database';

function parseDatabaseUrl(): DatabaseCredentials {
  const url = process.env.DATABASE_URL ?? '';
  try {
    // Format: postgresql://user:password@host:port/database
    const parsed = new URL(url);
    return {
      user: parsed.username || 'unknown',
      host: parsed.hostname || 'unknown',
      port: parsed.port || '5432',
      database: parsed.pathname.slice(1) || 'unknown',
    };
  } catch {
    return {
      user: 'unknown',
      host: 'unknown',
      port: 'unknown',
      database: 'unknown',
    };
  }
}

export async function testDatabaseConnection(): Promise<DatabaseTestResult> {
  const start = Date.now();
  const credentials = parseDatabaseUrl();

  try {
    await prisma.$queryRaw`SELECT 1`;
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
