// Auth helper functions will be added here
// Examples: session management, JWT helpers, password hashing, etc.

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  expiresAt: Date;
}

export function createSession(userId: string, email: string, role: string): SessionData {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  return {
    userId,
    email,
    role,
    expiresAt,
  };
}

export function isSessionValid(session: SessionData): boolean {
  return new Date() < session.expiresAt;
}
