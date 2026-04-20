# Better Auth Migration Plan

## Overview

This document outlines the migration plan from `next-auth` (v5.0.0-beta.30) to `better-auth` for the Al-Ramy-Blog webapp. Better Auth is the successor to NextAuth.js and offers a more streamlined API, better TypeScript support, and a plugin-based architecture.

## Current State Analysis

### Existing Authentication Setup

| Component | Current Implementation |
|-----------|----------------------|
| Auth Library | `next-auth@5.0.0-beta.30` |
| Adapter | `@auth/prisma-adapter` with custom OAuthAccount mapping |
| Session Strategy | JWT |
| Database | PostgreSQL via Prisma |

### Current OAuth Providers (5 total)
- Google
- GitHub
- Twitter/X
- LinkedIn
- **Facebook** (to be removed)

### Current Credentials Auth
- Email/password with bcryptjs hashing
- Zod validation schema
- Server action-based registration

### Files to Migrate

| File | Purpose | Migration Action |
|------|---------|------------------|
| `apps/webapp/auth.ts` | NextAuth configuration | Replace with Better Auth config |
| `apps/webapp/app/api/auth/[...nextauth]/route.ts` | NextAuth API routes | Replace with Better Auth handler |
| `apps/webapp/app/actions/auth.ts` | Server actions for auth | Refactor to use Better Auth API |
| `apps/webapp/app/(auth)/register/register-form.tsx` | Registration form | Update to use Better Auth client |
| `apps/webapp/app/(auth)/components/oauth-buttons.tsx` | OAuth provider buttons | Update and remove Facebook |
| `apps/webapp/app/layout.tsx` | SessionProvider wrapper | Replace with Better Auth provider |
| `apps/webapp/types/next-auth.d.ts` | Type declarations | Replace with Better Auth types |
| `apps/webapp/middleware.ts` | Auth middleware (deleted) | Recreate with Better Auth |
| `packages/database/prisma/schema.prisma` | Database schema | Update for Better Auth models |

---

## Migration Steps

### Phase 1: Package Management

#### 1.1 Remove next-auth packages
```bash
pnpm remove next-auth @auth/prisma-adapter --filter webapp
```

#### 1.2 Install better-auth
```bash
pnpm add better-auth --filter webapp
```

**Note:** `bcryptjs` and `zod` will be retained as Better Auth uses them internally or we can use them for validation.

---

### Phase 2: Database Schema Updates

Better Auth requires specific tables. We need to update the Prisma schema to accommodate Better Auth's data models while preserving existing custom fields.

#### 2.1 Better Auth Required Models

Better Auth expects the following core models:

| Model | Purpose |
|-------|---------|
| `user` | User accounts |
| `session` | Session management |
| `account` | OAuth provider accounts |
| `verification` | Email verification tokens |

#### 2.2 Prisma Schema Changes

The existing schema already has similar models. We need to:

1. **User Model** - Keep existing fields, add Better Auth required fields if missing
2. **Session Model** - Update to match Better Auth expectations:
   - Add `token` field
   - Add `expiresAt` field
   - Add `ipAddress` field (optional)
   - Add `userAgent` field (optional)
3. **Account Model (OAuthAccount)** - Rename and adjust fields:
   - Rename `OAuthAccount` to `Account`
   - Add `accountId` field
   - Add `accessTokenExpiresAt` field
   - Add `refreshTokenExpiresAt` field
4. **Verification Model** - Update `VerificationToken`:
   - Rename to `Verification`
   - Add `value` field
   - Add `createdAt` field
   - Update field names to match Better Auth

#### 2.3 Schema Migration Script

After updating the schema, run:
```bash
# Generate Better Auth schema additions
npx @better-auth/cli generate --config apps/webapp/lib/auth.ts

# Apply migrations
pnpm --filter database prisma migrate dev --name better_auth_migration
```

#### 2.4 Proposed Schema Updates

```prisma
// Updated Session model for Better Auth
model Session {
  id        String   @id @default(uuid())
  token     String   @unique  // Better Auth uses token instead of sessionToken
  userId    String
  expiresAt DateTime           // Renamed from expires
  ipAddress String?            // Optional: Better Auth can track IP
  userAgent String?            // Optional: Better Auth can track user agent
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("sessions")
}

// Updated Account model for Better Auth (renamed from OAuthAccount)
model Account {
  id                    String    @id @default(uuid())
  userId                String
  accountId             String    // Provider's user ID
  providerId            String    // Renamed from provider
  accessToken           String?   @db.Text
  refreshToken          String?   @db.Text
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  idToken               String?   @db.Text
  password              String?   // For credential accounts
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
  @@index([userId])
  @@map("accounts")
}

// Updated Verification model for Better Auth
model Verification {
  id         String   @id @default(uuid())
  identifier String
  value      String   // The verification token value
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([identifier, value])
  @@map("verifications")
}
```

