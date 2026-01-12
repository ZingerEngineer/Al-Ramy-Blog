'use client';

import { useEffect } from 'react';
import { reportError } from '@/lib/client/error-reporter';

/**
 * Global Error Handler
 * Sets up window-level error handlers for unhandled errors and promise rejections
 * Renders nothing - just sets up event listeners
 * This component doesn't wrap children, so it doesn't affect SSR
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportError(event.reason, {
        context: 'unhandled-promise-rejection',
      });
    };

    // Handle global errors
    const handleError = (event: ErrorEvent) => {
      reportError(event.error || event.message, {
        context: 'global-error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Render nothing - this component only sets up event listeners
  return null;
}
