import { S3Client } from '@aws-sdk/client-s3';
import type { S3Config } from './types';

let s3Client: S3Client | null = null;

/**
 * Get S3 client configured for LocalStack
 */
export function getS3Client(config?: Partial<S3Config>): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: config?.region ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-1',
      endpoint: config?.endpoint ?? getS3Endpoint(),
      forcePathStyle: config?.forcePathStyle ?? true,
      credentials: {
        accessKeyId: config?.accessKeyId ?? process.env.AWS_ACCESS_KEY_ID ?? 'test',
        secretAccessKey: config?.secretAccessKey ?? process.env.AWS_SECRET_ACCESS_KEY ?? 'test',
      },
    });
  }
  return s3Client;
}

/**
 * Get the S3/LocalStack endpoint URL
 */
export function getS3Endpoint(): string {
  return process.env.LOCALSTACK_ENDPOINT ?? 'http://localhost:4566';
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
