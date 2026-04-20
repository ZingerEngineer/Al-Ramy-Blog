import { z } from 'zod';

/**
 * Password validation rules (reusable)
 */
const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export type ForgotPasswordFormState = {
  success: boolean;
  message?: string;
  errors?: {
    email?: string[];
  };
};

/**
 * Reset password schema
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export type ResetPasswordFormState = {
  success: boolean;
  message?: string;
  errors?: {
    token?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
};

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export type ChangePasswordFormState = {
  success: boolean;
  message?: string;
  errors?: {
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
  };
};
