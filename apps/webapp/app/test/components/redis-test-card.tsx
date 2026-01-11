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
import { useCallback, useEffect, useState } from 'react';
import type { RedisKeyResult, RedisSetKeyResult, RedisTestResult } from '@/types/redis';
import { checkRedisKey, setRedisTestKey, testRedisConnection } from '../actions';
import { StatusBadge } from './status-badge';

export function RedisTestCard() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [result, setResult] = useState<RedisTestResult | null>(null);
  const [ttl, setTtl] = useState('10');
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [keyResult, setKeyResult] = useState<RedisSetKeyResult | null>(null);
  const [keyStatus, setKeyStatus] = useState<RedisKeyResult | null>(null);
  const [settingKey, setSettingKey] = useState(false);

  async function handleTestConnection() {
    setStatus('loading');
    const testResult = await testRedisConnection();
    setResult(testResult);
    setStatus(testResult.connected ? 'connected' : 'error');
  }

  async function handleSetKey() {
    setSettingKey(true);

    // Validate and parse TTL
    const ttlValue = Number(ttl);
    if (Number.isNaN(ttlValue) || ttlValue < 1 || ttlValue > 30) {
      setKeyResult({
        success: false,
        key: '',
        issuedBy: '',
        error: 'TTL must be a number between 1 and 30',
      });
      setSettingKey(false);
      return;
    }

    const setResult = await setRedisTestKey(ttlValue);
    setKeyResult(setResult);
    if (setResult.success) {
      setCurrentKey(setResult.key);
      // Wait a tiny bit to ensure Redis has processed the write
      await new Promise((resolve) => setTimeout(resolve, 10));
      // Check key status
      const keyStatusResult = await checkRedisKey(setResult.key);
      setKeyStatus(keyStatusResult);
    }
    setSettingKey(false);
  }

  const pollKeyStatus = useCallback(async () => {
    if (currentKey) {
      const keyResult = await checkRedisKey(currentKey);
      setKeyStatus(keyResult);
    }
  }, [currentKey]);

  // Poll key status every second while key exists
  useEffect(() => {
    if (!currentKey || !keyStatus?.exists) return;

    const interval = setInterval(pollKeyStatus, 1000);
    return () => clearInterval(interval);
  }, [currentKey, keyStatus?.exists, pollKeyStatus]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
              <title>Redis Icon</title>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Redis Cache
          </CardTitle>
          <StatusBadge
            status={status === 'idle' ? 'disconnected' : status === 'loading' ? 'loading' : status}
          />
        </div>
        <CardDescription>Test Redis connection and key expiration</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {result && (
          <div className="rounded-lg bg-muted p-3 text-sm space-y-2">
            <p>Latency: {result.latencyMs}ms</p>
            <div className="border-t pt-2 mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">Credentials:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span className="text-muted-foreground">User:</span>
                <span className="font-mono">{result.credentials.user}</span>
                <span className="text-muted-foreground">Host:</span>
                <span className="font-mono">{result.credentials.host}</span>
                <span className="text-muted-foreground">Port:</span>
                <span className="font-mono">{result.credentials.port}</span>
              </div>
            </div>
            {result.error && <p className="text-red-600 mt-1">Error: {result.error}</p>}
          </div>
        )}

        {status === 'connected' && (
          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="ttl">TTL (seconds, max 30)</Label>
                <Input
                  id="ttl"
                  type="number"
                  min="1"
                  max="30"
                  value={ttl}
                  onChange={(e) => setTtl(e.target.value)}
                  className="w-24"
                />
              </div>
              <Button onClick={handleSetKey} disabled={settingKey} size="sm">
                {settingKey ? 'Setting...' : 'Set Test Key'}
              </Button>
            </div>

            {keyResult && !keyResult.success && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">Error: {keyResult.error}</p>
              </div>
            )}

            {currentKey && keyStatus && (
              <div className="rounded-lg border p-3 space-y-2">
                <p className="text-sm font-mono break-all">{currentKey}</p>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={keyStatus.exists ? 'connected' : 'error'}
                    label={keyStatus.exists ? 'Exists' : 'Expired'}
                  />
                  {keyStatus.exists && keyStatus.ttl > 0 && (
                    <span className="text-sm text-muted-foreground">
                      TTL: {keyStatus.ttl}s remaining
                    </span>
                  )}
                </div>
                {keyResult?.success && (
                  <p className="text-xs text-muted-foreground">
                    Issued by: <span className="font-mono">{keyResult.issuedBy}</span>
                  </p>
                )}
                {keyStatus.value && (
                  <p className="text-xs text-muted-foreground">Value: {keyStatus.value}</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={handleTestConnection} disabled={status === 'loading'}>
          Test Connection
        </Button>
      </CardFooter>
    </Card>
  );
}
