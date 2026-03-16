'use client';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { useState } from 'react';
import type { SESTestResult } from '@/types/ses';
import { sendPasswordResetTestEmail, sendTestEmail, testSESConnection } from '../actions';
import { StatusBadge } from './status-badge';

export function SESTestCard() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [result, setResult] = useState<SESTestResult | null>(null);
  const [emailTo, setEmailTo] = useState('test@example.com');
  const isLoading = status === 'loading';
  const [emailSubject, setEmailSubject] = useState('Test Email from LocalStack SES');
  const [emailBody, setEmailBody] = useState(
    'This is a test email to verify LocalStack SES is working correctly!',
  );
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  async function handleTestConnection() {
    setStatus('loading');
    setSendResult(null);
    const testResult = await testSESConnection();
    setResult(testResult);
    setStatus(testResult.connected ? 'connected' : 'error');
  }

  async function handleSendTestEmail() {
    setSending(true);
    setSendResult(null);

    const result = await sendTestEmail({
      to: emailTo,
      subject: emailSubject,
      body: emailBody,
    });

    if (result.success) {
      setSendResult({
        success: true,
        message: `Email sent successfully! Message ID: ${result.messageId}`,
      });
    } else {
      setSendResult({
        success: false,
        message: `Failed to send email: ${result.error}`,
      });
    }

    setSending(false);
  }

  async function handleSendPasswordResetTest() {
    setSending(true);
    setSendResult(null);

    const result = await sendPasswordResetTestEmail(emailTo);

    if (result.success) {
      setSendResult({
        success: true,
        message: `Password reset email sent! Message ID: ${result.messageId}`,
      });
    } else {
      setSendResult({
        success: false,
        message: `Failed to send password reset email: ${result.error}`,
      });
    }

    setSending(false);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <title>SES Icon</title>
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            LocalStack SES
          </CardTitle>
          <StatusBadge
            status={status === 'idle' ? 'disconnected' : status === 'loading' ? 'loading' : status}
          />
        </div>
        <CardDescription>Test SES email service and password reset emails</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {result && (
          <div className="rounded-lg bg-muted p-3 text-sm space-y-2">
            <p>Latency: {result.latencyMs}ms</p>
            <div className="border-t pt-2 mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">Credentials:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span className="text-muted-foreground">Access Key:</span>
                <span className="font-mono">{result.credentials.accessKeyId}</span>
                <span className="text-muted-foreground">Region:</span>
                <span className="font-mono">{result.credentials.region}</span>
                <span className="text-muted-foreground">Endpoint:</span>
                <span className="font-mono truncate">{result.credentials.endpoint}</span>
              </div>
            </div>
            {result.error && <p className="text-red-600 mt-1">Error: {result.error}</p>}
          </div>
        )}

        {status === 'connected' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-to" className="text-sm font-medium">
                Recipient Email
              </Label>
              <Input
                id="email-to"
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="test@example.com"
                disabled={sending}
              />
              <p className="text-xs text-muted-foreground">
                LocalStack doesn't actually send emails, but you can check the logs
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-subject" className="text-sm font-medium">
                Email Subject
              </Label>
              <Input
                id="email-subject"
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-body" className="text-sm font-medium">
                Email Body
              </Label>
              <textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Email body content"
                disabled={sending}
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {sendResult && (
              <div
                className={`rounded-lg p-3 text-sm ${
                  sendResult.success
                    ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}
              >
                {sendResult.message}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSendTestEmail}
                disabled={sending || !emailTo}
                className="flex-1"
              >
                {sending ? 'Sending...' : 'Send Test Email'}
              </Button>
              <Button
                onClick={handleSendPasswordResetTest}
                disabled={sending || !emailTo}
                variant="secondary"
                className="flex-1"
              >
                {sending ? 'Sending...' : 'Send Password Reset'}
              </Button>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-xs text-blue-800 dark:text-blue-400">
              <p className="font-medium mb-1">📝 How to view sent emails:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Check LocalStack container logs:</li>
                <code className="block ml-4 mt-1 bg-blue-100 dark:bg-blue-900/40 p-2 rounded">
                  docker logs -f &lt;localstack-container&gt; | grep -A 30 &quot;SendEmail&quot;
                </code>
                <li className="mt-2">
                  Look for the email HTML content and reset token in the logs
                </li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button onClick={handleTestConnection} disabled={isLoading}>
          Test Connection
        </Button>
        {status === 'connected' && (
          <Button variant="outline" onClick={handleTestConnection} disabled={isLoading}>
            Refresh
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
