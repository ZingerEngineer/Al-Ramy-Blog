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
import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { resetPassword } from '@/app/actions/password';
import {
  type ResetPasswordFormData,
  type ResetPasswordFormState,
  resetPasswordSchema,
} from '@/lib/validations/password';

const initialState: ResetPasswordFormState = {
  success: false,
};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
  });

  // Sync server errors with form state
  useEffect(() => {
    if (state?.errors) {
      if (state.errors.password) {
        form.setError('password', { message: state.errors.password[0] });
      }
      if (state.errors.confirmPassword) {
        form.setError('confirmPassword', {
          message: state.errors.confirmPassword[0],
        });
      }
    }
  }, [state?.errors, form]);

  if (state.success) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          <p className="text-sm font-medium">{state.message}</p>
        </div>
        <Link href="/login">
          <Button className="w-full">Go to Login</Button>
        </Link>
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

      <input type="hidden" name="token" value={token} />

      <FieldGroup>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="reset-password">New Password</FieldLabel>
              <Input
                {...field}
                id="reset-password"
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
              <FieldLabel htmlFor="reset-confirm-password">Confirm Password</FieldLabel>
              <Input
                {...field}
                id="reset-confirm-password"
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
        {isPending ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );
}
