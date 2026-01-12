'use client';

import { useEffect } from 'react';
import { clientErrorLogger } from '@/lib/logger';

/**
 * Global error boundary for root-level errors
 * Catches errors in the root layout and provides a fallback UI
 * Must include <html> and <body> tags as it replaces the root layout
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to our error logging service
    clientErrorLogger.error(
      {
        err: error,
        digest: error.digest,
      },
      'Global error boundary triggered',
    );
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Something went wrong!</h1>
          <p>We're sorry, but something unexpected happened.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
