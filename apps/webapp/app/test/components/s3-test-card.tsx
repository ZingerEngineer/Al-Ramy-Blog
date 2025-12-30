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
import { useRef, useState } from 'react';
import {
  getFileContent,
  listBucketFiles,
  type S3FileInfo,
  type S3TestResult,
  testS3Connection,
  uploadFile,
} from '../actions';
import { StatusBadge } from './status-badge';

export function S3TestCard() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [result, setResult] = useState<S3TestResult | null>(null);
  const [files, setFiles] = useState<S3FileInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{
    key: string;
    content: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleTestConnection() {
    setStatus('loading');
    const testResult = await testS3Connection();
    setResult(testResult);
    setStatus(testResult.connected ? 'connected' : 'error');

    if (testResult.connected) {
      const fileList = await listBucketFiles();
      setFiles(fileList);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    const uploadResult = await uploadFile(formData);

    if (uploadResult.success) {
      const fileList = await listBucketFiles();
      setFiles(fileList);
    } else {
      setUploadError(uploadResult.error ?? 'Upload failed');
    }

    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleViewFile(key: string) {
    const contentResult = await getFileContent(key);
    if (contentResult.success && contentResult.content) {
      setSelectedFile({ key, content: contentResult.content });
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <svg className="h-5 w-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
              <title>S3 Icon</title>
              <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 4v10h16V8H4zm2 2h2v2H6v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
            </svg>
            LocalStack S3
          </CardTitle>
          <StatusBadge
            status={status === 'idle' ? 'disconnected' : status === 'loading' ? 'loading' : status}
          />
        </div>
        <CardDescription>Test S3 connection, upload and browse files</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {result && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p>Latency: {result.latencyMs}ms</p>
            <p>Bucket: {result.bucketExists ? 'alramy-blog-media' : 'Not found'}</p>
            {result.error && <p className="text-red-600 mt-1">Error: {result.error}</p>}
          </div>
        )}

        {status === 'connected' && (
          <>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="text-sm font-medium">
                  Upload File
                </Label>
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="flex-1 cursor-pointer file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:text-primary-foreground"
                  />
                </div>
                {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                {uploadError && <p className="text-sm text-red-600">Error: {uploadError}</p>}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Files in bucket:</p>
              </div>

              {files.length > 0 ? (
                <div className="rounded-lg border divide-y max-h-48 overflow-auto">
                  {files.map((file) => (
                    <Button
                      variant="ghost"
                      className="w-full justify-between px-3 py-2 text-left"
                      key={file.key}
                      onClick={() => handleViewFile(file.key)}
                    >
                      <span className="font-mono text-xs truncate flex-1">{file.key}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        {formatBytes(file.size)}
                      </span>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No test files found</p>
              )}
            </div>

            {selectedFile && (
              <div className="space-y-2">
                <p className="text-sm font-medium">File Content:</p>
                <div className="rounded-lg bg-muted p-3">
                  <p className="font-mono text-xs mb-2 text-muted-foreground">{selectedFile.key}</p>
                  <pre className="text-sm whitespace-pre-wrap">{selectedFile.content}</pre>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button onClick={handleTestConnection} disabled={status === 'loading'}>
          Test Connection
        </Button>
        {status === 'connected' && (
          <Button variant="secondary" onClick={() => listBucketFiles().then(setFiles)}>
            Refresh Files
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
