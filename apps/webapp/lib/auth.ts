import { prisma } from '@workspace/database';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

export const auth = betterAuth({
  // Secret for encryption and hash generation
  secret: process.env.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // Enable email/password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  // Social providers (Facebook and LinkedIn removed per migration plan)
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
        type: 'string',
        required: false,
        defaultValue: 'USER',
        input: false,
      },
      username: {
        type: 'string',
        required: false,
      },
      isPrivate: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
      isBanned: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
      twoFactorEnabled: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },

  // Advanced configuration
  advanced: {
    // Better Auth uses UUIDs by default with prisma adapter
  },

  // Base URL
  baseURL: process.env.BETTER_AUTH_URL || process.env.AUTH_URL || 'http://localhost:3000',

  // Trust host in production
  trustedOrigins: [process.env.BETTER_AUTH_URL || process.env.AUTH_URL || 'http://localhost:3000'],
});

// Export types for use throughout the app
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
