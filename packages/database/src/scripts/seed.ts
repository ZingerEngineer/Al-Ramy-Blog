import pino from 'pino';
import { createPrismaClient } from '../index';
import { flush } from './flush';

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

const prisma = createPrismaClient();

async function main() {
  await flush();
  /**
   * USERS
   */
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      name: 'System Admin',
      role: 'ADMIN',
      emailVerified: true,
      profile: {
        create: {
          bio: 'Platform administrator',
          location: 'Internet',
        },
      },
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      username: 'alice',
      name: 'Alice',
      profile: {
        create: {
          bio: 'Writer & blogger',
          twitter: 'alice_dev',
        },
      },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      username: 'bob',
      name: 'Bob',
      profile: {
        create: {
          bio: 'Reader and commenter',
        },
      },
    },
  });

  /**
   * FOLLOW RELATIONSHIPS
   */
  await prisma.follow.createMany({
    data: [
      {
        followerId: bob.id,
        followingId: alice.id,
        status: 'ACCEPTED',
      },
      {
        followerId: alice.id,
        followingId: admin.id,
        status: 'ACCEPTED',
      },
    ],
    skipDuplicates: true,
  });

  /**
   * CATEGORIES
   */
  const techCategory = await prisma.category.upsert({
    where: { slug: 'technology' },
    update: {},
    create: {
      name: 'Technology',
      slug: 'technology',
      description: 'All things tech',
    },
  });

  const webCategory = await prisma.category.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: {
      name: 'Web Development',
      slug: 'web-development',
      parentId: techCategory.id,
    },
  });

  /**
   * TAGS
   */
  const prismaTag = await prisma.tag.upsert({
    where: { slug: 'prisma' },
    update: {},
    create: {
      name: 'Prisma',
      slug: 'prisma',
    },
  });

  const nextjsTag = await prisma.tag.upsert({
    where: { slug: 'nextjs' },
    update: {},
    create: {
      name: 'Next.js',
      slug: 'nextjs',
    },
  });

  /**
   * POSTS
   */
  const post = await prisma.post.create({
    data: {
      title: 'Getting Started with Prisma',
      slug: 'getting-started-with-prisma',
      content: 'Prisma is a next-generation ORM...',
      excerpt: 'Learn how to start using Prisma ORM.',
      status: 'PUBLISHED',
      moderationStatus: 'APPROVED',
      publishedAt: new Date(),

      author: {
        connect: { id: alice.id },
      },

      categories: {
        connect: [{ id: webCategory.id }],
      },

      tags: {
        connect: [{ id: prismaTag.id }, { id: nextjsTag.id }],
      },
    },
  });

  /**
   * COMMENTS (with tree)
   */
  const comment = await prisma.comment.create({
    data: {
      content: 'Great article!',
      postId: post.id,
      authorId: bob.id,
      moderationStatus: 'APPROVED',
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Thanks!',
      postId: post.id,
      authorId: alice.id,
      parentId: comment.id,
      moderationStatus: 'APPROVED',
    },
  });

  /**
   * REACTIONS
   */
  await prisma.reaction.createMany({
    data: [
      {
        userId: bob.id,
        postId: post.id,
        type: 'LIKE',
      },
      {
        userId: alice.id,
        commentId: comment.id,
        type: 'LOVE',
      },
    ],
    skipDuplicates: true,
  });

  /**
   * SHARE
   */
  await prisma.share.create({
    data: {
      postId: post.id,
      userId: bob.id,
      platform: 'TWITTER',
    },
  });

  /**
   * AUDIT LOG
   */
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'PUBLISH',
      entityType: 'Post',
      entityId: post.id,
      reason: 'Approved by admin',
    },
  });

  logger.info('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    logger.error({ err: e }, '❌ Seeding failed');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
