import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ChangePasswordForm } from './change-password-form';

export const metadata: Metadata = {
  title: 'Settings | Al-Ramy Blog',
  description: 'Manage your account settings',
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        {/* Password & Security Card */}
        <Card>
          <CardHeader>
            <CardTitle>Password & Security</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        {/* Future: Add more settings cards here */}
      </div>
    </div>
  );
}
