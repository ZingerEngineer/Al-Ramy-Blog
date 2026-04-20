# Immediate Next Steps - Development Plan

**Status**: Ready for Implementation
**Timeline**: Next 1-2 weeks
**Priority**: High

---

## Phase 1: Environment Setup & Verification

### 1.1 Install Dependencies ⏱️ 5 minutes

```bash
cd /home/zindora/Apps/Al-Ramy-Blog
pnpm install
```

**Expected outcome**: All dependencies installed, workspace links created

**Verification**:
```bash
pnpm -r list  # Should show all 9 workspaces (2 apps + 7 packages)
```

### 1.2 Database Setup ⏱️ 10-15 minutes

**Prerequisites**: PostgreSQL installed and running

1. Create database:
   ```sql
   CREATE DATABASE alramy_blog;
   CREATE USER alramy_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE alramy_blog TO alramy_user;
   ```

2. Configure environment variables:
   ```bash
   # Copy templates
   cp apps/webapp/.env.local.template apps/webapp/.env.local
   cp apps/admin/.env.local.template apps/admin/.env.local

   # Edit and add DATABASE_URL
   # DATABASE_URL="postgresql://alramy_user:your_password@localhost:5432/alramy_blog"
   ```

3. Generate Prisma client:
   ```bash
   pnpm db:generate
   ```

4. Run migrations:
   ```bash
   pnpm db:migrate
   ```

5. (Optional) Seed database:
   ```bash
   pnpm db:seed
   ```

**Expected outcome**: Database schema created, Prisma client generated

**Verification**:
```bash
pnpm db:studio  # Opens Prisma Studio to view database
```

### 1.3 Start Development Servers ⏱️ 2 minutes

```bash
# Start both apps
pnpm dev

# Or start individually
pnpm dev:webapp  # http://localhost:3000
pnpm dev:admin   # http://localhost:3001
```

**Expected outcome**: Both apps running without errors

**Verification**:
- Visit http://localhost:3000 - Should see "Welcome to Al-Ramy Blog"
- Visit http://localhost:3001 - Should see "Admin Dashboard"

### 1.4 Verify Code Quality Tools ⏱️ 2 minutes

```bash
pnpm run lint      # Should pass (no errors)
pnpm run typecheck # Should pass (no type errors)
```

**Expected outcome**: All checks pass

---

## Phase 2: Add Essential shadcn/ui Components ⏱️ 30-45 minutes

### 2.1 Install shadcn/ui Components

Navigate to shadcn package:
```bash
cd packages/shadcn
```

Install essential components:
```bash
# Form components
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add label
npx shadcn@latest add form

# Layout components
npx shadcn@latest add card
npx shadcn@latest add separator
npx shadcn@latest add avatar

# Feedback components
npx shadcn@latest add alert
npx shadcn@latest add toast

# Navigation
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs

# Data display
npx shadcn@latest add table
npx shadcn@latest add badge
```

### 2.2 Export Components

Update `packages/shadcn/src/index.ts`:
```typescript
// Export utilities
export { cn } from './lib/utils.js';

// Export UI components
export { Button } from './ui/button.js';
export { Input } from './ui/input.js';
export { Textarea } from './ui/textarea.js';
export { Label } from './ui/label.js';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card.js';
// ... add all installed components
```

### 2.3 Verify Import in Apps

Test in `apps/webapp/app/page.tsx`:
```typescript
import { Button } from '@al-ramy/shadcn';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Button>Click me</Button>
    </main>
  );
}
```

**Expected outcome**: Button renders with shadcn/ui styling

---

## Phase 3: Implement Authentication Foundation ⏱️ 2-3 hours

### 3.1 Install NextAuth.js

```bash
pnpm --filter webapp add next-auth
pnpm --filter admin add next-auth
pnpm --filter @al-ramy/server add bcryptjs
pnpm --filter @al-ramy/server add -D @types/bcryptjs
```

### 3.2 Update Prisma Schema

Add to `packages/database/prisma/schema.prisma`:
```prisma
model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// Add to User model
model User {
  // ... existing fields
  accounts Account[]
  sessions Session[]
}
```

Run migration:
```bash
pnpm db:migrate
```

### 3.3 Create Auth Utilities in @al-ramy/server

