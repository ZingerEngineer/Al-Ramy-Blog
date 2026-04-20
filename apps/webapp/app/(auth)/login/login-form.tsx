'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@workspace/ui/components/field';
import { Input } from '@workspace/ui/components/input';
import { useActionState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { signInWithCredentials } from '@/app/actions/auth';
import { reportAuthError } from '@/lib/client/error-reporter';
import { type LoginFormData, type LoginFormState, loginSchema } from '@/lib/validations/auth';

const initialState: LoginFormState | undefined = undefined;

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInWithCredentials, initialState);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Sync server errors with form state
  useEffect(() => {
    if (state?.errors) {
      if (state.errors.email) {
        form.setError('email', { message: state.errors.email[0] });
      }
      if (state.errors.password) {
        form.setError('password', { message: state.errors.password[0] });
      }
    }
  }, [state?.errors, form]);

  // Handle form errors
  useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      // Report validation errors to server for analytics
      const errorMessages = Object.entries(errors)
        .map(([field, error]) => `${field}: ${error.message}`)
        .join(', ');

      // Only report if it's not a simple validation error
      if (form.formState.submitCount > 0) {
        reportAuthError(new Error(`Login validation failed: ${errorMessages}`), 'login');
      }
    }
  }, [form.formState.errors, form.formState.submitCount]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input
                {...field}
                id="login-email"
                type="email"
                placeholder="you@example.com"
                aria-invalid={fieldState.invalid}
                autoComplete="email"
                disabled={isPending}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="login-password">Password</FieldLabel>
                <a
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                {...field}
                id="login-password"
                type="password"
                placeholder="********"
                aria-invalid={fieldState.invalid}
                autoComplete="current-password"
                disabled={isPending}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
