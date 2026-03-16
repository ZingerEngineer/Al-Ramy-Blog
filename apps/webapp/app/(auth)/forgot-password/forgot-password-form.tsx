'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@workspace/ui/components/field';
import { Input } from '@workspace/ui/components/input';
import { useActionState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { requestPasswordReset } from '@/app/actions/password';
import {
  type ForgotPasswordFormData,
  type ForgotPasswordFormState,
  forgotPasswordSchema,
} from '@/lib/validations/password';

const initialState: ForgotPasswordFormState = {
  success: false,
};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Sync server errors with form state
  useEffect(() => {
    if (state?.errors?.email) {
      form.setError('email', { message: state.errors.email[0] });
    }
  }, [state?.errors, form]);

  if (state.success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
        <p className="text-sm font-medium">{state.message}</p>
        <p className="mt-2 text-xs">
          Check your email for a password reset link. It will expire in 1 hour.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
              <Input
                {...field}
                id="forgot-email"
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
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </form>
  );
}
