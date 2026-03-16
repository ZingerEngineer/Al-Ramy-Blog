import { SESClient } from '@aws-sdk/client-ses';
import { requireEnv } from '@workspace/utilities/env';
import type { SESConfig } from './types';

let sesClient: SESClient | null = null;
let lastClientCreation = 0;
const CLIENT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get SES client configured for LocalStack with proper connection pooling
 */
export function getSESClient(config?: Partial<SESConfig>): SESClient {
  const now = Date.now();

  // Recreate client if it's older than CLIENT_TTL or doesn't exist
  if (!sesClient || now - lastClientCreation > CLIENT_TTL) {
    if (sesClient) {
      sesClient.destroy();
    }

    // Validate required environment variables if config not provided
    const region = config?.region ?? requireEnv('AWS_DEFAULT_REGION');
    const accessKeyId = config?.accessKeyId ?? requireEnv('AWS_ACCESS_KEY_ID');
    const secretAccessKey = config?.secretAccessKey ?? requireEnv('AWS_SECRET_ACCESS_KEY');

    sesClient = new SESClient({
      region,
      endpoint: config?.endpoint ?? getSESEndpoint(),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      maxAttempts: 3,
    });

    lastClientCreation = now;
  }

  return sesClient;
}

/**
 * Get the SES/LocalStack endpoint URL
 * Using 127.0.0.1 instead of localhost to force IPv4 (LocalStack doesn't support IPv6)
 */
export function getSESEndpoint(): string {
  return requireEnv('LOCALSTACK_ENDPOINT');
}

/**
 * Get the default "from" email address
 */
export function getFromEmail(): string {
  return requireEnv('EMAIL_FROM');
}

/**
 * Get the default "from" name
 */
export function getFromName(): string {
  const emailFrom = getFromEmail();
  const emailFromName = process.env.EMAIL_FROM_NAME;

  if (!emailFromName) {
    return emailFrom;
  }

  return `${emailFromName} <${emailFrom}>`;
}

/**
 * Close SES client
 */
export function closeSESClient(): void {
  if (sesClient) {
    sesClient.destroy();
    sesClient = null;
  }
}
