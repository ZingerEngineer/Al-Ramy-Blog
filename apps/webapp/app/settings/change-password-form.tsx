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
import { changePassword } from '@/app/actions/password';
import {
  type ChangePasswordFormData,
  type ChangePasswordFormState,
  changePasswordSchema,
} from '@/lib/validations/password';

const initialState: ChangePasswordFormState = {
  success: false,
};

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, initialState);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Sync server errors with form state
  useEffect(() => {
    if (state?.errors) {
      if (state.errors.currentPassword) {
        form.setError('currentPassword', {
          message: state.errors.currentPassword[0],
        });
      }
      if (state.errors.newPassword) {
        form.setError('newPassword', { message: state.errors.newPassword[0] });
      }
      if (state.errors.confirmPassword) {
        form.setError('confirmPassword', {
          message: state.errors.confirmPassword[0],
        });
      }
    }
  }, [state?.errors, form]);

  // Reset form on success
  useEffect(() => {
    if (state.success) {
      form.reset();
    }
  }, [state.success, form]);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            state.success
              ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-destructive/10 text-destructive'
          }`}
        >
          {state.message}
        </div>
      )}

      <FieldGroup>
        <Controller
          name="currentPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="current-password">Current Password</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                {...field}
                id="current-password"
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

        <Controller
          name="newPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="new-password">New Password</FieldLabel>
              <Input
                {...field}
                id="new-password"
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
              <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
              <Input
                {...field}
                id="confirm-password"
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

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Changing Password...' : 'Change Password'}
      </Button>
    </form>
  );
}
