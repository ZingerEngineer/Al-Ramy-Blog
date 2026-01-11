import { prisma } from '@workspace/database';
import { requireEnv, requireEnvGroup, requireEnvOneOf } from '@workspace/utilities/env';
import bcrypt from 'bcryptjs';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';

// Validate required environment variables
const betterAuthSecret = requireEnv('BETTER_AUTH_SECRET');

const googleCreds = requireEnvGroup(['AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET']);
const githubCreds = requireEnvGroup(['AUTH_GITHUB_ID', 'AUTH_GITHUB_SECRET']);
const twitterCreds = requireEnvGroup(['AUTH_TWITTER_ID', 'AUTH_TWITTER_SECRET']);
const linkedinCreds = requireEnvGroup(['AUTH_LINKEDIN_ID', 'AUTH_LINKEDIN_SECRET']);

const baseURL = requireEnvOneOf(['BETTER_AUTH_URL', 'AUTH_URL']);

export const auth = betterAuth({
  // Secret for encryption and hash generation
  secret: betterAuthSecret,

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
      clientId: googleCreds.AUTH_GOOGLE_ID as string,
      clientSecret: googleCreds.AUTH_GOOGLE_SECRET as string,
    },
    github: {
      clientId: githubCreds.AUTH_GITHUB_ID as string,
      clientSecret: githubCreds.AUTH_GITHUB_SECRET as string,
    },
    twitter: {
      clientId: twitterCreds.AUTH_TWITTER_ID as string,
      clientSecret: twitterCreds.AUTH_TWITTER_SECRET as string,
    },
    linkedin: {
      clientId: linkedinCreds.AUTH_LINKEDIN_ID as string,
      clientSecret: linkedinCreds.AUTH_LINKEDIN_SECRET as string,
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
  baseURL,

  // Trust host in production
  trustedOrigins: [baseURL],
  plugins: [nextCookies()],
});

// Export types for use throughout the app
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
