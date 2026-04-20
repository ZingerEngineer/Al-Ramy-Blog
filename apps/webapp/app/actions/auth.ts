'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { authLogger } from '@/lib/logger';
import {
  type LoginFormState,
  loginSchema,
  type RegisterFormState,
  registerSchema,
} from '@/lib/validations/auth';

export async function registerUser(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const validatedFields = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  authLogger.info({ email, name }, 'Registration attempt started');

  let registered = false;

  try {
    // Use Better Auth server-side API for registration
    const response = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (!response) {
      authLogger.warn({ email }, 'Registration failed - no response from auth API');
      return {
        success: false,
        message: 'Registration failed',
      };
    }

    authLogger.info({ email, userId: response.user?.id }, 'User registered successfully');
    registered = true;
  } catch (error) {
    // Check for duplicate email error
    if (error instanceof Error && error.message.includes('already exists')) {
      authLogger.warn({ email }, 'Registration failed - email already exists');
      return {
        success: false,
        errors: {
          email: ['An account with this email already exists'],
        },
      };
    }

    authLogger.error({ email, err: error }, 'Registration failed with error');

    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    };
  }

  // Outside try/catch — redirect() throws internally and must not be caught
  if (registered) {
    redirect(`/check-email?email=${encodeURIComponent(email)}`);
  }

  return { success: false, message: 'Registration failed' };
}

export async function signInWithCredentials(
  _prevState: LoginFormState | undefined,
  formData: FormData,
): Promise<LoginFormState | undefined> {
  // Validate inputs
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;
  let success = false;

  authLogger.info({ email }, 'Login attempt started');

  try {
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });

    if (!response) {
      authLogger.warn({ email }, 'Login failed - invalid credentials');
      return { error: 'Invalid email or password' };
    }

    authLogger.info({ email, userId: response.user?.id }, 'User logged in successfully');
    success = true;
  } catch (error) {
    authLogger.error({ email, err: error }, 'Login failed with error');
    return { error: 'Invalid email or password' };
  }

  // ✅ Outside try/catch - invalidate cache before redirect
  if (success) {
    // Invalidate cache to ensure session is fresh
    revalidatePath('/home', 'page');
    revalidatePath('/', 'layout');

    authLogger.debug({ email }, 'Cache invalidated, redirecting to /home');
    redirect('/home');
  }

  return undefined;
}

export async function signOutAction() {
  authLogger.info('Sign-out attempt started');

  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    authLogger.info('User signed out successfully');
  } catch (error) {
    authLogger.error({ err: error }, 'Sign-out failed');
  }
}
