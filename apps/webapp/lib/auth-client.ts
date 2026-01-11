import { requireEnv } from '@workspace/utilities/env';
import { createAuthClient } from 'better-auth/react';

// Validate required environment variables
const appUrl = requireEnv('NEXT_PUBLIC_APP_URL');

export const authClient = createAuthClient({
  baseURL: appUrl,
});

// Export hooks and methods
export const { signIn, signUp, signOut, useSession } = authClient;

// Export session type inference
export type Session = typeof authClient.$Infer.Session;
