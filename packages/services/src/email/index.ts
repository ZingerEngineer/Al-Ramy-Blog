// Re-export AWS SES SDK commands for use in other packages
export { GetSendQuotaCommand, SendEmailCommand } from '@aws-sdk/client-ses';
export {
  closeSESClient,
  getFromEmail,
  getFromName,
  getSESClient,
  getSESEndpoint,
} from './client';
export {
  sendEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from './sender';
export {
  generateEmailVerificationTemplate,
  generatePasswordChangedTemplate,
  generatePasswordResetTemplate,
} from './templates';
export type {
  PasswordChangedEmailParams,
  PasswordResetEmailParams,
  SESConfig,
  SendEmailParams,
  VerificationEmailParams,
} from './types';
