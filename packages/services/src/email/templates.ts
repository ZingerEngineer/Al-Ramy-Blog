import type {
  PasswordChangedEmailParams,
  PasswordResetEmailParams,
  VerificationEmailParams,
} from './types';

/**
 * Generate HTML template for password reset email
 */
export function generatePasswordResetTemplate(params: PasswordResetEmailParams): string {
  const { resetUrl, userName } = params;
  const greeting = userName ? `Hi ${userName}` : 'Hi there';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #2563eb;
      padding: 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      margin: 0 0 20px 0;
      line-height: 1.6;
      font-size: 16px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #2563eb;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    .alt-link {
      margin-top: 20px;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 6px;
      word-break: break-all;
    }
    .alt-link p {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #6b7280;
    }
    .alt-link a {
      color: #2563eb;
      text-decoration: none;
      font-size: 13px;
    }
    .footer {
      padding: 30px;
      text-align: center;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
    }
    .security-notice {
      margin-top: 30px;
      padding: 20px;
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
    }
    .security-notice p {
      margin: 0;
      font-size: 14px;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>

    <div class="content">
      <p>${greeting},</p>

      <p>We received a request to reset your password for your Al-Ramy Blog account. Click the button below to create a new password:</p>

      <div class="button-container">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>

      <div class="alt-link">
        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      </div>

      <div class="security-notice">
        <p><strong>Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, you can safely ignore this email.</p>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated email from Al-Ramy Blog.</p>
      <p>If you have any questions or concerns, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML template for password changed notification email
 */
export function generatePasswordChangedTemplate(params: PasswordChangedEmailParams): string {
  const { userName } = params;
  const greeting = userName ? `Hi ${userName}` : 'Hi there';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed Successfully</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #10b981;
      padding: 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      margin: 0 0 20px 0;
      line-height: 1.6;
      font-size: 16px;
    }
    .footer {
      padding: 30px;
      text-align: center;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
    }
    .security-notice {
      margin-top: 20px;
      padding: 20px;
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
    }
    .security-notice p {
      margin: 0;
      font-size: 14px;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Changed</h1>
    </div>

    <div class="content">
      <p>${greeting},</p>

      <p>This email confirms that your password was successfully changed.</p>

      <p>If you made this change, no further action is needed.</p>

      <div class="security-notice">
        <p><strong>Did you not make this change?</strong> If you didn't change your password, please contact our support team immediately to secure your account.</p>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated email from Al-Ramy Blog.</p>
      <p>For security reasons, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML template for email verification
 */
export function generateEmailVerificationTemplate(params: VerificationEmailParams): string {
  const { verificationUrl, userName } = params;
  const greeting = userName ? `Hi ${userName}` : 'Hi there';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #6366f1;
      padding: 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      margin: 0 0 20px 0;
      line-height: 1.6;
      font-size: 16px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #6366f1;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
    }
    .button:hover {
      background-color: #4f46e5;
    }
    .alt-link {
      margin-top: 20px;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 6px;
      word-break: break-all;
    }
    .alt-link p {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #6b7280;
    }
    .alt-link a {
      color: #6366f1;
      text-decoration: none;
      font-size: 13px;
    }
    .footer {
      padding: 30px;
      text-align: center;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>

    <div class="content">
      <p>${greeting},</p>

      <p>Welcome to Al-Ramy Blog! Please verify your email address to complete your registration:</p>

      <div class="button-container">
        <a href="${verificationUrl}" class="button">Verify Email</a>
      </div>

      <div class="alt-link">
        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated email from Al-Ramy Blog.</p>
      <p>If you have any questions, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
