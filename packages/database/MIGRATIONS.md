# Database Migrations Guide

This guide covers the migration workflow for the Al-Ramy Blog database using Prisma 7.

## Overview

Prisma Migrate is a declarative data modeling and migration system. It uses your Prisma schema as the source of truth and generates SQL migrations that update your database to match the schema.

## Migration Workflow

### 1. Development Workflow

When developing new features or making schema changes:

#### Step 1: Modify the Schema

Edit `packages/database/prisma/schema.prisma`:

```prisma
model NewFeature {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())

  @@map("new_features")
}
```

#### Step 2: Create Migration

```bash
# From project root
pnpm db:migrate

# Or from packages/database
pnpm prisma:migrate
```

This will:
1. Generate a new migration file in `prisma/migrations/`
2. Apply the migration to your database
3. Regenerate Prisma Client

#### Step 3: Name Your Migration

When prompted, provide a descriptive migration name:

```bash
# Good examples
add_user_verification_fields
create_notification_system
update_post_slug_constraints

# Bad examples
migration
update
fix
```

#### Step 4: Review Generated SQL

Check the generated SQL in `prisma/migrations/TIMESTAMP_migration_name/migration.sql`:

```sql
-- CreateTable
CREATE TABLE "new_features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "new_features_pkey" PRIMARY KEY ("id")
);
```

#### Step 5: Regenerate Client

If the migration was successful, regenerate Prisma Client and Zod schemas:

```bash
pnpm db:generate
```

### 2. Production Workflow

#### Deploy Migrations to Production

```bash
# Apply pending migrations
npx prisma migrate deploy

# This command:
# - Applies all pending migrations
# - Does NOT create new migrations
# - Does NOT prompt for user input
# - Suitable for CI/CD pipelines
```

#### Check Migration Status

```bash
# View migration history
npx prisma migrate status

# This shows:
# - Applied migrations
# - Pending migrations
# - Database connection status
```

## Migration Naming Conventions

Use clear, descriptive names that explain what the migration does:

### ✅ Good Names

```
add_user_email_verification
create_audit_log_table
update_post_add_excerpt_field
remove_deprecated_user_fields
add_unique_constraint_to_username
create_indexes_for_post_queries
rename_category_description_column
```

### ❌ Bad Names

```
update
fix
new_migration
test
migration_1
changes
schema_update
```

### Naming Patterns

```
[action]_[entity]_[description]

Actions:
- create: New table/model
- add: New field(s)
- update: Modify existing field(s)
- remove/delete: Remove field(s)
- rename: Rename field/table
- alter: Change field type/constraint
- add_index: Add database index
- add_constraint: Add constraint
```

## Common Migration Scenarios

### Adding a New Field

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  // New field
  phoneNumber  String?  // Optional to avoid issues with existing data
  createdAt    DateTime @default(now())
}
```

```bash
pnpm db:migrate
# Name: add_user_phone_number_field
```

### Making a Field Required

```prisma
model User {
  id       String  @id @default(uuid())
  email    String  @unique
  // Changed from String? to String
  name     String  @default("Anonymous") // Provide default for existing rows
}
```

```bash
pnpm db:migrate
# Name: make_user_name_required_with_default
```

### Adding a Unique Constraint

```prisma
model Post {
  id    String @id @default(uuid())
  slug  String @unique // Added @unique
  title String
}
```

```bash
pnpm db:migrate
# Name: add_unique_constraint_to_post_slug
```

### Adding an Index

```prisma
model Post {
  id          String   @id @default(uuid())
  authorId    String
  publishedAt DateTime

  @@index([authorId, publishedAt]) // Composite index
  @@index([publishedAt]) // Single field index
}
```

```bash
pnpm db:migrate
# Name: add_indexes_to_post_for_author_and_date_queries
```

### Renaming a Field

```prisma
model User {
  id           String @id @default(uuid())
  // Renamed from 'fullName' to 'name'
  name         String @map("full_name") // Use @map to preserve column name
}
```

```bash
pnpm db:migrate
# Name: rename_user_fullname_to_name
```

### Adding a Relation

```prisma
model Post {
  id       String @id @default(uuid())
  authorId String

  author User @relation(fields: [authorId], references: [id])

  @@index([authorId])
}

