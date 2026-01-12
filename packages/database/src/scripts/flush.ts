import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { requireEnv } from '@workspace/utilities/env';
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
});

const databaseUrl = requireEnv('DATABASE_URL');

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

/**
 * Flushes all data from the database.
 * Tables are deleted in order to respect foreign key constraints.
 */
export async function flush() {
  logger.info('Flushing database...\n');

  // Delete in reverse order of dependencies
  const deletions = [
    { name: 'AuditLog', fn: () => prisma.auditLog.deleteMany() },
    { name: 'CommentMedia', fn: () => prisma.commentMedia.deleteMany() },
    { name: 'PostMedia', fn: () => prisma.postMedia.deleteMany() },
    { name: 'MediaFile', fn: () => prisma.mediaFile.deleteMany() },
    { name: 'Share', fn: () => prisma.share.deleteMany() },
    { name: 'Reaction', fn: () => prisma.reaction.deleteMany() },
    { name: 'Comment', fn: () => prisma.comment.deleteMany() },
    { name: 'Post', fn: () => prisma.post.deleteMany() },
    { name: 'Tag', fn: () => prisma.tag.deleteMany() },
    { name: 'Category', fn: () => prisma.category.deleteMany() },
    { name: 'Follow', fn: () => prisma.follow.deleteMany() },
    { name: 'Verification', fn: () => prisma.verification.deleteMany() },
    { name: 'Session', fn: () => prisma.session.deleteMany() },
    { name: 'RefreshToken', fn: () => prisma.refreshToken.deleteMany() },
    { name: 'Account', fn: () => prisma.account.deleteMany() },
    { name: 'UserProfile', fn: () => prisma.userProfile.deleteMany() },
    { name: 'User', fn: () => prisma.user.deleteMany() },
  ];

  for (const { name, fn } of deletions) {
    const result = await fn();
    logger.info(`  Deleted ${result.count} ${name} records`);
  }

  logger.info('\nDatabase flushed successfully!');
}

// Run if executed directly
if (require.main === module) {
  flush()
    .catch((error) => {
      logger.error({ err: error }, 'Flush failed:');
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { prisma };
