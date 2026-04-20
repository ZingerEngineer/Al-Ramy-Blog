'use server';

import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { BUCKET_NAME, getS3Client, getS3Endpoint } from '@workspace/services/s3';
import type { S3Credentials, S3FileInfo, S3TestResult, S3UploadResult } from '@/types/s3';

function getS3Credentials(): S3Credentials {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? 'unknown';
  // Mask the access key for security (show first 4 and last 4 chars)
  const maskedKey =
    accessKeyId.length > 8 ? `${accessKeyId.slice(0, 4)}...${accessKeyId.slice(-4)}` : accessKeyId;

  return {
    accessKeyId: maskedKey,
    region: process.env.AWS_DEFAULT_REGION ?? 'us-east-1',
    endpoint: getS3Endpoint(),
  };
}

export async function testS3Connection(): Promise<S3TestResult> {
  const start = Date.now();
  const s3 = getS3Client();
  const credentials = getS3Credentials();

  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1,
    });

    await s3.send(command);
    const latencyMs = Date.now() - start;

    return { connected: true, bucketExists: true, latencyMs, credentials };
  } catch (error) {
    return {
      connected: false,
      bucketExists: false,
      latencyMs: Date.now() - start,
      credentials,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function uploadTestFile(): Promise<S3UploadResult> {
  const s3 = getS3Client();
  const key = `test-files/test-${Date.now()}.txt`;
  const content = `Test file created at ${new Date().toISOString()}`;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: content,
      ContentType: 'text/plain',
    });

    await s3.send(command);
    const url = `${getS3Endpoint()}/${BUCKET_NAME}/${key}`;

    return { success: true, key, url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function uploadFile(formData: FormData): Promise<S3UploadResult> {
  const s3 = getS3Client();
  const file = formData.get('file') as File | null;

  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `uploads/${timestamp}-${sanitizedName}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    });

    await s3.send(command);
    const url = `${getS3Endpoint()}/${BUCKET_NAME}/${key}`;

    return { success: true, key, url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function checkFileExists(key: string): Promise<boolean> {
  const s3 = getS3Client();

  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3.send(command);
    return true;
  } catch {
    return false;
  }
}

export async function listBucketFiles(): Promise<S3FileInfo[]> {
  const s3 = getS3Client();

  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 50,
    });

    const response = await s3.send(command);

    return (response.Contents ?? [])
      .map((obj) => ({
        key: obj.Key ?? '',
        size: obj.Size ?? 0,
        lastModified: obj.LastModified?.toISOString() ?? '',
      }))
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
  } catch {
    return [];
  }
}

export async function getFileContent(
  key: string,
): Promise<{ success: boolean; content?: string; error?: string }> {
  const s3 = getS3Client();

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3.send(command);
    const content = await response.Body?.transformToString();

    return { success: true, content };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
