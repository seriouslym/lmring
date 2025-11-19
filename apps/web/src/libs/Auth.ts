/**
 * Better-Auth instance for the application
 */

import { createAuth } from '@lmring/auth';
import { env } from '@lmring/env';
import { getAuthBaseUrl } from '@/utils/Helpers';
import { logger } from './Logger';

const createAuthInstance = () => {
  return createAuth({
    deploymentMode: env.DEPLOYMENT_MODE,
    baseURL: getAuthBaseUrl(),
    secret: env.BETTER_AUTH_SECRET,
    githubClientId: env.GITHUB_CLIENT_ID,
    githubClientSecret: env.GITHUB_CLIENT_SECRET,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
    logger: {
      warn: (message: string, context?: Record<string, unknown>) => {
        logger.warn(message, context);
      },
      info: (message: string, context?: Record<string, unknown>) => {
        logger.info(message, context);
      },
      error: (message: string, context?: Record<string, unknown>) => {
        logger.error(message, context);
      },
      debug: (message: string, context?: Record<string, unknown>) => {
        logger.debug(message, context);
      },
    },
  });
};

const globalForAuth = globalThis as unknown as {
  auth: ReturnType<typeof createAuthInstance> | undefined;
};

export const auth = globalForAuth.auth ?? createAuthInstance();

if (process.env.NODE_ENV !== 'production') {
  globalForAuth.auth = auth;
}

export type { Session } from '@lmring/auth';
