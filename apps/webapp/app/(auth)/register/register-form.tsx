'use client';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { useActionState } from 'react';
import { type RegisterFormState, registerUser } from '@/app/actions/auth';

const initialState: RegisterFormState = {
  success: false,
};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  if (state.success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
        <p className="text-sm font-medium">{state.message}</p>
        <a href="/login" className="mt-2 inline-block text-sm underline">
          Go to login
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.message && !state.success && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          required
          aria-invalid={!!state.errors?.name}
        />
        {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          aria-invalid={!!state.errors?.email}
        />
        {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="********"
          required
          aria-invalid={!!state.errors?.password}
        />
        {state.errors?.password && (
          <p className="text-sm text-destructive">{state.errors.password[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="********"
          required
          aria-invalid={!!state.errors?.confirmPassword}
        />
        {state.errors?.confirmPassword && (
          <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}
