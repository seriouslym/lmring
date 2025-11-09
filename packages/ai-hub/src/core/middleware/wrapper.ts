import type { LanguageModelV2 } from '@ai-sdk/provider';
import { type LanguageModelMiddleware, wrapLanguageModel } from 'ai';

/**
 * Wraps a language model with middlewares
 */
export function wrapWithMiddlewares(
  model: LanguageModelV2,
  middlewares: LanguageModelMiddleware | LanguageModelMiddleware[],
): LanguageModelV2 {
  if (Array.isArray(middlewares)) {
    // Apply middlewares in order
    let wrappedModel = model;
    for (const middleware of middlewares) {
      wrappedModel = wrapLanguageModel({
        model: wrappedModel,
        middleware,
      });
    }
    return wrappedModel;
  }

  return wrapLanguageModel({
    model,
    middleware: middlewares,
  });
}

/**
 * Creates a middleware that logs all model calls
 */
export function createLoggingMiddleware(
  options: {
    logInput?: boolean;
    logOutput?: boolean;
    logger?: (message: string, data?: unknown) => void;
  } = {},
): LanguageModelMiddleware {
  const { logInput = true, logger = console.log } = options;

  return {
    transformParams: async ({ params }) => {
      if (logInput) {
        logger('Model input:', params);
      }
      return params;
    },
  };
}

/**
 * Creates a middleware that tracks performance metrics
 */
export function createMetricsMiddleware(
  onMetrics: (metrics: {
    duration: number;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  }) => void,
): LanguageModelMiddleware {
  return {
    wrapGenerate: async ({ doGenerate }) => {
      const startTime = Date.now();
      const result = await doGenerate();

      const duration = Date.now() - startTime;
      const usage =
        result && typeof result === 'object' && 'usage' in result
          ? (
              result as {
                usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
              }
            ).usage
          : undefined;

      onMetrics({
        duration,
        promptTokens: usage?.promptTokens,
        completionTokens: usage?.completionTokens,
        totalTokens: usage?.totalTokens,
      });

      return result;
    },
  };
}

/**
 * Creates a middleware that adds retry logic
 */
export function createRetryMiddleware(
  options: {
    maxRetries?: number;
    retryDelay?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {},
): LanguageModelMiddleware {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    shouldRetry = (error) => error.message.includes('rate limit'),
  } = options;

  return {
    wrapGenerate: async ({ doGenerate }) => {
      let lastError: Error | undefined;

      for (let i = 0; i < maxRetries; i++) {
        try {
          return await doGenerate();
        } catch (error) {
          lastError = error as Error;

          if (!shouldRetry(lastError) || i === maxRetries - 1) {
            throw lastError;
          }

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (i + 1)));
        }
      }

      throw lastError;
    },
  };
}

/**
 * Composes multiple middlewares into one
 */
export function composeMiddlewares(
  ...middlewares: LanguageModelMiddleware[]
): LanguageModelMiddleware {
  type GenerateWrapper = NonNullable<LanguageModelMiddleware['wrapGenerate']>;
  type StreamWrapper = NonNullable<LanguageModelMiddleware['wrapStream']>;
  type GenerateOptions = Parameters<GenerateWrapper>[0];
  type StreamOptions = Parameters<StreamWrapper>[0];
  type GenerateHandler = (options: GenerateOptions) => ReturnType<GenerateWrapper>;
  type StreamHandler = (options: StreamOptions) => ReturnType<StreamWrapper>;

  const wrapGenerate = middlewares.reduceRight<GenerateHandler>(
    (next, middleware) => {
      const middlewareWrapGenerate = middleware.wrapGenerate;
      if (!middlewareWrapGenerate) {
        return next;
      }

      return async (options) =>
        middlewareWrapGenerate({
          ...options,
          doGenerate: () => next(options),
        });
    },
    async (options) => Promise.resolve(options.doGenerate()),
  );

  const wrapStream = middlewares.reduceRight<StreamHandler>(
    (next, middleware) => {
      const middlewareWrapStream = middleware.wrapStream;
      if (!middlewareWrapStream) {
        return next;
      }

      return async (options) =>
        middlewareWrapStream({
          ...options,
          doStream: () => next(options),
        });
    },
    async (options) => Promise.resolve(options.doStream()),
  );

  return {
    transformParams: async ({ type, params, model }) => {
      let result = params;

      for (const middleware of middlewares) {
        if (middleware.transformParams) {
          result = await middleware.transformParams({ type, params: result, model });
        }
      }

      return result;
    },
    wrapGenerate,
    wrapStream,
  };
}
