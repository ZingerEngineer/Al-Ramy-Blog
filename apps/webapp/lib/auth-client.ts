import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

// Export hooks and methods
export const { signIn, signUp, signOut, useSession } = authClient;

// Export session type inference
export type Session = typeof authClient.$Infer.Session;
