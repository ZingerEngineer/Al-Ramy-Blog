export interface SESCredentials {
  accessKeyId: string;
  region: string;
  endpoint: string;
}

export interface SESTestResult {
  connected: boolean;
  latencyMs: number;
  credentials: SESCredentials;
  emailSent?: boolean;
  error?: string;
}

export interface SESSendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SESEmailTestParams {
  to: string;
  subject: string;
  body: string;
}
