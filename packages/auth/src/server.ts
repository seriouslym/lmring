/**
 * Server-side authentication instance
 */

import { betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, users, session, account, verification } from '@lmring/database';
import { getAuthConfig } from './config';
import { UserStatus } from './status';
import type { AuthLogger } from './logger';
import { authLogger as defaultLogger } from './logger';
import { AuthErrorCodes, createAuthError } from './errors';

interface CreateAuthOptions {
  deploymentMode: 'saas' | 'selfhost';
  baseURL: string;
  secret: string;
  githubClientId?: string;
  githubClientSecret?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  logger?: AuthLogger;
}

export function createAuth(options: CreateAuthOptions) {
  const logger = options.logger || defaultLogger;
  
  logger.info('Initializing Better-Auth server instance', {
    deploymentMode: options.deploymentMode,
  });

  try {
    const config = getAuthConfig({ ...options, logger });

    logger.info('Creating database adapter', {
      provider: 'pg',
    });

    // Prepare the complete betterAuth configuration
    const betterAuthConfig = {
      ...config,
      database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
          user: users,
          session: session,
          account: account,
          verification: verification,
        },
      }),
      advanced: {
        // Let database generate UUIDs for user table only
        // Better-Auth generates non-standard IDs incompatible with PostgreSQL UUID type
        // For other tables (session, account, verification), let Better-Auth generate text IDs
        generateId: (options: { model: string; fieldType?: string }) => {
          if (options.model === 'user') {
            return undefined; // Let database generate UUID
          }
          // Return undefined to use Better-Auth's default ID generation for other tables
        },
      },
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true,
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        freshAge: 60 * 10, // 10 minutes
      },
      // Account linking configuration
      account: {
        accountLinking: {
          enabled: true,
          trustedProviders: ['github', 'google'],
        },
      },
      // User creation hooks to set default role and status
      user: {
        // Field mapping: map Better-Auth required fields to our database schema
        fields: {
          name: 'fullName',          // Better-Auth's "name" -> our "fullName"
          image: 'avatarUrl',        // Better-Auth's "image" -> our "avatarUrl"
          emailVerified: 'emailVerified', // Keep as is (snake_case in DB)
        },
        additionalFields: {
          role: {
            type: 'string',
            defaultValue: 'user',
            required: true,
          },
          status: {
            type: 'string',
            defaultValue: 'active',
            required: true,
          },
        },
      },
      // Hooks to validate user status during sign-in
      hooks: {
        before: createAuthMiddleware(async (ctx) => {
          // Match sign-in endpoints
          if (
            ctx.path === '/sign-in/email' ||
            ctx.path === '/sign-in/social' ||
            ctx.path?.includes('/callback')
          ) {
            logger.debug('Authentication attempt started', {
              path: ctx.path,
              method: ctx.method,
              body: ctx.body,
            });
          }
        }),
        after: createAuthMiddleware(async (ctx) => {
          // Match sign-in endpoints
          if (
            ctx.path === '/sign-in/email' ||
            ctx.path === '/sign-in/social' ||
            ctx.path?.includes('/callback')
          ) {
            // Check if user was successfully authenticated
            if (ctx.context?.user) {
              const user = ctx.context.user as any;

              logger.debug('User authentication successful, checking status', {
                userId: user.id,
                status: user.status,
                role: user.role,
              });

              // Check user status
              if (user.status === UserStatus.DISABLED) {
                logger.warn('Disabled user attempted to sign in', {
                  userId: user.id,
                  status: user.status,
                  errorCode: AuthErrorCodes.USER_DISABLED,
                });

                // Throw error to prevent sign-in
                throw createAuthError(AuthErrorCodes.USER_DISABLED);
              }

              if (user.status === UserStatus.PENDING) {
                logger.warn('Pending user attempted to sign in', {
                  userId: user.id,
                  status: user.status,
                  errorCode: AuthErrorCodes.USER_PENDING,
                });

                throw createAuthError(AuthErrorCodes.USER_PENDING);
              }

              // Log successful sign-in for active users
              if (user.status === UserStatus.ACTIVE) {
                logger.info('User signed in successfully', {
                  userId: user.id,
                  role: user.role,
                  status: user.status,
                  provider: ctx.path?.includes('social') ? 'oauth' : 'email',
                });
              }
            } else {
              logger.debug('Authentication attempt completed without user context', {
                path: ctx.path,
              });
            }
          }
        }),
      },
    };

    const auth = betterAuth(betterAuthConfig);

    logger.info('Better-Auth server instance created successfully', {
      sessionExpiresIn: '7 days',
      sessionUpdateAge: '1 day',
      sessionFreshAge: '10 minutes',
      emailPasswordEnabled: true,
      accountLinkingEnabled: true,
    });

    return auth;
  } catch (error) {
    logger.error('Failed to create Better-Auth server instance', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth['$Infer']['Session'];
