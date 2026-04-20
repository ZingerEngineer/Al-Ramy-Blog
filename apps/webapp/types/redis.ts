export interface RedisCredentials {
  user: string;
  host: string;
  port: number;
}

export interface RedisTestResult {
  connected: boolean;
  latencyMs: number;
  credentials: RedisCredentials;
  error?: string;
}

export interface RedisSetKeyResult {
  success: boolean;
  key: string;
  issuedBy: string;
  error?: string;
}

export interface RedisKeyResult {
  exists: boolean;
  value: string | null;
  ttl: number;
}
