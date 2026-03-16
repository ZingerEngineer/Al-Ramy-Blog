import { SendEmailCommand } from '@aws-sdk/client-ses';
import { getFromName, getSESClient } from './client';
import {
  generateEmailVerificationTemplate,
  generatePasswordChangedTemplate,
  generatePasswordResetTemplate,
} from './templates';
import type {
  PasswordChangedEmailParams,
  PasswordResetEmailParams,
  SendEmailParams,
  VerificationEmailParams,
} from './types';

/**
 * Send an email using AWS SES
 */
export async function sendEmail(params: SendEmailParams): Promise<void> {
  const { to, subject, html, from, replyTo } = params;
  const sesClient = getSESClient();

  // Convert to array if single recipient
  const recipients = Array.isArray(to) ? to : [to];

  // Use custom from or default
  const fromAddress = from ?? getFromName();

  const command = new SendEmailCommand({
    Source: fromAddress,
    Destination: {
      ToAddresses: recipients,
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: html,
          Charset: 'UTF-8',
        },
      },
    },
    ...(replyTo && {
      ReplyToAddresses: [replyTo],
    }),
  });

  await sesClient.send(command);
}

/**
 * Send password reset email to user
 */
export async function sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<void> {
  const html = generatePasswordResetTemplate(params);

  await sendEmail({
    to: params.to,
    subject: 'Reset Your Password - Al-Ramy Blog',
    html,
  });
}

/**
 * Send password changed notification email to user
 */
export async function sendPasswordChangedEmail(params: PasswordChangedEmailParams): Promise<void> {
  const html = generatePasswordChangedTemplate(params);

  await sendEmail({
    to: params.to,
    subject: 'Password Changed - Al-Ramy Blog',
    html,
  });
}

export async function sendVerificationEmail(params: VerificationEmailParams): Promise<void> {
  const html = generateEmailVerificationTemplate(params);

  await sendEmail({
    to: params.to,
    subject: 'Verify Your Email - Al-Ramy Blog',
    html,
  });
}