model User {
  id    String @id @default(uuid())
  posts Post[]
}
```

```bash
pnpm db:migrate
# Name: add_post_author_relation
```

### Changing Field Type

```prisma
model Post {
  id      String @id @default(uuid())
  // Changed from String to Int
  likes   Int    @default(0) // Provide default value
}
```

**⚠️ Warning**: Type changes can cause data loss. Ensure data compatibility!

```bash
pnpm db:migrate
# Name: change_post_likes_from_string_to_int
```

## Migration Best Practices

### 1. Always Review Generated SQL

Before applying migrations, review the SQL:

```bash
# Check the latest migration
cat packages/database/prisma/migrations/$(ls -t packages/database/prisma/migrations | head -1)/migration.sql
```

### 2. Backup Before Major Changes

```bash
# Backup database
pnpm dev:postgres:backup

# This creates: backup_YYYYMMDD_HHMMSS.sql
```

### 3. Test Migrations in Development First

```bash
# 1. Reset dev database
pnpm dev:docker:reset

# 2. Apply migrations
pnpm db:migrate

# 3. Test with seed data
pnpm db:seed

# 4. Verify in Prisma Studio
pnpm db:studio
```

### 4. Never Edit Applied Migrations

Once a migration is applied (especially in production), never modify it. Instead:

1. Create a new migration to fix issues
2. Use `prisma migrate resolve` for failed migrations (advanced)

### 5. Handle Data Migration

For complex data transformations, use migration scripts:

```typescript
// prisma/migrations/TIMESTAMP_migrate_data/migration.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  // Example: Migrate old data to new structure
  const users = await prisma.user.findMany();

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: `${user.firstName} ${user.lastName}`,
      },
    });
  }
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 6. Use Optional Fields for New Required Data

When adding a required field to a model with existing data:

```prisma
// ❌ Bad: Will fail if table has data
model User {
  id       String @id
  newField String // Required with no default
}

// ✅ Good: Make optional or provide default
model User {
  id       String @id
  newField String? // Optional
  // OR
  newField String @default("default_value") // With default
}
```

## Troubleshooting

### Migration Failed

If a migration fails:

```bash
# 1. Check migration status
npx prisma migrate status

# 2. View the error
# The error will indicate which SQL statement failed

# 3. Fix the schema issue

# 4. Create a new migration
pnpm db:migrate
```

### Diverged Migration History

If your migration history diverges from the database:

```bash
# Reset database (DEVELOPMENT ONLY)
pnpm dev:docker:reset
pnpm db:migrate

# For production, use:
npx prisma migrate resolve --applied "MIGRATION_NAME"
```

### Out of Sync Schema

If schema and database are out of sync:

```bash
# Check status
npx prisma migrate status

# Regenerate client
pnpm db:generate

# Or use db push (dev only - skips migrations)
pnpm db:push
```

### Prisma Studio Shows Old Schema

```bash
# Regenerate Prisma Client
pnpm db:generate

# Restart Prisma Studio
# Kill the existing process and run:
pnpm db:studio
```

## Migration History

### Current Migration

The database was initialized with migration:

```
20251212212654_initializing_business_entities
```

This migration created all 15 models with complete relationships, indexes, and constraints.

## Rollback Strategies

Prisma doesn't have built-in rollback. For rollbacks:

### Option 1: Database Backup Restore

```bash
# Restore from backup
pnpm dev:postgres:restore
```

### Option 2: Create Reverse Migration

```prisma
// If you added a field, remove it
// If you removed a field, add it back
// Then create a new migration
pnpm db:migrate
```

### Option 3: Reset and Replay (Development Only)

```bash
pnpm dev:docker:reset
pnpm db:migrate
pnpm db:seed
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Database Migrations
  run: |
    npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}

- name: Generate Prisma Client
  run: |
    npx prisma generate
```

### Docker Deployment

```dockerfile
# In your Dockerfile
RUN npx prisma generate
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
```

## Schema Evolution Guidelines

### Safe Changes (No Data Loss)

- Adding optional fields
- Adding new models
- Adding indexes
- Making required fields optional
- Adding default values

### Risky Changes (Potential Data Loss)

- Making optional fields required (without default)
- Changing field types
- Removing fields
- Removing models
- Changing unique constraints

### High-Risk Changes (Will Cause Data Loss)

- Removing tables with data
- Changing primary keys
- Removing required fields

## Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Migration Troubleshooting](https://www.prisma.io/docs/guides/migrate/troubleshooting-development)

## Getting Help

- Check Prisma logs: `npx prisma migrate status`
- View schema diff: `npx prisma migrate diff`
- Reset development database: `pnpm dev:docker:reset`
- Join Prisma Discord: [https://pris.ly/discord](https://pris.ly/discord)
