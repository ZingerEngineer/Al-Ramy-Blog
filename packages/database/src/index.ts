import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { requireEnv } from '@workspace/utilities/env';

export type { Category, Comment, MediaFile, Post, Tag, User } from '@prisma/client';
// Re-export specific items instead of `export *` to avoid Next.js bundler issues
export { Prisma, PrismaClient } from '@prisma/client';

// Global singleton for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function createPrismaClient(): PrismaClient {
  const databaseUrl = requireEnv('DATABASE_URL');

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
