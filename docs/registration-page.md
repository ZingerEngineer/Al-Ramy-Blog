# Registration Page Implementation

## Overview

The registration page provides two methods for user registration:
1. **Traditional Registration** - Email and password-based registration
2. **OAuth Registration** - Social login with Google, GitHub, Twitter/X, LinkedIn, and Facebook

Built with **Auth.js v5 (NextAuth)** and integrated with the existing Prisma database schema.

---

## Architecture

```
apps/webapp/
├── auth.ts                                    # NextAuth configuration
├── middleware.ts                              # Route protection
├── types/
│   └── next-auth.d.ts                        # Type extensions
├── app/
│   ├── layout.tsx                            # Root layout with SessionProvider
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts                          # Auth API handlers
│   ├── (auth)/
│   │   ├── layout.tsx                        # Auth pages layout
│   │   ├── register/
│   │   │   ├── page.tsx                      # Registration page
│   │   │   └── register-form.tsx             # Registration form component
│   │   ├── error/
│   │   │   └── page.tsx                      # Auth error page
│   │   └── components/
│   │       └── oauth-buttons.tsx             # OAuth provider buttons
│   └── actions/
│       └── auth.ts                           # Server actions
```

---

## Database Schema

### New Models Added

#### Session Model
```prisma
model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}
```

#### VerificationToken Model
```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

### Modified Models

#### OAuthAccount Model
Updated to use Auth.js snake_case conventions:

```prisma
model OAuthAccount {
  id                String   @id @default(uuid())
  userId            String
  type              String   @default("oauth")
  provider          String
  providerAccountId String
  access_token      String?  @db.Text
  refresh_token     String?  @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?  @db.Text
  session_state     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
  @@index([provider])
  @@map("oauth_accounts")
}
```

#### User Model
Added sessions relation:
```prisma
model User {
  // ... existing fields ...
  sessions      Session[]
  // ... existing relations ...
}
```

---

## Authentication Configuration

### Auth.js Setup (`auth.ts`)

The auth configuration includes:

1. **Custom Prisma Adapter** - Maps the `OAuthAccount` model to Auth.js expectations
2. **OAuth Providers** - Google, GitHub, Twitter, LinkedIn, Facebook
3. **Credentials Provider** - Email/password authentication
4. **JWT Strategy** - For session management
5. **Callbacks** - For adding user role to session

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: customPrismaAdapter,
  providers: [
    GitHub({ clientId, clientSecret }),
    Google({ clientId, clientSecret }),
    Twitter({ clientId, clientSecret }),
    LinkedIn({ clientId, clientSecret }),
    Facebook({ clientId, clientSecret }),
    Credentials({
      credentials: { email, password },
      authorize: async (credentials) => {
        // Validate with Zod
        // Find user in database
        // Verify password with bcrypt
        // Return user object
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) { /* Add user.id and user.role to token */ },
    session({ session, token }) { /* Add token.id and token.role to session */ },
  },
});
```

---

## Registration Flow

### Traditional Registration

1. User fills out the registration form (name, email, password, confirm password)
2. Form submits to `registerUser` server action
3. Server action validates input with Zod schema
4. Checks if email already exists
5. Hashes password with bcrypt (12 salt rounds)
6. Creates user in database
7. Returns success message

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Validation Schema

```typescript
const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
```

### OAuth Registration

1. User clicks an OAuth provider button
2. `signInWithProvider` server action is called
3. User is redirected to the provider's authorization page
4. After authorization, user is redirected back to `/api/auth/callback/{provider}`
5. Auth.js creates/links the account in the database
6. User is redirected to `/dashboard`

---

## Server Actions

### `registerUser`

Creates a new user with email/password.

```typescript
export async function registerUser(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState>
```

**Returns:**
- `{ success: true, message: string }` - On successful registration
- `{ success: false, errors: {...} }` - On validation errors
- `{ success: false, message: string }` - On server errors

### `signInWithCredentials`

Signs in a user with email/password.

```typescript
export async function signInWithCredentials(
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string } | undefined>
```

