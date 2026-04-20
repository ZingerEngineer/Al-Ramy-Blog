'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@workspace/ui/components/field';
import { Input } from '@workspace/ui/components/input';
import { useActionState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { registerUser } from '@/app/actions/auth';
import { reportAuthError } from '@/lib/client/error-reporter';
import {
  type RegisterFormData,
  type RegisterFormState,
  registerSchema,
} from '@/lib/validations/auth';

const initialState: RegisterFormState = {
  success: false,
};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Sync server errors with form state
  useEffect(() => {
    if (state?.errors) {
      if (state.errors.name) {
        form.setError('name', { message: state.errors.name[0] });
      }
      if (state.errors.email) {
        form.setError('email', { message: state.errors.email[0] });
      }
      if (state.errors.password) {
        form.setError('password', { message: state.errors.password[0] });
      }
      if (state.errors.confirmPassword) {
        form.setError('confirmPassword', { message: state.errors.confirmPassword[0] });
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
        reportAuthError(new Error(`Registration validation failed: ${errorMessages}`), 'register');
      }
    }
  }, [form.formState.errors, form.formState.submitCount]);

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

      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-name">Name</FieldLabel>
              <Input
                {...field}
                id="register-name"
                type="text"
                placeholder="John Doe"
                aria-invalid={fieldState.invalid}
                disabled={isPending}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-email">Email</FieldLabel>
              <Input
                {...field}
                id="register-email"
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
              <FieldLabel htmlFor="register-password">Password</FieldLabel>
              <Input
                {...field}
                id="register-password"
                type="password"
                placeholder="********"
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
                disabled={isPending}
              />
              <FieldDescription>
                Must be at least 8 characters with uppercase, lowercase, and number
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-confirm-password">Confirm Password</FieldLabel>
              <Input
                {...field}
                id="register-confirm-password"
                type="password"
                placeholder="********"
                aria-invalid={fieldState.invalid}
                autoComplete="new-password"
                disabled={isPending}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}
