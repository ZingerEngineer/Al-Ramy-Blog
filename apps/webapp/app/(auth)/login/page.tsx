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
import { OAuthButtons } from '../components/oauth-buttons';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Login | Al-Ramy Blog',
  description: 'Sign in to your account',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <OAuthButtons />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <LoginForm />
        </CardContent>

        <CardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
