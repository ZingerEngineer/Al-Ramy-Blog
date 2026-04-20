export interface SESConfig {
  region: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface PasswordResetEmailParams {
  to: string;
  resetUrl: string;
  userName?: string;
}

export interface PasswordChangedEmailParams {
  to: string;
  userName?: string;
}

export interface VerificationEmailParams {
  to: string;
  verificationUrl: string;
  userName?: string;
}
