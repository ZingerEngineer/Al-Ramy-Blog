'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { authLogger } from '@/lib/logger';
import {
  checkRateLimit,
  getPasswordChangeKey,
  getPasswordResetRequestKey,
  RATE_LIMITS,
} from '@/lib/rate-limit';
import {
  type ChangePasswordFormState,
  changePasswordSchema,
  type ForgotPasswordFormState,
  forgotPasswordSchema,
  type ResetPasswordFormState,
  resetPasswordSchema,
} from '@/lib/validations/password';

/**
 * Request password reset email
 * Always returns success to prevent user enumeration
 */
export async function requestPasswordReset(
  _prevState: ForgotPasswordFormState,
  formData: FormData,
): Promise<ForgotPasswordFormState> {
  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email } = validatedFields.data;

  try {
    const { allowed } = await checkRateLimit(
      getPasswordResetRequestKey(email),
      RATE_LIMITS.PASSWORD_RESET_REQUEST.limit,
      RATE_LIMITS.PASSWORD_RESET_REQUEST.windowSeconds,
    );
    if (!allowed) {
      return {
        success: false,
        message: 'Too many requests. Please try again later.',
      };
    }
    await auth.api.requestPasswordReset({
      body: {
        email,
      },
      headers: await headers(),
    });

    authLogger.info({ email }, 'Password reset requested');

    // Always return success to prevent user enumeration
    return {
      success: true,
      message: 'If an account exists with that email, you will receive a password reset link.',
    };
  } catch (error) {
    authLogger.error({ email, err: error }, 'Password reset request failed');

    // Don't reveal if user exists - always return success message
    return {
      success: true,
      message: 'If an account exists with that email, you will receive a password reset link.',
    };
  }
}

/**
 * Reset password with token from email
 */
export async function resetPassword(
  _prevState: ResetPasswordFormState,
  formData: FormData,
): Promise<ResetPasswordFormState> {
  const validatedFields = resetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { token, password } = validatedFields.data;

  try {
    const response = await auth.api.resetPassword({
      body: {
        token,
        newPassword: password,
      },
      headers: await headers(),
    });

    // Check if the response indicates success
    if (!response) {
      authLogger.warn(
        { tokenPrefix: token.slice(0, 10) },
        'Password reset failed - invalid response',
      );
      return {
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.',
      };
    }

    authLogger.info('Password reset successfully');

    return {
      success: true,
      message: 'Password reset successfully! You can now sign in.',
    };
  } catch (error) {
    authLogger.error({ err: error, tokenPrefix: token.slice(0, 10) }, 'Password reset failed');

    // Check for specific error messages
    const errorMessage = error instanceof Error ? error.message : '';

    if (
      errorMessage.includes('token') ||
      errorMessage.includes('expired') ||
      errorMessage.includes('invalid')
    ) {
      return {
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.',
      };
    }

    return {
      success: false,
      message: 'Failed to reset password. Please try again or request a new reset link.',
    };
  }
}

/**
 * Change password for authenticated user
 */
export async function changePassword(
  _prevState: ChangePasswordFormState,
  formData: FormData,
): Promise<ChangePasswordFormState> {
  // First, check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    authLogger.warn('Change password attempted without authentication');
    return {
      success: false,
      message: 'You must be logged in to change your password.',
    };
  }
  const { allowed } = await checkRateLimit(
    getPasswordChangeKey(session.user.id),
    RATE_LIMITS.PASSWORD_CHANGE.limit,
    RATE_LIMITS.PASSWORD_CHANGE.windowSeconds,
  );
  if (!allowed) {
    return {
      success: false,
      message: 'Too many requests. Please try again later.',
    };
  }

  const validatedFields = changePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword } = validatedFields.data;

  try {
    const response = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: false, // Keep other sessions active
      },
      headers: await headers(),
    });

    // Check if the response indicates success
    if (!response) {
      authLogger.warn({ userId: session.user.id }, 'Password change failed - invalid response');
      return {
        success: false,
        message: 'Failed to change password. Please try again.',
      };
    }

    authLogger.info({ userId: session.user.id }, 'Password changed successfully');

    return {
      success: true,
      message: 'Password changed successfully!',
    };
  } catch (error) {
    authLogger.error({ userId: session.user.id, err: error }, 'Password change failed');

    // Handle specific error cases
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';

    if (
      errorMessage.includes('password') ||
      errorMessage.includes('incorrect') ||
      errorMessage.includes('invalid')
    ) {
      return {
        success: false,
        errors: {
          currentPassword: ['Current password is incorrect'],
        },
      };
    }

    if (errorMessage.includes('session') || errorMessage.includes('auth')) {
      return {
        success: false,
        message: 'Your session has expired. Please log in again.',
      };
    }

    return {
      success: false,
      message: 'Failed to change password. Please try again.',
    };
  }
}
