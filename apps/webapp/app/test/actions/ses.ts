'use server';

import {
  GetSendQuotaCommand,
  getSESClient,
  getSESEndpoint,
  SendEmailCommand,
} from '@workspace/services/email';
import type {
  SESCredentials,
  SESEmailTestParams,
  SESSendEmailResult,
  SESTestResult,
} from '@/types/ses';

function getSESCredentials(): SESCredentials {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? 'unknown';
  // Mask the access key for security (show first 4 and last 4 chars)
  const maskedKey =
    accessKeyId.length > 8 ? `${accessKeyId.slice(0, 4)}...${accessKeyId.slice(-4)}` : accessKeyId;

  return {
    accessKeyId: maskedKey,
    region: process.env.AWS_DEFAULT_REGION ?? 'us-east-1',
    endpoint: getSESEndpoint(),
  };
}

/**
 * Test SES connection and availability
 */
export async function testSESConnection(): Promise<SESTestResult> {
  const start = Date.now();
  const ses = getSESClient();
  const credentials = getSESCredentials();

  try {
    // Try to get send quota to verify connection
    const command = new GetSendQuotaCommand({});
    await ses.send(command);

    const latencyMs = Date.now() - start;

    return {
      connected: true,
      latencyMs,
      credentials,
    };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      credentials,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a test email via SES
 */
export async function sendTestEmail(params: SESEmailTestParams): Promise<SESSendEmailResult> {
  const ses = getSESClient();

  try {
    // Get the from email from environment
    const fromEmail = process.env.EMAIL_FROM ?? 'test@example.com';
    const fromName = process.env.EMAIL_FROM_NAME ?? 'Al-Ramy Blog Test';

    const command = new SendEmailCommand({
      Source: `${fromName} <${fromEmail}>`,
      Destination: {
        ToAddresses: [params.to],
      },
      Message: {
        Subject: {
          Data: params.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">LocalStack SES Test</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Service Verification</p>
  </div>
  <div class="content">
    <p><span class="badge">✓ SUCCESS</span></p>
    <h2 style="margin-top: 20px;">Email Sent Successfully!</h2>
    <p>${params.body}</p>
    <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 20px;">
      <p style="margin: 0; font-size: 14px;"><strong>Test Details:</strong></p>
      <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
        <li>Recipient: ${params.to}</li>
        <li>Subject: ${params.subject}</li>
        <li>Sent at: ${new Date().toLocaleString()}</li>
        <li>Service: LocalStack SES</li>
      </ul>
    </div>
  </div>
  <div class="footer">
    <p>This is a test email from Al-Ramy Blog LocalStack SES service</p>
    <p>Sent via LocalStack at ${getSESEndpoint()}</p>
  </div>
</body>
</html>
            `,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const result = await ses.send(command);

    return {
      success: true,
      messageId: result.MessageId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a password reset test email
 */
export async function sendPasswordResetTestEmail(email: string): Promise<SESSendEmailResult> {
  const ses = getSESClient();

  try {
    const fromEmail = process.env.EMAIL_FROM ?? 'test@example.com';
    const fromName = process.env.EMAIL_FROM_NAME ?? 'Al-Ramy Blog';
    const resetUrl = `http://localhost:3000/reset-password?token=test-token-${Date.now()}`;

    const command = new SendEmailCommand({
      Source: `${fromName} <${fromEmail}>`,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Password Reset Test - Al-Ramy Blog',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: #2563eb;
      color: white;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .notice {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Password Reset Test</h1>
    </div>
    <div class="content">
      <p>Hi there,</p>
      <p>This is a <strong>test email</strong> for the password reset functionality.</p>
      <p>Click the button below to test the reset password page:</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password (Test)</a>
      </div>
      <div class="notice">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>Note:</strong> This is a test email from LocalStack SES.
          The token is for testing purposes only and will expire in 1 hour.
        </p>
      </div>
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        Sent at: ${new Date().toLocaleString()}<br>
        Service: LocalStack SES
      </p>
    </div>
  </div>
</body>
</html>
            `,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const result = await ses.send(command);

    return {
      success: true,
      messageId: result.MessageId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
