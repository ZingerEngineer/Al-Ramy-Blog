import { S3Client } from '@aws-sdk/client-s3';
import { requireEnv } from '@workspace/utilities/env';
import type { S3Config } from './types';

let s3Client: S3Client | null = null;
let lastClientCreation = 0;
const CLIENT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get S3 client configured for LocalStack with proper connection pooling
 */
export function getS3Client(config?: Partial<S3Config>): S3Client {
  const now = Date.now();

  // Recreate client if it's older than CLIENT_TTL or doesn't exist
  if (!s3Client || now - lastClientCreation > CLIENT_TTL) {
    if (s3Client) {
      s3Client.destroy();
    }

    // Validate required environment variables if config not provided
    const region = config?.region ?? requireEnv('AWS_DEFAULT_REGION');
    const accessKeyId = config?.accessKeyId ?? requireEnv('AWS_ACCESS_KEY_ID');
    const secretAccessKey = config?.secretAccessKey ?? requireEnv('AWS_SECRET_ACCESS_KEY');

    s3Client = new S3Client({
      region,
      endpoint: config?.endpoint ?? getS3Endpoint(),
      forcePathStyle: config?.forcePathStyle ?? true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      maxAttempts: 3,
    });

    lastClientCreation = now;
  }

  return s3Client;
}

/**
 * Get the S3/LocalStack endpoint URL
 * Using 127.0.0.1 instead of localhost to force IPv4 (LocalStack doesn't support IPv6)
 */
export function getS3Endpoint(): string {
  return requireEnv('LOCALSTACK_ENDPOINT');
}

/**
 * Default bucket name for the blog media
 */
export const BUCKET_NAME = 'alramy-blog-media';

/**
 * Close S3 client
 */
export function closeS3Client(): void {
  if (s3Client) {
    s3Client.destroy();
    s3Client = null;
  }
}
