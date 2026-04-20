# @al-ramy/database

Database package for Al-Ramy Blog, built with Prisma 7 and PostgreSQL 16.

## Overview

This package provides a fully-featured database layer with 15 models covering authentication, content management, social features, and audit logging. It includes comprehensive seeding, validation schemas, and development utilities.

## Features

- **Prisma 7.x** with the new configuration system
- **PostgreSQL 16** database
- **15 Models** with complex relationships
- **8 Enums** for type safety
- **Zod Schema Generation** for runtime validation
- **Comprehensive Seeding** with realistic test data
- **Podman Development Environment** (PostgreSQL + Redis + LocalStack S3)
- **Full Audit Logging** system

## Installation

This package is part of the Al-Ramy Blog monorepo. Install dependencies from the root:

```bash
pnpm install
```

## Environment Setup

### 1. Environment Variables

Create a `.env` file in the project root with:

```env
# PostgreSQL Database
POSTGRES_USER=ramy
POSTGRES_PASSWORD=p0stgr3SQL21102
POSTGRES_DB=al_ramy_blog_postgres
DATABASE_URL=postgresql://ramy:p0stgr3SQL21102@localhost:5432/al_ramy_blog_postgres?schema=public

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USER=default
REDIS_PASSWORD=your_redis_password

# LocalStack S3 (Development)
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_DEFAULT_REGION=us-east-1
LOCALSTACK_SERVICES=s3
LOCALSTACK_DEBUG=1
```

### 2. Start Podman Services

Start PostgreSQL, Redis, and LocalStack:

```bash
pnpm podman:up
```

Check service status:

```bash
pnpm podman:status
```

### 3. Run Migrations

Create and apply database migrations:

```bash
pnpm db:migrate
```

### 4. Generate Prisma Client

Generate the Prisma Client and Zod schemas:

```bash
pnpm db:generate
```

### 5. Seed the Database

Populate the database with test data:

```bash
pnpm db:seed
```

## Database Schema

### Models (15 Total)

#### Authentication & Users

- **User** - Core user model with authentication fields
- **UserProfile** - Extended user profile information
- **OAuthAccount** - OAuth provider accounts (Google, GitHub, Facebook)
- **RefreshToken** - JWT refresh token management

#### Content Management

- **Post** - Blog posts with draft/published/scheduled states
- **Category** - Hierarchical category system with parent-child relationships
- **Tag** - Post tagging system with usage tracking
- **Comment** - Unlimited nested comment system
- **MediaFile** - Uploaded media (images, videos, documents, audio)
- **PostMedia** - Post-to-media relationship with ordering
- **CommentMedia** - Comment-to-media relationship with ordering

#### Social Features

- **Reaction** - Polymorphic reactions (6 types: LIKE, LOVE, CELEBRATE, INSIGHTFUL, THINKING, FIRE)
- **Follow** - User follow system with approval workflow (PENDING, ACCEPTED, REJECTED)
- **Share** - Post sharing tracking across platforms

#### System

- **AuditLog** - Comprehensive audit logging for moderation and compliance

### Enums (8 Total)

```typescript
UserRole: ADMIN | MODERATOR | USER
PostStatus: DRAFT | PUBLISHED | SCHEDULED | ARCHIVED
ModerationStatus: PENDING | APPROVED | FLAGGED | REMOVED
ReactionType: LIKE | LOVE | CELEBRATE | INSIGHTFUL | THINKING | FIRE
FollowStatus: PENDING | ACCEPTED | REJECTED
AuditAction: CREATE | UPDATE | DELETE | PUBLISH | UNPUBLISH | APPROVE | REJECT | FLAG | BAN | UNBAN
MediaType: IMAGE | VIDEO | DOCUMENT | AUDIO
SharePlatform: TWITTER | FACEBOOK | LINKEDIN | REDDIT | EMAIL | COPY_LINK | OTHER
```

## Usage

### Import Prisma Client

```typescript
import { prisma } from '@al-ramy/database';

// Query users
const users = await prisma.user.findMany({
  include: {
    profile: true,
    posts: true,
  },
});
```

### Using Generated Types

```typescript
import type { User, Post, PostStatus } from '@al-ramy/database';

const createPost = async (authorId: string, title: string): Promise<Post> => {
  return prisma.post.create({
    data: {
      title,
      slug: slugify(title),
      content: '',
      status: PostStatus.DRAFT,
      authorId,
    },
  });
};
```

### Using Zod Schemas

```typescript
import { UserSchema, PostSchema } from '@al-ramy/database/zod';

// Validate user input
const userInput = UserSchema.parse(data);

// Validate post creation
const postData = PostSchema.omit({ id: true, createdAt: true }).parse(input);
```

## Key Features

### 1. Unlimited Comment Nesting

Comments support unlimited nesting through a self-referential relationship:

```typescript
const comment = await prisma.comment.create({
  data: {
    content: 'Reply to a reply',
    postId: 'post-id',
    authorId: 'user-id',
    parentId: 'parent-comment-id', // Can be any depth
  },
});
```

### 2. Polymorphic Reactions

Reactions can target both Posts and Comments:

```typescript
// React to a post
await prisma.reaction.create({
  data: {
    type: ReactionType.LOVE,
    userId: 'user-id',
    postId: 'post-id',
  },
});

// React to a comment
await prisma.reaction.create({
  data: {
    type: ReactionType.INSIGHTFUL,
    userId: 'user-id',
    commentId: 'comment-id',
  },
});
```

### 3. Follow System with Approval

Users can have private accounts requiring follow approval:

