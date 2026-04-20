import { prisma } from '@workspace/database';
import { sendPasswordResetEmail, sendVerificationEmail } from '@workspace/services/email';
import { requireEnv, requireEnvGroup, requireEnvOneOf } from '@workspace/utilities/env';
import bcrypt from 'bcryptjs';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { authLogger } from './logger';

// Validate required environment variables
const betterAuthSecret = requireEnv('BETTER_AUTH_SECRET');

const googleCredentials = requireEnvGroup(['AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET'], {
  optional: true,
});
const githubCredentials = requireEnvGroup(['AUTH_GITHUB_ID', 'AUTH_GITHUB_SECRET'], {
  optional: true,
});
const twitterCredentials = requireEnvGroup(['AUTH_TWITTER_ID', 'AUTH_TWITTER_SECRET'], {
  optional: true,
});
const linkedinCredentials = requireEnvGroup(['AUTH_LINKEDIN_ID', 'AUTH_LINKEDIN_SECRET'], {
  optional: true,
});

const baseURL = requireEnvOneOf(['BETTER_AUTH_URL', 'AUTH_URL']);

export const auth = betterAuth({
  // Secret for encryption and hash generation
  secret: betterAuthSecret,

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendVerificationEmail({
          userName: user.name,
          verificationUrl: url,
          to: user.email,
        });
      } catch (error) {
        authLogger.error(
          { email: user.email, err: error },
          'Error in sendVerificationEmail callback',
        );
      }
    },
  },
  // Enable email/password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    // Use bcrypt for compatibility with existing passwords
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 12);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      },
    },
    // Send password reset email
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendPasswordResetEmail({
          to: user.email,
          resetUrl: url,
          userName: user.name,
        });
      } catch (err) {
        authLogger.error({ email: user.email, err }, 'Error in sendResetPassword callback');
      }
    },
  },

  // Social providers (only include if credentials are available)
  socialProviders: {
    ...(googleCredentials.AUTH_GOOGLE_ID &&
      googleCredentials.AUTH_GOOGLE_SECRET && {
        google: {
          clientId: googleCredentials.AUTH_GOOGLE_ID,
          clientSecret: googleCredentials.AUTH_GOOGLE_SECRET,
        },
      }),
    ...(githubCredentials.AUTH_GITHUB_ID &&
      githubCredentials.AUTH_GITHUB_SECRET && {
        github: {
          clientId: githubCredentials.AUTH_GITHUB_ID,
          clientSecret: githubCredentials.AUTH_GITHUB_SECRET,
        },
      }),
    ...(twitterCredentials.AUTH_TWITTER_ID &&
      twitterCredentials.AUTH_TWITTER_SECRET && {
        twitter: {
          clientId: twitterCredentials.AUTH_TWITTER_ID,
          clientSecret: twitterCredentials.AUTH_TWITTER_SECRET,
        },
      }),
    ...(linkedinCredentials.AUTH_LINKEDIN_ID &&
      linkedinCredentials.AUTH_LINKEDIN_SECRET && {
        linkedin: {
          clientId: linkedinCredentials.AUTH_LINKEDIN_ID,
          clientSecret: linkedinCredentials.AUTH_LINKEDIN_SECRET,
        },
      }),
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
