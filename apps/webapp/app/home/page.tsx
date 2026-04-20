'use client';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { useRouter } from 'next/navigation';
import { authClient, useSession } from '@/lib/auth-client';

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Not authenticated</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Home</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Session Data</h3>
            <div className="rounded-md bg-muted p-4">
              <pre className="overflow-auto text-xs">{JSON.stringify(session, null, 2)}</pre>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">User Info</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Name:</dt>
                <dd>{session.user?.name || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Email:</dt>
                <dd>{session.user?.email || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">ID:</dt>
                <dd className="font-mono text-xs">{session.user?.id || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          <Button onClick={handleLogout} variant="destructive" className="w-full">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
