import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  AuditAction,
  FollowStatus,
  MediaType,
  ModerationStatus,
  PostStatus,
  PrismaClient,
  ReactionType,
  SharePlatform,
  UserRole,
} from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || '',
});
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Utility function for slug generation
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  // Clean existing data (in correct order to respect foreign keys)
  await prisma.auditLog.deleteMany();
  await prisma.share.deleteMany();
  await prisma.commentMedia.deleteMany();
  await prisma.postMedia.deleteMany();
  await prisma.mediaFile.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.oAuthAccount.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  // ==================== 1. CREATE USERS ====================

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@alramyblog.com',
      password: '$2b$10$YourHashedPasswordHere', // Hash this in production
      name: 'Admin User',
      username: 'admin',
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      twoFactorEnabled: true,
      twoFactorSecret: 'MOCK_2FA_SECRET',
      isPrivate: false,
      isBanned: false,
    },
  });

  const moderatorUser = await prisma.user.create({
    data: {
      email: 'moderator@alramyblog.com',
      password: '$2b$10$YourHashedPasswordHere',
      name: 'Moderator User',
      username: 'moderator',
      role: UserRole.MODERATOR,
      emailVerified: new Date(),
      isPrivate: false,
    },
  });

  const ahmed = await prisma.user.create({
    data: {
      email: 'ahmed.hassan@example.com',
      password: '$2b$10$YourHashedPasswordHere',
      name: 'Ahmed Hassan',
      username: 'ahmed_hassan',
      role: UserRole.USER,
      emailVerified: new Date(),
      image: 'https://i.pravatar.cc/150?img=1',
    },
  });

  const fatima = await prisma.user.create({
    data: {
      email: 'fatima.ali@example.com',
      password: '$2b$10$YourHashedPasswordHere',
      name: 'Fatima Ali',
      username: 'fatima_ali',
      role: UserRole.USER,
      emailVerified: new Date(),
      image: 'https://i.pravatar.cc/150?img=2',
      isPrivate: true,
    },
  });

  const omar = await prisma.user.create({
    data: {
      email: 'omar.khalil@example.com',
      password: '$2b$10$YourHashedPasswordHere',
      name: 'Omar Khalil',
      username: 'omar_k',
      role: UserRole.USER,
      emailVerified: new Date(),
      image: 'https://i.pravatar.cc/150?img=3',
    },
  });

  const layla = await prisma.user.create({
    data: {
      email: 'layla.mohammed@example.com',
      name: 'Layla Mohammed',
      username: 'layla_m',
      role: UserRole.USER,
      emailVerified: new Date(),
      image: 'https://i.pravatar.cc/150?img=4',
    },
  });

  const youssef = await prisma.user.create({
    data: {
      email: 'youssef.ibrahim@example.com',
      password: '$2b$10$YourHashedPasswordHere',
      name: 'Youssef Ibrahim',
      username: 'youssef_ib',
      role: UserRole.USER,
      image: 'https://i.pravatar.cc/150?img=5',
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: 'sarah.nasser@example.com',
      password: '$2b$10$YourHashedPasswordHere',
      name: 'Sarah Nasser',
      username: 'sarah_n',
      role: UserRole.USER,
      emailVerified: new Date(),
      image: 'https://i.pravatar.cc/150?img=6',
      isBanned: true,
      bannedAt: new Date(),
      bannedReason: 'Violation of community guidelines - spam posting',
    },
  });

  const regularUsers = [ahmed, fatima, omar, layla, youssef, sarah];
  const allUsers = [adminUser, moderatorUser, ...regularUsers];

  // ==================== 2. CREATE USER PROFILES ====================

  await Promise.all([
    prisma.userProfile.create({
      data: {
        userId: adminUser.id,
        bio: 'System administrator and content curator. Ensuring quality content and smooth operations.',
        location: 'Dubai, UAE',
        website: 'https://alramyblog.com',
        twitter: '@alramyblog',
        github: 'alramyblog',
        linkedin: 'alramyblog',
        coverImage: 'https://picsum.photos/seed/admin/1200/400',
      },
    }),
    prisma.userProfile.create({
      data: {
        userId: ahmed.id,
        bio: 'Software engineer passionate about web development and cloud technologies. Love sharing knowledge!',
        location: 'Cairo, Egypt',
        website: 'https://ahmedhassan.dev',
        twitter: '@ahmed_hassan',
        github: 'ahmedhassan',
        linkedin: 'ahmed-hassan',
        coverImage: 'https://picsum.photos/seed/ahmed/1200/400',
      },
    }),
    prisma.userProfile.create({
      data: {
        userId: fatima.id,
        bio: 'UI/UX Designer & Frontend Developer. Creating beautiful and accessible web experiences.',
        location: 'Riyadh, Saudi Arabia',
        website: 'https://fatimaali.design',
        linkedin: 'fatima-ali',
        coverImage: 'https://picsum.photos/seed/fatima/1200/400',
      },
    }),
    prisma.userProfile.create({
      data: {
        userId: omar.id,
        bio: 'Tech blogger | DevOps enthusiast | Coffee addict ☕',
        location: 'Amman, Jordan',
        twitter: '@omar_k',
        github: 'omar-khalil',
        coverImage: 'https://picsum.photos/seed/omar/1200/400',
      },
    }),
  ]);

  // ==================== 3. CREATE OAUTH ACCOUNTS ====================

  await Promise.all([
    prisma.oAuthAccount.create({
      data: {
        userId: ahmed.id,
        provider: 'google',
        providerAccountId: 'google-123456789',
        accessToken: 'mock_google_access_token',
        refreshToken: 'mock_google_refresh_token',
        expiresAt: new Date(Date.now() + 3600 * 1000),
        tokenType: 'Bearer',
        scope: 'openid profile email',
      },
    }),
    prisma.oAuthAccount.create({
      data: {
        userId: fatima.id,
        provider: 'github',
        providerAccountId: 'github-987654321',
        accessToken: 'mock_github_access_token',
        tokenType: 'Bearer',
        scope: 'read:user user:email',
      },
    }),
    prisma.oAuthAccount.create({
      data: {
        userId: layla.id,
        provider: 'facebook',
        providerAccountId: 'facebook-456789123',
        accessToken: 'mock_facebook_access_token',
        expiresAt: new Date(Date.now() + 7200 * 1000),
        tokenType: 'Bearer',
      },
    }),
  ]);

  // ==================== 4. CREATE REFRESH TOKENS ====================

  await Promise.all(
    allUsers.slice(0, 4).map((user, index) =>
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: `refresh_token_${user.id}_${Date.now()}_${index}`,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          isRevoked: false,
        },
      }),
    ),
  );

  // ==================== 5. CREATE CATEGORIES ====================

  const technology = await prisma.category.create({
    data: {
      name: 'Technology',
      slug: 'technology',
      description: 'Articles about the latest in tech, software development, and innovation',
      coverImage: 'https://picsum.photos/seed/tech/800/400',
    },
  });

  const webDev = await prisma.category.create({
    data: {
      name: 'Web Development',
      slug: 'web-development',
      description: 'Frontend, backend, and full-stack web development topics',
      coverImage: 'https://picsum.photos/seed/webdev/800/400',
      parentId: technology.id,
    },
  });

  const design = await prisma.category.create({
    data: {
      name: 'Design',
      slug: 'design',
      description: 'UI/UX design, visual design, and design systems',
      coverImage: 'https://picsum.photos/seed/design/800/400',
    },
  });

  const devOps = await prisma.category.create({
    data: {
      name: 'DevOps',
      slug: 'devops',
      description: 'Cloud infrastructure, CI/CD, and deployment strategies',
      coverImage: 'https://picsum.photos/seed/devops/800/400',
      parentId: technology.id,
    },
  });

  const career = await prisma.category.create({
    data: {
      name: 'Career',
      slug: 'career',
      description: 'Career advice, interviews, and professional development',
      coverImage: 'https://picsum.photos/seed/career/800/400',
    },
  });

  const tutorial = await prisma.category.create({
    data: {
      name: 'Tutorials',
      slug: 'tutorials',
      description: 'Step-by-step guides and how-to articles',
      coverImage: 'https://picsum.photos/seed/tutorials/800/400',
    },
  });

  // ==================== 6. CREATE TAGS ====================

  const tagData = [
    { name: 'JavaScript', slug: 'javascript', usageCount: 15 },
    { name: 'TypeScript', slug: 'typescript', usageCount: 12 },
    { name: 'React', slug: 'react', usageCount: 20 },
    { name: 'Next.js', slug: 'nextjs', usageCount: 18 },
    { name: 'Node.js', slug: 'nodejs', usageCount: 10 },
    { name: 'CSS', slug: 'css', usageCount: 8 },
    { name: 'Tailwind', slug: 'tailwind', usageCount: 14 },
    { name: 'Docker', slug: 'docker', usageCount: 7 },
    { name: 'PostgreSQL', slug: 'postgresql', usageCount: 5 },
    { name: 'AWS', slug: 'aws', usageCount: 6 },
    { name: 'Git', slug: 'git', usageCount: 9 },
    { name: 'Performance', slug: 'performance', usageCount: 11 },
    { name: 'Security', slug: 'security', usageCount: 4 },
    { name: 'Testing', slug: 'testing', usageCount: 7 },
    { name: 'Career Tips', slug: 'career-tips', usageCount: 3 },
  ];

  await Promise.all(tagData.map((tag) => prisma.tag.create({ data: tag })));

  // ==================== 7. CREATE POSTS ====================

  const post1 = await prisma.post.create({
    data: {
      title: 'Getting Started with Next.js 15: A Comprehensive Guide',
      slug: slugify('Getting Started with Next.js 15: A Comprehensive Guide'),
      content: `# Introduction to Next.js 15

Next.js 15 brings exciting new features and improvements that make building modern web applications easier than ever. In this comprehensive guide, we'll explore the key features and how to get started.

## What's New in Next.js 15

1. **Improved Server Components**: Enhanced performance and better streaming capabilities
2. **Turbopack Improvements**: Faster builds and hot module replacement
3. **Better TypeScript Support**: Enhanced type inference and better error messages

## Getting Started

First, create a new Next.js project:

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Key Features

### Server Components by Default
All components are now server components by default, which means better performance and smaller client bundles.

### App Router Enhancements
The app router has been further refined with better layouts and improved data fetching patterns.

## Conclusion

Next.js 15 is a powerful framework that continues to push the boundaries of what's possible in modern web development.`,
      excerpt:
        'Explore the latest features in Next.js 15 and learn how to build modern web applications with improved performance and developer experience.',
      status: PostStatus.PUBLISHED,
      moderationStatus: ModerationStatus.APPROVED,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      viewCount: 1240,
      authorId: ahmed.id,
      coverImage: 'https://picsum.photos/seed/nextjs15/1200/630',
      categories: {
        connect: [{ id: webDev.id }, { id: tutorial.id }],
      },
      tags: {
        connect: [
          { slug: 'nextjs' },
          { slug: 'react' },
          { slug: 'typescript' },
          { slug: 'javascript' },
        ],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Mastering Tailwind CSS: Advanced Techniques and Best Practices',
      slug: slugify('Mastering Tailwind CSS: Advanced Techniques and Best Practices'),
      content: `# Mastering Tailwind CSS

Tailwind CSS has revolutionized how we write CSS. Let's dive into advanced techniques that will take your Tailwind skills to the next level.

## Custom Design System

Create a consistent design system using Tailwind's configuration:

\`\`\`js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          // ... more shades
        }
      }
    }
  }
}
\`\`\`

## Component Patterns

Learn reusable patterns for common UI components without sacrificing utility-first approach.

## Performance Optimization

- Use JIT mode for faster builds
- Purge unused styles in production
- Leverage @apply strategically

## Conclusion

Tailwind CSS is more than just utility classes - it's a complete design system that scales with your project.`,
      excerpt:
        'Deep dive into advanced Tailwind CSS techniques, custom design systems, and performance optimization strategies.',
      status: PostStatus.PUBLISHED,
      moderationStatus: ModerationStatus.APPROVED,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      viewCount: 890,
      authorId: fatima.id,
      coverImage: 'https://picsum.photos/seed/tailwind/1200/630',
      categories: {
        connect: [{ id: webDev.id }, { id: design.id }],
      },
      tags: {
        connect: [{ slug: 'tailwind' }, { slug: 'css' }],
      },
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: 'Docker Best Practices for Node.js Applications',
      slug: slugify('Docker Best Practices for Node.js Applications'),
      content: `# Docker Best Practices for Node.js

Containerizing Node.js applications can be tricky. Here are the best practices I've learned after years of production experience.

## Multi-Stage Builds

Use multi-stage builds to keep your images small:

\`\`\`dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
\`\`\`

## Security Considerations

- Run as non-root user
- Scan for vulnerabilities
- Use specific base image versions

## Performance Tips

- Leverage build cache effectively
- Minimize layer count
- Use .dockerignore

Properly containerizing your Node.js apps will make deployment and scaling much easier.`,
      excerpt:
        'Learn Docker best practices for Node.js applications including multi-stage builds, security, and performance optimization.',
      status: PostStatus.PUBLISHED,
      moderationStatus: ModerationStatus.APPROVED,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      viewCount: 654,
      authorId: omar.id,
      coverImage: 'https://picsum.photos/seed/docker/1200/630',
      categories: {
        connect: [{ id: devOps.id }, { id: tutorial.id }],
      },
      tags: {
        connect: [{ slug: 'docker' }, { slug: 'nodejs' }],
      },
    },
  });

  await prisma.post.create({
    data: {
      title: 'Building Accessible React Components: A Practical Guide',
      slug: slugify('Building Accessible React Components: A Practical Guide'),
      content: `# Building Accessible React Components

Accessibility should never be an afterthought. Let's learn how to build React components that everyone can use.

## Semantic HTML

Always start with semantic HTML:

\`\`\`jsx
// ✅ Good
<button onClick={handleClick}>Submit</button>

// ❌ Bad
<div onClick={handleClick}>Submit</div>
\`\`\`

## ARIA Attributes

Use ARIA attributes when semantic HTML isn't enough:

\`\`\`jsx
<nav aria-label="Main navigation">
  {/* navigation items */}
</nav>
\`\`\`

## Keyboard Navigation

Ensure all interactive elements are keyboard accessible.

## Testing

Use tools like axe-core and test with screen readers.

Making your applications accessible benefits everyone and is the right thing to do.`,
      excerpt:
        'A practical guide to building accessible React components with semantic HTML, ARIA attributes, and keyboard navigation.',
      status: PostStatus.PUBLISHED,
      moderationStatus: ModerationStatus.APPROVED,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      viewCount: 432,
      authorId: fatima.id,
      coverImage: 'https://picsum.photos/seed/a11y/1200/630',
      categories: {
        connect: [{ id: webDev.id }],
      },
      tags: {
        connect: [{ slug: 'react' }, { slug: 'javascript' }],
      },
    },
  });

  await prisma.post.create({
    data: {
      title: 'Career Guide: From Junior to Senior Developer',
      slug: slugify('Career Guide: From Junior to Senior Developer'),
      content: `# From Junior to Senior Developer

The path from junior to senior developer isn't just about technical skills. Here's what I learned on my journey.

## Technical Growth

1. **Master the fundamentals**: Don't just learn frameworks
2. **Read code**: Learn from others' code
3. **Build projects**: Theory is nothing without practice

## Soft Skills Matter

- Communication is crucial
- Learn to mentor others
- Understand business context

## Leadership

Senior developers lead by example and help others grow.

## Continuous Learning

The learning never stops in tech. Embrace it!

Remember, everyone's path is different. Focus on consistent growth.`,
      excerpt:
        'Practical advice on advancing your developer career from junior to senior level, covering technical growth, soft skills, and leadership.',
      status: PostStatus.PUBLISHED,
      moderationStatus: ModerationStatus.APPROVED,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      viewCount: 1580,
      authorId: ahmed.id,
      coverImage: 'https://picsum.photos/seed/career/1200/630',
      categories: {
        connect: [{ id: career.id }],
      },
      tags: {
        connect: [{ slug: 'career-tips' }],
      },
    },
  });

  await prisma.post.create({
    data: {
      title: 'Understanding PostgreSQL Query Optimization',
      slug: slugify('Understanding PostgreSQL Query Optimization'),
      content: `# PostgreSQL Query Optimization

Slow queries killing your application performance? Let's optimize them!

## EXPLAIN ANALYZE

Your best friend for understanding query performance:

\`\`\`sql
EXPLAIN ANALYZE
SELECT * FROM posts WHERE status = 'PUBLISHED';
\`\`\`

## Indexing Strategies

- Create indexes on frequently queried columns
- Use composite indexes for multi-column queries
- Don't over-index

## Query Patterns

Learn to write efficient queries that leverage indexes.

## Monitoring

Set up query monitoring to catch slow queries early.

Proper query optimization can make your application orders of magnitude faster.`,
      excerpt:
        'Learn PostgreSQL query optimization techniques including EXPLAIN ANALYZE, indexing strategies, and performance monitoring.',
      status: PostStatus.PUBLISHED,
      moderationStatus: ModerationStatus.APPROVED,
      publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      viewCount: 723,
      authorId: omar.id,
      coverImage: 'https://picsum.photos/seed/postgres/1200/630',
      categories: {
        connect: [{ id: technology.id }],
      },
      tags: {
        connect: [{ slug: 'postgresql' }, { slug: 'performance' }],
      },
    },
  });

  await prisma.post.create({
    data: {
      title: 'Draft: Upcoming Features in React 19',
      slug: slugify('Draft: Upcoming Features in React 19'),
      content: `# React 19 Features (Draft)

This is a draft article about upcoming React 19 features. Still being researched and written.

## Server Components Evolution

## Compiler Improvements

## New Hooks

More content coming soon...`,
      excerpt: 'A draft article exploring the upcoming features in React 19.',
      status: PostStatus.DRAFT,
      moderationStatus: ModerationStatus.PENDING,
      viewCount: 0,
      authorId: ahmed.id,
      categories: {
        connect: [{ id: webDev.id }],
      },
      tags: {
        connect: [{ slug: 'react' }, { slug: 'javascript' }],
      },
    },
  });

  // ==================== 8. CREATE MEDIA FILES ====================

  const media1 = await prisma.mediaFile.create({
    data: {
      fileName: 'hero-image-1.jpg',
      originalName: 'hero-image-1.jpg',
      fileUrl: 'http://localhost:4566/alramy-blog-media/posts/hero-image-1.jpg',
      fileSize: 245678,
      mimeType: 'image/jpeg',
      mediaType: MediaType.IMAGE,
      width: 1920,
      height: 1080,
      uploadedById: ahmed.id,
    },
  });

  const media2 = await prisma.mediaFile.create({
    data: {
      fileName: 'diagram-architecture.png',
      originalName: 'system-architecture-diagram.png',
      fileUrl: 'http://localhost:4566/alramy-blog-media/posts/diagram-architecture.png',
      fileSize: 156789,
      mimeType: 'image/png',
      mediaType: MediaType.IMAGE,
      width: 1200,
      height: 800,
      uploadedById: ahmed.id,
    },
  });

  const media3 = await prisma.mediaFile.create({
    data: {
      fileName: 'tutorial-video.mp4',
      originalName: 'nextjs-tutorial.mp4',
      fileUrl: 'http://localhost:4566/alramy-blog-media/posts/tutorial-video.mp4',
      fileSize: 15678900,
      mimeType: 'video/mp4',
      mediaType: MediaType.VIDEO,
      width: 1920,
      height: 1080,
      duration: 450,
      uploadedById: fatima.id,
    },
  });

  const media4 = await prisma.mediaFile.create({
    data: {
      fileName: 'code-snippet.png',
      originalName: 'code-example.png',
      fileUrl: 'http://localhost:4566/alramy-blog-media/comments/code-snippet.png',
      fileSize: 89012,
      mimeType: 'image/png',
      mediaType: MediaType.IMAGE,
      width: 800,
      height: 600,
      uploadedById: omar.id,
    },
  });

  // ==================== 9. LINK MEDIA TO POSTS ====================

  await Promise.all([
    prisma.postMedia.create({
      data: {
        postId: post1.id,
        mediaFileId: media1.id,
        order: 0,
      },
    }),
    prisma.postMedia.create({
      data: {
        postId: post1.id,
        mediaFileId: media2.id,
        order: 1,
      },
    }),
    prisma.postMedia.create({
      data: {
        postId: post3.id,
        mediaFileId: media3.id,
        order: 0,
      },
    }),
  ]);

  // ==================== 10. CREATE COMMENTS (WITH NESTING) ====================

  // Top-level comments on first post
  const comment1 = await prisma.comment.create({
    data: {
      content:
        'Excellent article! The section on Server Components really helped me understand the concepts better.',
      postId: post1.id,
      authorId: fatima.id,
      moderationStatus: ModerationStatus.APPROVED,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: "I've been waiting for a comprehensive guide like this. Thanks for sharing!",
      postId: post1.id,
      authorId: omar.id,
      moderationStatus: ModerationStatus.APPROVED,
    },
  });

  // Nested reply to comment1 (level 2)
  const reply1_1 = await prisma.comment.create({
    data: {
      content: 'I agree! The examples were really clear and easy to follow.',
      postId: post1.id,
      authorId: layla.id,
      parentId: comment1.id,
      moderationStatus: ModerationStatus.APPROVED,
    },
  });

  // Nested reply to reply1_1 (level 3)
  await prisma.comment.create({
    data: {
      content: "Same here! I'm already implementing these patterns in my current project.",
      postId: post1.id,
      authorId: ahmed.id,
      parentId: reply1_1.id,
      moderationStatus: ModerationStatus.APPROVED,
    },
  });

  // Another nested reply to reply1_1 (level 3)
  await prisma.comment.create({
    data: {
      content: 'Would love to see a follow-up article on advanced patterns!',
      postId: post1.id,
      authorId: youssef.id,
      parentId: reply1_1.id,
      moderationStatus: ModerationStatus.APPROVED,
    },
  });

  // Reply to comment2 (level 2)
  await prisma.comment.create({
    data: {
      content: "You're welcome! Let me know if you have any questions.",
      postId: post1.id,
      authorId: ahmed.id, // Author responding
      parentId: comment2.id,
      moderationStatus: ModerationStatus.APPROVED,
    },
  });

  // Comments on other posts
  const comment3 = await prisma.comment.create({
    data: {
      content: 'Great Docker tips! The multi-stage build example saved me so much image size.',
      postId: post3.id,
      authorId: ahmed.id,
      moderationStatus: ModerationStatus.APPROVED,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Question: How do you handle secrets in Docker builds?',
      postId: post3.id,
      authorId: fatima.id,
      parentId: comment3.id,
      moderationStatus: ModerationStatus.APPROVED,
    },
  });

  // Flagged comment for moderation
  await prisma.comment.create({
    data: {
      content: 'This is a test flagged comment that needs moderator review.',
      postId: post2.id,
      authorId: youssef.id,
      moderationStatus: ModerationStatus.FLAGGED,
    },
  });

  // Comment with media
  const commentWithMedia = await prisma.comment.create({
    data: {
      content: "Here's a code snippet showing an alternative approach:",
      postId: post1.id,
      authorId: omar.id,
      moderationStatus: ModerationStatus.APPROVED,
    },
  });

  await prisma.commentMedia.create({
    data: {
      commentId: commentWithMedia.id,
      mediaFileId: media4.id,
      order: 0,
    },
  });

  // ==================== 11. CREATE REACTIONS ====================

  await Promise.all([
    // Reactions on posts
    prisma.reaction.create({
      data: {
        type: ReactionType.LIKE,
        userId: ahmed.id,
        postId: post1.id,
      },
    }),
    prisma.reaction.create({
      data: {
        type: ReactionType.LOVE,
        userId: fatima.id,
        postId: post1.id,
      },
    }),
    prisma.reaction.create({
      data: {
        type: ReactionType.INSIGHTFUL,
        userId: omar.id,
        postId: post1.id,
      },
    }),
    prisma.reaction.create({
      data: {
        type: ReactionType.FIRE,
        userId: layla.id,
        postId: post2.id,
      },
    }),
    // Reactions on comments
    prisma.reaction.create({
      data: {
        type: ReactionType.LIKE,
        userId: ahmed.id,
        commentId: comment1.id,
      },
    }),
    prisma.reaction.create({
      data: {
        type: ReactionType.CELEBRATE,
        userId: fatima.id,
        commentId: comment1.id,
      },
    }),
  ]);

  // ==================== 12. CREATE FOLLOWS ====================

  await Promise.all([
    // Accepted follows
    prisma.follow.create({
      data: {
        followerId: ahmed.id,
        followingId: fatima.id,
        status: FollowStatus.ACCEPTED,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: ahmed.id,
        followingId: omar.id,
        status: FollowStatus.ACCEPTED,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: fatima.id,
        followingId: ahmed.id,
        status: FollowStatus.ACCEPTED,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: omar.id,
        followingId: ahmed.id,
        status: FollowStatus.ACCEPTED,
      },
    }),
    // Pending follow (private account)
    prisma.follow.create({
      data: {
        followerId: layla.id,
        followingId: fatima.id, // Fatima has private account
        status: FollowStatus.PENDING,
      },
    }),
  ]);

  // ==================== 13. CREATE SHARES ====================

  await Promise.all([
    prisma.share.create({
      data: {
        postId: post1.id,
        userId: ahmed.id,
        platform: SharePlatform.TWITTER,
      },
    }),
    prisma.share.create({
      data: {
        postId: post1.id,
        userId: fatima.id,
        platform: SharePlatform.LINKEDIN,
      },
    }),
    prisma.share.create({
      data: {
        postId: post2.id,
        userId: omar.id,
        platform: SharePlatform.FACEBOOK,
      },
    }),
    prisma.share.create({
      data: {
        postId: post3.id,
        platform: SharePlatform.COPY_LINK, // Anonymous share
      },
    }),
  ]);

  // ==================== 14. CREATE AUDIT LOGS ====================

  await Promise.all([
    prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: AuditAction.APPROVE,
        entityType: 'Post',
        entityId: post1.id,
        changes: JSON.stringify({ moderationStatus: { from: 'PENDING', to: 'APPROVED' } }),
        reason: 'Content meets quality standards',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: moderatorUser.id,
        action: AuditAction.FLAG,
        entityType: 'Comment',
        entityId: comment1.id,
        changes: JSON.stringify({ moderationStatus: { from: 'APPROVED', to: 'FLAGGED' } }),
        reason: 'Reported by multiple users',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...',
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: AuditAction.BAN,
        entityType: 'User',
        entityId: sarah.id, // Sarah (banned user)
        changes: JSON.stringify({ isBanned: { from: false, to: true } }),
        reason: 'Violation of community guidelines - spam posting',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: ahmed.id,
        action: AuditAction.PUBLISH,
        entityType: 'Post',
        entityId: post1.id,
        changes: JSON.stringify({ status: { from: 'DRAFT', to: 'PUBLISHED' } }),
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0...',
      },
    }),
  ]);
}

main()
  .catch((_) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
