import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Authentication Error | Al-Ramy Blog',
  description: 'An error occurred during authentication',
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification link may have expired or already been used.',
    OAuthSignin: 'Error occurred while trying to sign in with the provider.',
    OAuthCallback: 'Error occurred during the OAuth callback.',
    OAuthCreateAccount: 'Could not create an account with the OAuth provider.',
    EmailCreateAccount: 'Could not create an account with the email provider.',
    Callback: 'Error occurred during the callback.',
    OAuthAccountNotLinked: 'This email is already associated with another account.',
    EmailSignin: 'Error sending the email for sign in.',
    CredentialsSignin: 'Invalid email or password.',
    SessionRequired: 'Please sign in to access this page.',
    Default: 'An unexpected error occurred.',
  };

  const errorMessage = error
    ? errorMessages[error] || errorMessages.Default
    : errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-destructive">
            Authentication Error
          </CardTitle>
          <CardDescription>Something went wrong during authentication</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {errorMessage}
          </div>
        </CardContent>

        <CardFooter className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/register">Try Again</Link>
          </Button>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
