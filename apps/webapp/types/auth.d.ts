import type { auth } from '@/lib/auth';

// Re-export Better Auth types for convenience
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

// Extended user type with custom fields
export interface ExtendedUser extends User {
  role: 'ADMIN' | 'MODERATOR' | 'USER';
  username?: string;
  isPrivate: boolean;
  isBanned: boolean;
  twoFactorEnabled: boolean;
}
