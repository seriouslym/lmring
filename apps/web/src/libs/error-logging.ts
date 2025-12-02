import * as Sentry from '@sentry/nextjs';

/**
 * Logs an error with context and reports to Sentry in production.
 * @param message - A descriptive message about where the error occurred
 * @param error - The error object to log
 * @param extra - Optional extra context to include in the error report
 */
export function logError(message: string, error: unknown, extra?: Record<string, unknown>): void {
  // Always log to console for development visibility
  console.error(message, error);

  // Report to Sentry with context
  if (error instanceof Error) {
    Sentry.captureException(error, {
      extra: {
        message,
        ...extra,
      },
    });
  } else {
    Sentry.captureMessage(message, {
      level: 'error',
      extra: {
        error,
        ...extra,
      },
    });
  }
}

/**
 * Creates an API error response handler that logs and returns a consistent error response.
 */
export function handleApiError(
  message: string,
  error: unknown,
  extra?: Record<string, unknown>,
): { error: string } {
  logError(message, error, extra);
  return { error: 'Internal server error' };
}
