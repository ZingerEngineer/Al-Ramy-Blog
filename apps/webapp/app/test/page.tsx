import { DatabaseTestCard } from './components/database-test-card';
import { RedisTestCard } from './components/redis-test-card';
import { S3TestCard } from './components/s3-test-card';

export const metadata = {
  title: 'Service Tests | Al-Ramy Blog',
  description: 'Test Docker-based services connectivity',
};

export default function TestPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Docker Services Test</h1>
          <p className="text-muted-foreground mt-2">
            Test connectivity and functionality of PostgreSQL, Redis, and LocalStack S3 services.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DatabaseTestCard />
          <RedisTestCard />
          <S3TestCard />
        </div>
      </div>
    </main>
  );
}
