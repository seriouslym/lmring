/**
 * Batch Executor for Arena
 *
 * Enables concurrent execution of multiple models for comparison
 */

import type {
  GenerateTextResult,
  LanguageModelMiddleware,
  ModelMessage,
  StreamTextResult,
} from 'ai';
import type { CreateProviderOptions } from '../../types/provider';
import { RuntimeExecutor } from '../runtime/RuntimeExecutor';

/**
 * Model configuration for comparison
 */
export interface ModelComparisonConfig {
  /** Provider ID */
  provider: string;
  /** Model ID */
  model: string;
  /** Provider options (API key, etc.) */
  options: Partial<CreateProviderOptions>;
  /** Optional middlewares for this specific model */
  middlewares?: LanguageModelMiddleware[];
}

/**
 * Comparison result for a single model
 */
export interface ModelComparisonResult {
  /** Provider ID */
  provider: string;
  /** Model ID */
  model: string;
  /** Result from streamText or generateText */
  // biome-ignore lint/suspicious/noExplicitAny: Generic result type from AI SDK
  result?: GenerateTextResult<any, any> | StreamTextResult<any, any>;
  /** Error if the request failed */
  error?: Error;
  /** Execution metrics */
  metrics?: {
    /** Time to first token (ms) */
    timeToFirstToken?: number;
    /** Total execution time (ms) */
    totalTime: number;
    /** Total tokens generated */
    totalTokens?: number;
    /** Tokens per second */
    tokensPerSecond?: number;
  };
}

/**
 * Progress callback for streaming results
 */
export type ProgressCallback = (
  provider: string,
  model: string,
  chunk: string,
) => void | Promise<void>;

/**
 * Options for batch comparison
 */
export interface CompareModelsOptions {
  /** Progress callback for streaming updates */
  onProgress?: ProgressCallback;
  /** Whether to use streaming (default: true) */
  streaming?: boolean;
  /** Stop on first error (default: false) */
  stopOnError?: boolean;
}

/**
 * Compare multiple models concurrently
 *
 * @param models - Array of models to compare
 * @param messages - Messages to send to each model
 * @param options - Comparison options
 * @returns Array of comparison results
 *
 * @example
 * ```typescript
 * const results = await compareModels(
 *   [
 *     {
 *       provider: 'openai',
 *       model: 'gpt-4',
 *       options: { apiKey: 'sk-xxx' }
 *     },
 *     {
 *       provider: 'anthropic',
 *       model: 'claude-3-opus-20240229',
 *       options: { apiKey: 'sk-ant-xxx' }
 *     }
 *   ],
 *   [{ role: 'user', content: 'Hello!' }],
 *   {
 *     streaming: true,
 *     onProgress: (provider, model, chunk) => {
 *       console.log(`${provider}/${model}:`, chunk);
 *     }
 *   }
 * );
 * ```
 */
export async function compareModels(
  models: ModelComparisonConfig[],
  messages: ModelMessage[],
  options: CompareModelsOptions = {},
): Promise<ModelComparisonResult[]> {
  const { onProgress, streaming = true, stopOnError = false } = options;

  // Execute all models concurrently
  const promises = models.map(async (config) => {
    const startTime = Date.now();
    let timeToFirstToken: number | undefined;

    try {
      // Create executor for this model
      const executor = RuntimeExecutor.create(config.provider, config.options);

      if (streaming) {
        // Streaming mode
        const result = await executor.streamText(
          {
            model: config.model,
            messages,
          },
          { middlewares: config.middlewares },
        );

        // Track metrics
        let firstToken = true;

        for await (const chunk of result.textStream) {
          if (firstToken) {
            timeToFirstToken = Date.now() - startTime;
            firstToken = false;
          }

          // Call progress callback
          if (onProgress) {
            await onProgress(config.provider, config.model, chunk);
          }
        }

        // Wait for the full result to get usage data
        const finalResult = await result;
        const usage = await finalResult.usage;
        const totalTime = Date.now() - startTime;

        return {
          provider: config.provider,
          model: config.model,
          result: finalResult,
          metrics: {
            timeToFirstToken,
            totalTime,
            totalTokens: usage?.totalTokens,
            tokensPerSecond: usage?.totalTokens
              ? (usage.totalTokens / totalTime) * 1000
              : undefined,
          },
        };
      } else {
        // Non-streaming mode
        const result = await executor.generateText(
          {
            model: config.model,
            messages,
          },
          { middlewares: config.middlewares },
        );

        const totalTime = Date.now() - startTime;

        return {
          provider: config.provider,
          model: config.model,
          result,
          metrics: {
            totalTime,
            totalTokens: result.usage?.totalTokens,
            tokensPerSecond: result.usage?.totalTokens
              ? (result.usage.totalTokens / totalTime) * 1000
              : undefined,
          },
        };
      }
    } catch (error) {
      const totalTime = Date.now() - startTime;

      // If stopOnError is true, throw the error
      if (stopOnError) {
        throw error;
      }

      // Otherwise, return the error in the result
      return {
        provider: config.provider,
        model: config.model,
        error: error as Error,
        metrics: {
          totalTime,
        },
      };
    }
  });

  // Wait for all results
  return Promise.all(promises);
}

/**
 * Compare models in a race
 * Returns the first model to complete successfully
 *
 * @param models - Array of models to race
 * @param messages - Messages to send
 * @returns The first successful result
 */
export async function raceModels(
  models: ModelComparisonConfig[],
  messages: ModelMessage[],
): Promise<ModelComparisonResult> {
  if (models.length === 0) {
    throw new Error('raceModels requires at least one model to compare');
  }

  const promises = models.map(async (config) => {
    const startTime = Date.now();
    const executor = RuntimeExecutor.create(config.provider, config.options);

    const result = await executor.generateText(
      {
        model: config.model,
        messages,
      },
      { middlewares: config.middlewares },
    );

    const totalTime = Date.now() - startTime;

    return {
      provider: config.provider,
      model: config.model,
      result,
      metrics: {
        totalTime,
        totalTokens: result.usage?.totalTokens,
      },
    };
  });

  // Return first successful result, ignore failures until all fail
  return new Promise((resolve, reject) => {
    let remaining = promises.length;
    const errors: Error[] = [];

    for (const promise of promises) {
      promise
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          errors.push(error instanceof Error ? error : new Error(String(error)));
          remaining -= 1;
          if (remaining === 0) {
            reject(new AggregateError(errors, 'All models failed'));
          }
        });
    }
  });
}
