export interface RedisConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface RedisTestResult {
  connected: boolean;
  latencyMs: number;
  error?: string;
}

export interface RedisKeyStatus {
  exists: boolean;
  value: string | null;
  ttl: number; // -2 = key doesn't exist, -1 = no TTL, >0 = seconds remaining
}
