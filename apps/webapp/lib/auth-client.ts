import { createAuthClient } from 'better-auth/react';

/**
 * Validates and returns the app URL
 * For NEXT_PUBLIC_* variables, validation happens at runtime in the browser
 * where Next.js guarantees the variable is available
 */
function getAppUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL environment variable is required but not provided');
  }

  return appUrl;
}

export const authClient = createAuthClient({
  baseURL: getAppUrl(),
});

// Export hooks and methods
export const { signIn, signUp, signOut, useSession } = authClient;

// Export session type inference
export type Session = typeof authClient.$Infer.Session;
