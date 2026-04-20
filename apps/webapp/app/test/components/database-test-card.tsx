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
import { useState } from 'react';
import type { DatabaseTestResult, SeededRecord } from '@/types/database';
import { getSeededRecords, seedTestData, testDatabaseConnection } from '../actions';
import { StatusBadge } from './status-badge';

export function DatabaseTestCard() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [result, setResult] = useState<DatabaseTestResult | null>(null);
  const [records, setRecords] = useState<SeededRecord[]>([]);
  const [seeding, setSeeding] = useState(false);

  async function handleTestConnection() {
    setStatus('loading');
    const testResult = await testDatabaseConnection();
    setResult(testResult);
    setStatus(testResult.connected ? 'connected' : 'error');

    if (testResult.connected) {
      const existingRecords = await getSeededRecords();
      setRecords(existingRecords);
    }
  }

  async function handleSeedData() {
    setSeeding(true);
    const seedResult = await seedTestData();
    if (seedResult.success) {
      setRecords(seedResult.records);
    }
    setSeeding(false);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <title>PostgreSQL Icon</title>
              <path d="M12 2C6.48 2 2 4.24 2 7v10c0 2.76 4.48 5 10 5s10-2.24 10-5V7c0-2.76-4.48-5-10-5zm0 15c-4.42 0-8-1.79-8-4v-2.55c1.75 1.26 4.59 2.05 8 2.05s6.25-.79 8-2.05V13c0 2.21-3.58 4-8 4z" />
            </svg>
            PostgreSQL Database
          </CardTitle>
          <StatusBadge
            status={status === 'idle' ? 'disconnected' : status === 'loading' ? 'loading' : status}
          />
        </div>
        <CardDescription>Test PostgreSQL connection and seed test data</CardDescription>
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
                <span className="text-muted-foreground">Database:</span>
                <span className="font-mono">{result.credentials.database}</span>
              </div>
            </div>
            {result.error && <p className="text-red-600 mt-1">Error: {result.error}</p>}
          </div>
        )}

        {records.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Seeded Records:</p>
            <div className="rounded-lg border divide-y max-h-48 overflow-auto">
              {records.map((record) => (
                <div key={record.id} className="px-3 py-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">
                    {record.id.slice(0, 8)}...
                  </span>
                  <span className="ml-2">{record.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button onClick={handleTestConnection} disabled={status === 'loading'}>
          Test Connection
        </Button>
        <Button
          variant="secondary"
          onClick={handleSeedData}
          disabled={status !== 'connected' || seeding}
        >
          {seeding ? 'Seeding...' : 'Seed Test Data'}
        </Button>
      </CardFooter>
    </Card>
  );
}
