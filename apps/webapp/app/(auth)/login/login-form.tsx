'use client';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { useActionState } from 'react';
import { signInWithCredentials } from '@/app/actions/auth';

const initialState: { error?: string } | undefined = undefined;

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInWithCredentials, initialState);
  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="/forgot-password" className="text-sm text-muted-foreground hover:underline">
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="********"
          required
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