---

### Phase 3: Better Auth Configuration

#### 3.1 Create Better Auth Server Instance

Create new file: `apps/webapp/lib/auth.ts`

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@workspace/database";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Enable email/password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if email verification needed
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  // Social providers (Facebook removed)
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    },
    github: {
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    },
    twitter: {
      clientId: process.env.AUTH_TWITTER_ID!,
      clientSecret: process.env.AUTH_TWITTER_SECRET!,
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // Custom user fields
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false, // Don't allow users to set role on signup
      },
      username: {
        type: "string",
        required: false,
        unique: true,
      },
      isPrivate: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      isBanned: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      twoFactorEnabled: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },

  // Advanced configuration
  advanced: {
    generateId: () => crypto.randomUUID(),
  },

  // Base URL
  baseURL: process.env.AUTH_URL || "http://localhost:3000",

  // Trust host in production
  trustedOrigins: [
    process.env.AUTH_URL || "http://localhost:3000",
  ],
});

// Export types for use throughout the app
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
```

#### 3.2 Create Better Auth Client Instance

Create new file: `apps/webapp/lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Export hooks and methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;

// Export session type inference
export type Session = typeof authClient.$Infer.Session;
```

---

### Phase 4: API Route Migration

#### 4.1 Replace NextAuth Route Handler

Delete: `apps/webapp/app/api/auth/[...nextauth]/route.ts`

Create: `apps/webapp/app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
```

---

### Phase 5: Middleware Migration

#### 5.1 Create New Middleware

Create: `apps/webapp/middleware.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/dashboard", "/profile", "/settings"];
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (sessionCookie && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login
  if (!sessionCookie && protectedRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
```

---

### Phase 6: Server Actions Migration

#### 6.1 Update Auth Actions

Update: `apps/webapp/app/actions/auth.ts`

```typescript
'use server';

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterFormState = {
  success: boolean;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
};

export async function registerUser(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const validatedFields = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // Use Better Auth server-side API for registration
    const response = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (response.error) {
      return {
        success: false,
        message: response.error.message || "Registration failed",
        errors: {
          email: response.error.code === "USER_ALREADY_EXISTS"
            ? ["An account with this email already exists"]
            : undefined,
        },
      };
    }

    return {
      success: true,
      message: "Account created successfully! You can now sign in.",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

export async function signInWithCredentials(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string } | undefined> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });

    if (response.error) {
      return { error: response.error.message || "Invalid email or password" };
    }

    // Redirect on success
    redirect("/dashboard");
  } catch (error) {
    console.error("Sign in error:", error);
    return { error: "Something went wrong" };
  }
}

export async function signInWithProvider(provider: "google" | "github" | "twitter") {
  // Better Auth handles OAuth redirects via the client
  // This will be replaced with client-side authClient.signIn.social()
  redirect(`/api/auth/signin/${provider}`);
}

export async function signOutAction() {
  const response = await auth.api.signOut({
    headers: await headers(),
  });

  if (!response.error) {
    redirect("/login");
  }
}
```

---

### Phase 7: Component Updates

#### 7.1 Update Register Form

The register form can largely remain the same since it uses server actions. Minor updates may be needed for error handling.

#### 7.2 Update OAuth Buttons

Update: `apps/webapp/app/(auth)/components/oauth-buttons.tsx`

```typescript
'use client';

import { Button } from '@workspace/ui/components/button';
import { authClient } from '@/lib/auth-client';

// Remove Facebook, keep Google, GitHub, Twitter
const providers = [
  {
    id: 'google' as const,
    name: 'Google',
    icon: (/* Google SVG */),
  },
  {
    id: 'github' as const,
    name: 'GitHub',
    icon: (/* GitHub SVG */),
  },
  {
    id: 'twitter' as const,
    name: 'Twitter',
    icon: (/* Twitter SVG */),
  },
];

export function OAuthButtons() {
  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'twitter') => {
    await authClient.signIn.social({
      provider,
      callbackURL: '/dashboard',
    });
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          size="icon"
          className="w-full"
          title={`Sign in with ${provider.name}`}
          onClick={() => handleOAuthSignIn(provider.id)}
        >
          {provider.icon}
          <span className="sr-only">Sign in with {provider.name}</span>
        </Button>
      ))}
    </div>
  );
}
```

#### 7.3 Update Root Layout (Session Provider)

Update: `apps/webapp/app/layout.tsx`

Remove `SessionProvider` from next-auth/react. Better Auth doesn't require a provider wrapper - it uses cookies directly and the `useSession` hook handles session state internally.

```typescript
// Remove this import and wrapper:
// import { SessionProvider } from 'next-auth/react';

