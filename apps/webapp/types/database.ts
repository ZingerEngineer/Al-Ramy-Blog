export interface DatabaseCredentials {
  user: string;
  host: string;
  port: string;
  database: string;
}

export interface DatabaseTestResult {
  connected: boolean;
  latencyMs: number;
  credentials: DatabaseCredentials;
  error?: string;
}

export interface SeededRecord {
  id: string;
  name: string;
  createdAt: Date;
}
