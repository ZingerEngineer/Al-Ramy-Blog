import { prisma } from '@workspace/database';
import bcrypt from 'bcryptjs';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';

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
    // Use bcrypt for compatibility with existing passwords
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 12);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },

  // Social providers
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
    linkedin: {
      clientId: process.env.AUTH_LINKEDIN_ID!,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET!,
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

  // Account linking configuration
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'github', 'twitter', 'linkedin'],
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
  plugins: [nextCookies()],
});

// Export types for use throughout the app
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
