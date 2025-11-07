import { env } from '@lmring/env';

/**
 * Get the base URL for the application
 * This function provides a consistent baseURL across server and client
 *
 * Priority order:
 * 1. Server-side only: BETTER_AUTH_URL (for auth-specific operations)
 * 2. NEXT_PUBLIC_APP_URL (explicit app URL, works on client and server)
 * 3. Server-side only: VERCEL_PROJECT_PRODUCTION_URL (production deployments)
 * 4. Server-side only: VERCEL_URL (preview deployments)
 * 5. Fallback: http://localhost:3000 (local development)
 */
export const getBaseUrl = () => {
  // Server-side only: Check BETTER_AUTH_URL first
  if (typeof window === 'undefined' && env.BETTER_AUTH_URL) {
    return env.BETTER_AUTH_URL;
  }

  // Check explicit app URL (available on both client and server)
  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL;
  }

  // Vercel-specific URLs (server-side only)
  if (typeof window === 'undefined') {
    if (env.VERCEL_ENV === 'production' && env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    if (env.VERCEL_URL) {
      return `https://${env.VERCEL_URL}`;
    }
  }

  return 'http://localhost:3000';
};

/**
 * Get the auth base URL specifically for Better Auth
 * This ensures consistent URL resolution between Auth server and client
 *
 * IMPORTANT: If you set BETTER_AUTH_URL, make sure NEXT_PUBLIC_APP_URL
 * points to the same URL to prevent OAuth callback mismatches.
 * The client can only access NEXT_PUBLIC_APP_URL, while the server
 * can access both BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL.
 */
export const getAuthBaseUrl = () => {
  const baseUrl = getBaseUrl();

  // Validate consistency between BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL
  if (
    typeof window === 'undefined' &&
    env.BETTER_AUTH_URL &&
    env.NEXT_PUBLIC_APP_URL &&
    env.BETTER_AUTH_URL !== env.NEXT_PUBLIC_APP_URL
  ) {
    console.warn(
      'Warning: BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL are different. ' +
        'This may cause OAuth callback mismatches. The client will use NEXT_PUBLIC_APP_URL ' +
        'while the server uses BETTER_AUTH_URL for auth operations.',
    );
  }

  return baseUrl;
};