```typescript
// Request to follow a private account
const follow = await prisma.follow.create({
  data: {
    followerId: 'follower-id',
    followingId: 'following-id',
    status: FollowStatus.PENDING, // Auto-ACCEPTED for public accounts
  },
});

// Approve follow request
await prisma.follow.update({
  where: { id: follow.id },
  data: { status: FollowStatus.ACCEPTED },
});
```

### 4. Hierarchical Categories

Categories support parent-child relationships:

```typescript
const webDev = await prisma.category.create({
  data: {
    name: 'Web Development',
    slug: 'web-development',
    parentId: technologyCategory.id, // Optional parent
  },
});
```

### 5. Comprehensive Audit Logging

All moderation actions are logged:

```typescript
await prisma.auditLog.create({
  data: {
    userId: moderatorId,
    action: AuditAction.APPROVE,
    entityType: 'Post',
    entityId: postId,
    changes: JSON.stringify({ status: { from: 'PENDING', to: 'APPROVED' } }),
    reason: 'Content meets quality standards',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  },
});
```

## Development Scripts

### Database Management

```bash
# Generate Prisma Client and Zod schemas
pnpm db:generate

# Create and apply migrations
pnpm db:migrate

# Push schema changes without migrations (dev only)
pnpm db:push

# Seed the database
pnpm db:seed

# Open Prisma Studio (GUI)
pnpm db:studio
```

### Podman Services

```bash
# Start all services (creates pod if needed)
pnpm podman:up

# Stop services (preserves containers)
pnpm podman:stop

# Remove containers (preserves volumes)
pnpm podman:down

# Reset all data and restart (⚠️ DESTRUCTIVE)
pnpm podman:reset

# Restart services
pnpm podman:restart

# Check service status
pnpm podman:status

# View logs
pnpm podman:logs                  # All containers
pnpm podman:logs:postgres         # PostgreSQL only
pnpm podman:logs:redis            # Redis only
pnpm podman:logs:localstack       # LocalStack only
```

**Note**: Uses native Podman pods. See `scripts/README.md` for detailed documentation.

### Redis Utilities

```bash
# Open Redis CLI
pnpm dev:redis:cli

# Test connection
pnpm dev:redis:ping

# View server info
pnpm dev:redis:info

# Monitor commands in real-time
pnpm dev:redis:monitor

# List all keys
pnpm dev:redis:keys

# Clear all data (use with caution!)
pnpm dev:redis:flush
```

### PostgreSQL Utilities

```bash
# Open PostgreSQL CLI
pnpm dev:postgres:cli

# Backup database
pnpm dev:postgres:backup

# Restore from backup
pnpm dev:postgres:restore
```

## Seed Data

The seed script creates:

- **8 Users**: 1 Admin, 1 Moderator, 6 Regular Users
- **6 Categories**: Including parent-child relationships
- **15 Tags**: With realistic usage counts
- **7 Posts**: 6 Published, 1 Draft
- **4 Media Files**: Images and videos
- **10+ Comments**: With 3-level deep nesting
- **6 Reactions**: On both posts and comments
- **5 Follow Relationships**: Including pending approvals
- **4 Shares**: Across different platforms
- **4 Audit Logs**: Sample moderation history

## Configuration

### Prisma Configuration (prisma.config.ts)

Prisma 7 uses a new configuration file:

```typescript
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
    seed: 'tsx src/scripts/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

### Package Exports

```typescript
// Export Prisma Client singleton
export { prisma } from './src/index';

// Export all types and enums
export * from '@prisma/client';

// Export Zod schemas (after generation)
export * from './src/zod';
```

## Best Practices

### 1. Use Transactions for Related Operations

```typescript
await prisma.$transaction([
  prisma.post.create({ data: postData }),
  prisma.auditLog.create({ data: auditData }),
]);
```

### 2. Include Related Data Efficiently

```typescript
const post = await prisma.post.findUnique({
  where: { id: postId },
  include: {
    author: {
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
      },
    },
    categories: true,
    tags: true,
    _count: {
      select: {
        comments: true,
        reactions: true,
      },
    },
  },
});
```

### 3. Use Zod for Input Validation

```typescript
import { PostCreateSchema } from '@al-ramy/database/zod';

const validatedData = PostCreateSchema.parse(userInput);
```

### 4. Leverage Prisma Middleware

```typescript
prisma.$use(async (params, next) => {
  // Log all queries in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Query: ${params.model}.${params.action}`);
  }
  return next(params);
});
```

## Indexes

The schema includes comprehensive indexes for performance:

- User lookups by email, username, role
- Post queries by status, author, publication date
- Comment queries by post, author, parent
- Reaction queries by user, post, comment
- Follow queries by follower, following, status
- Audit log queries by user, action, entity

## Constraints

### Unique Constraints

- User email and username
- Post slug
- Category and Tag names/slugs
- One reaction per user per post/comment
- One follow relationship per user pair
- OAuth provider + account ID

### Cascade Deletes

- Deleting a user cascades to all their content, reactions, and follows
- Deleting a post cascades to all comments, reactions, and shares
- Deleting a comment cascades to all replies and reactions

## Troubleshooting

### Migration Issues

```bash
# Reset database and migrations
pnpm podman:reset
pnpm db:migrate

# Or manually
podman-compose down -v
podman-compose up -d
pnpm db:migrate
```

### Zod Generation Not Working

```bash
# Regenerate Prisma Client and Zod schemas
pnpm db:generate

# Check output directory
ls -la packages/database/src/zod/
```

### Seed Script Fails

```bash
# Ensure migrations are applied first
pnpm db:migrate

# Then seed
pnpm db:seed
```

## Contributing

See [MIGRATIONS.md](./MIGRATIONS.md) for migration workflow and best practices.

## License

Private - Al-Ramy Blog Project