// The layout becomes simpler - no auth provider needed
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

---

### Phase 8: Type Declarations

#### 8.1 Remove next-auth types

Delete: `apps/webapp/types/next-auth.d.ts`

Better Auth provides built-in type inference through the `$Infer` utility exported from the auth instance.

#### 8.2 Create Better Auth types (optional enhancement)

Create: `apps/webapp/types/auth.d.ts`

```typescript
import type { auth } from "@/lib/auth";

// Re-export Better Auth types for convenience
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

// Extended user type with custom fields
export interface ExtendedUser extends User {
  role: "ADMIN" | "MODERATOR" | "USER";
  username?: string;
  isPrivate: boolean;
  isBanned: boolean;
  twoFactorEnabled: boolean;
}
```

---

### Phase 9: Environment Variables

#### 9.1 Update Environment Variables

Better Auth uses slightly different naming conventions. Update `.env`:

```env
# Better Auth
BETTER_AUTH_SECRET=your-secret-key  # Or keep AUTH_SECRET
BETTER_AUTH_URL=http://localhost:3000

# OAuth Providers (can keep same names or update)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

AUTH_TWITTER_ID=your-twitter-client-id
AUTH_TWITTER_SECRET=your-twitter-client-secret

# Remove Facebook credentials
# AUTH_FACEBOOK_ID=...
# AUTH_FACEBOOK_SECRET=...

# Add for client-side
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Phase 10: Cleanup

#### 10.1 Files to Delete
- `apps/webapp/auth.ts` (old NextAuth config)
- `apps/webapp/app/api/auth/[...nextauth]/route.ts`
- `apps/webapp/types/next-auth.d.ts`

#### 10.2 Files to Create
- `apps/webapp/lib/auth.ts` (Better Auth server config)
- `apps/webapp/lib/auth-client.ts` (Better Auth client config)
- `apps/webapp/app/api/auth/[...all]/route.ts` (Better Auth API route)

#### 10.3 Remove Unused Dependencies
```bash
pnpm remove next-auth @auth/prisma-adapter --filter webapp
```

---

## Data Migration Considerations

### Existing Users
- Existing users with email/password authentication should work seamlessly
- Password hashing (bcrypt) is compatible with Better Auth

### Existing OAuth Accounts
A migration script may be needed to transform existing `OAuthAccount` records to the new `Account` schema:

```typescript
// Migration script pseudo-code
const oauthAccounts = await prisma.oAuthAccount.findMany();

for (const account of oauthAccounts) {
  await prisma.account.create({
    data: {
      userId: account.userId,
      accountId: account.providerAccountId,
      providerId: account.provider,
      accessToken: account.access_token,
      refreshToken: account.refresh_token,
      accessTokenExpiresAt: account.expires_at
        ? new Date(account.expires_at * 1000)
        : null,
      scope: account.scope,
      idToken: account.id_token,
    },
  });
}
```

### Sessions
Existing sessions will be invalidated after migration. Users will need to sign in again.

---

## Testing Checklist

### Registration Flow
- [ ] Email/password registration creates user successfully
- [ ] Validation errors display correctly
- [ ] Duplicate email shows appropriate error
- [ ] Successful registration allows immediate login

### OAuth Flow
- [ ] Google sign-in works
- [ ] GitHub sign-in works
- [ ] Twitter/X sign-in works
- [ ] OAuth creates/links account correctly
- [ ] Facebook option is removed from UI

### Session Management
- [ ] Session persists across page reloads
- [ ] Session expires correctly
- [ ] Sign out clears session
- [ ] Protected routes redirect to login
- [ ] Auth routes redirect to dashboard when logged in

### Database
- [ ] User records created correctly
- [ ] Account records linked to users
- [ ] Session records managed properly
- [ ] Custom user fields (role, etc.) preserved

---

## Rollback Plan

If issues arise during migration:

1. **Keep backup of database** before running migrations
2. **Git branch strategy**: Work on feature branch, only merge after testing
3. **Package.json backup**: Can restore next-auth dependencies if needed
4. **Schema rollback**: Prisma migration can be reverted with `prisma migrate reset`

---

## Summary

| Item | From | To |
|------|------|-----|
| Auth Library | `next-auth@5.0.0-beta.30` | `better-auth@latest` |
| Adapter | `@auth/prisma-adapter` | `better-auth/adapters/prisma` |
| OAuth Providers | 5 (incl. Facebook) | 3 (Google, GitHub, Twitter) |
| API Route | `/api/auth/[...nextauth]` | `/api/auth/[...all]` |
| Session Access | `SessionProvider` + `useSession` | `authClient.useSession()` |

This migration modernizes the authentication system while maintaining all existing functionality (except Facebook login as requested).
