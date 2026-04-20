export interface S3Credentials {
  accessKeyId: string;
  region: string;
  endpoint: string;
}

export interface S3TestResult {
  connected: boolean;
  bucketExists: boolean;
  latencyMs: number;
  credentials: S3Credentials;
  error?: string;
}

export interface S3FileInfo {
  key: string;
  size: number;
  lastModified: string;
}

export interface S3UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}