Create `packages/server/src/auth/password.ts`:
```typescript
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 3.4 Set Up NextAuth

Create `apps/webapp/app/api/auth/[...nextauth]/route.ts`

**Expected outcome**: Authentication ready for implementation

---

## Phase 4: Create Basic Blog Post Management ⏱️ 3-4 hours

### 4.1 Create API Routes

In `apps/admin/app/api/posts/route.ts`:
- GET /api/posts - List posts
- POST /api/posts - Create post

In `apps/admin/app/api/posts/[id]/route.ts`:
- GET /api/posts/[id] - Get single post
- PUT /api/posts/[id] - Update post
- DELETE /api/posts/[id] - Delete post

### 4.2 Create Admin Post List Page

`apps/admin/app/posts/page.tsx`:
- Display posts in table
- Filter by published/draft
- Search by title
- Pagination

### 4.3 Create Admin Post Editor

`apps/admin/app/posts/[id]/edit/page.tsx`:
- Rich text editor for content
- Title, excerpt, slug fields
- Publish/draft toggle
- Category selection

### 4.4 Create Public Post Display

`apps/webapp/app/blog/[slug]/page.tsx`:
- Display published post
- Author information
- Related posts

**Expected outcome**: Basic post CRUD functionality working

---

## Phase 5: File Upload with S3 ⏱️ 2-3 hours

### 5.1 Install S3 SDK

```bash
pnpm --filter @al-ramy/server add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 5.2 Implement S3 Helpers

Update `packages/server/src/storage/index.ts` with real S3 implementation

### 5.3 Create Upload API Route

`apps/admin/app/api/upload/route.ts`:
- Accept image uploads
- Resize images (optional)
- Upload to S3
- Return URL

### 5.4 Add Image Upload to Post Editor

- Drag-and-drop interface
- Preview before upload
- Insert into content

**Expected outcome**: Images can be uploaded and displayed in posts

---

## Phase 6: Testing Setup ⏱️ 1-2 hours

### 6.1 Install Testing Tools

```bash
# Install Vitest for unit tests
pnpm add -w -D vitest @vitest/ui

# Install React Testing Library
pnpm add -w -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### 6.2 Create Test Configuration

Create `vitest.config.ts` at root

### 6.3 Write Sample Tests

- Test `@al-ramy/types` type definitions
- Test `@al-ramy/server` validation schemas
- Test `@al-ramy/hooks` React hooks
- Test UI components

### 6.4 Update CI/CD

Add test step to `.github/workflows/ci.yml`:
```yaml
- name: Run tests
  run: pnpm test
```

**Expected outcome**: Tests passing in CI

---

## Success Criteria

After completing these phases, you should have:

✅ Working development environment
✅ Database setup and migrations
✅ shadcn/ui components installed
✅ Authentication foundation
✅ Basic post CRUD functionality
✅ Image upload capability
✅ Testing infrastructure

---

## Validation Checklist

- [ ] `pnpm install` completes without errors
- [ ] Database migrations run successfully
- [ ] Both apps start and display correctly
- [ ] Can create, edit, delete posts in admin
- [ ] Posts display correctly on public site
- [ ] Images can be uploaded
- [ ] Tests pass locally and in CI
- [ ] Code quality checks pass (lint, typecheck)
- [ ] Pre-commit hooks work

---

## Troubleshooting

### Common Issues

**Issue**: `pnpm install` fails
**Solution**: Delete `node_modules` and `pnpm-lock.yaml`, run `pnpm install` again

**Issue**: Prisma client not found
**Solution**: Run `pnpm db:generate`

**Issue**: TypeScript can't resolve `@al-ramy/*` imports
**Solution**: Restart TypeScript server in your IDE

**Issue**: Apps don't start
**Solution**: Check for port conflicts (3000, 3001), kill existing processes

**Issue**: Database connection error
**Solution**: Verify PostgreSQL is running, check DATABASE_URL in .env.local

---

## Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [NextAuth.js Docs](https://next-auth.js.org)
- [pnpm Workspace Docs](https://pnpm.io/workspaces)

---

**Plan Owner**: Development Team
**Last Updated**: 2025-12-10
**Next Review**: After Phase 4 completion