### `signInWithProvider`

Initiates OAuth sign-in with a provider.

```typescript
export async function signInWithProvider(provider: string): Promise<void>
```

---

## Route Protection

### Middleware (`middleware.ts`)

Protects routes and handles auth redirects:

```typescript
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = /* /login or /register */;
  const isProtectedRoute = /* /dashboard or /profile */;

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/login', '/register'],
};
```

---

## UI Components

### Registration Page (`/register`)

- Card-based layout centered on screen
- OAuth buttons grid (5 providers)
- Divider with "Or continue with"
- Registration form with validation
- Link to login page

### OAuth Buttons Component

Renders 5 social login buttons in a grid:
- Google
- GitHub
- Twitter/X
- LinkedIn
- Facebook

Each button triggers the `signInWithProvider` server action.

### Registration Form Component

Client component using `useActionState` for form handling:
- Name input
- Email input
- Password input
- Confirm password input
- Submit button with loading state
- Error display for validation errors
- Success message with link to login

### Error Page (`/error`)

Displays authentication errors with descriptive messages:
- Configuration errors
- Access denied
- OAuth errors
- Credentials errors
- Generic errors

---

## Environment Variables

Add these to your `.env` file:

```bash
# Auth.js Configuration
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# OAuth Providers
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

AUTH_TWITTER_ID=""
AUTH_TWITTER_SECRET=""

AUTH_LINKEDIN_ID=""
AUTH_LINKEDIN_SECRET=""

AUTH_FACEBOOK_ID=""
AUTH_FACEBOOK_SECRET=""
```

### Generating AUTH_SECRET

```bash
openssl rand -base64 32
```

---

## OAuth Provider Setup

### Callback URLs

When creating OAuth applications in each provider's developer console, use these callback URLs:

| Provider | Development Callback URL |
|----------|-------------------------|
| Google | `http://localhost:3000/api/auth/callback/google` |
| GitHub | `http://localhost:3000/api/auth/callback/github` |
| Twitter | `http://localhost:3000/api/auth/callback/twitter` |
| LinkedIn | `http://localhost:3000/api/auth/callback/linkedin` |
| Facebook | `http://localhost:3000/api/auth/callback/facebook` |

For production, replace `http://localhost:3000` with your domain.

### Provider-Specific Setup

#### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI

#### GitHub
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL

#### Twitter/X
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new project and app
3. Enable OAuth 2.0
4. Set callback URL

#### LinkedIn
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Add Sign In with LinkedIn product
4. Set authorized redirect URLs

#### Facebook
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Set valid OAuth redirect URIs

---

## Type Extensions

Custom types added for session user:

```typescript
declare module 'next-auth' {
  interface User {
    role?: UserRole;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
  }
}
```

---

## Dependencies

```json
{
  "dependencies": {
    "next-auth": "5.0.0-beta.30",
    "@auth/prisma-adapter": "^2.11.1",
    "bcryptjs": "^3.0.3"
  }
}
```

---

## Usage Examples

### Accessing Session (Server Component)

```typescript
import { auth } from '@/auth';

export default async function Page() {
  const session = await auth();

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return <div>Welcome {session.user.name}</div>;
}
```

### Accessing Session (Client Component)

```typescript
'use client';
import { useSession } from 'next-auth/react';

export function UserProfile() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return <div>Welcome {session.user.name}</div>;
}
```

### Sign Out

```typescript
import { signOut } from '@/auth';

// In a server action or API route
await signOut();

// Or in a client component
import { signOut } from 'next-auth/react';
<button onClick={() => signOut()}>Sign Out</button>
```

---

## Security Considerations

1. **Password Hashing** - bcrypt with 12 salt rounds
2. **CSRF Protection** - Built into Auth.js
3. **JWT Strategy** - Secure session tokens
4. **HttpOnly Cookies** - Session cookies are not accessible via JavaScript
5. **Route Protection** - Middleware prevents unauthorized access
6. **Input Validation** - Zod schemas validate all inputs
7. **SQL Injection Prevention** - Prisma's parameterized queries
