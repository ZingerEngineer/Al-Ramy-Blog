export interface S3Config {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
}

export interface S3TestResult {
  connected: boolean;
  bucketExists: boolean;
  latencyMs: number;
  error?: string;
}

export interface S3FileInfo {
  key: string;
  size: number;
  lastModified: string;
  etag?: string;
}

export interface S3UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}
