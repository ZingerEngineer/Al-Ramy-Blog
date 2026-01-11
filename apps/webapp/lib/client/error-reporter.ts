'use client';

/**
 * Client-side error reporter
 * Sends errors to the server for logging
 */

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  url?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Report an error to the server for logging
 * @param error - The error to report
 * @param metadata - Additional metadata to include with the error
 */
export async function reportError(
  error: Error | unknown,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const errorReport: ErrorReport = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    };

    // Send error to server
    await fetch('/api/log/client-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorReport),
      // Don't retry on failure to avoid infinite loops
      keepalive: true,
    });
  } catch (_reportingError) {
    return;
  }
}

/**
 * React error boundary error handler
 * @param error - The error that occurred
 * @param errorInfo - Additional error information from React
 */
export function reportReactError(error: Error, errorInfo?: { componentStack?: string }): void {
  reportError(error, {
    componentStack: errorInfo?.componentStack,
    context: 'react-error-boundary',
  });
}

/**
 * Form submission error handler
 * @param error - The error that occurred during form submission
 * @param formName - Name of the form where error occurred
 */
export function reportFormError(error: Error | unknown, formName: string): void {
  reportError(error, {
    context: 'form-submission',
    formName,
  });
}

/**
 * Authentication error handler
 * @param error - The error that occurred during authentication
 * @param action - The auth action (login, register, logout)
 */
export function reportAuthError(
  error: Error | unknown,
  action: 'login' | 'register' | 'logout',
): void {
  reportError(error, {
    context: 'authentication',
    action,
  });
}
