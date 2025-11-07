/**
 * Performance Monitoring for Arena
 *
 * Tools for tracking and comparing model performance metrics
 */

import type { LanguageModelMiddleware } from 'ai';

/**
 * Performance metrics for a single request
 */
export interface PerformanceMetrics {
  /** Model identifier */
  modelId: string;
  /** Provider identifier */
  providerId: string;
  /** Request start timestamp */
  startTime: number;
  /** Request end timestamp */
  endTime?: number;
  /** Time to first token (ms) */
  timeToFirstToken?: number;
  /** Total execution time (ms) */
  totalTime?: number;
  /** Input tokens */
  inputTokens?: number;
  /** Output tokens */
  outputTokens?: number;
  /** Total tokens */
  totalTokens?: number;
  /** Tokens per second */
  tokensPerSecond?: number;
  /** Whether the request succeeded */
  success: boolean;
  /** Error message if failed */
  errorMessage?: string;
}

/**
 * Performance tracker class
 *
 * Tracks metrics for model requests
 */
export class PerformanceTracker {
  private metrics: Map<string, PerformanceMetrics> = new Map();

  /**
   * Start tracking a request
   *
   * @param requestId - Unique request ID
   * @param modelId - Model ID
   * @param providerId - Provider ID
   */
  startRequest(requestId: string, modelId: string, providerId: string): void {
    this.metrics.set(requestId, {
      modelId,
      providerId,
      startTime: Date.now(),
      success: false,
    });
  }

  /**
   * Record time to first token
   *
   * @param requestId - Request ID
   */
  recordFirstToken(requestId: string): void {
    const metrics = this.metrics.get(requestId);
    if (metrics && !metrics.timeToFirstToken) {
      metrics.timeToFirstToken = Date.now() - metrics.startTime;
    }
  }

  /**
   * End tracking a request
   *
   * @param requestId - Request ID
   * @param usage - Token usage information
   */
  endRequest(
    requestId: string,
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    },
  ): void {
    const metrics = this.metrics.get(requestId);
    if (!metrics) return;

    metrics.endTime = Date.now();
    metrics.totalTime = metrics.endTime - metrics.startTime;
    metrics.success = true;

    if (usage) {
      metrics.inputTokens = usage.promptTokens;
      metrics.outputTokens = usage.completionTokens;
      metrics.totalTokens = usage.totalTokens;

      if (usage.totalTokens && metrics.totalTime) {
        metrics.tokensPerSecond = (usage.totalTokens / metrics.totalTime) * 1000;
      }
    }
  }

  /**
   * Record an error
   *
   * @param requestId - Request ID
   * @param error - Error object or message
   */
  recordError(requestId: string, error: Error | string): void {
    const metrics = this.metrics.get(requestId);
    if (!metrics) return;

    metrics.endTime = Date.now();
    metrics.totalTime = metrics.endTime - metrics.startTime;
    metrics.success = false;
    metrics.errorMessage = typeof error === 'string' ? error : error.message;
  }

  /**
   * Get metrics for a request
   *
   * @param requestId - Request ID
   * @returns Metrics or undefined
   */
  getMetrics(requestId: string): PerformanceMetrics | undefined {
    return this.metrics.get(requestId);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics grouped by provider
   */
  getMetricsByProvider(): Map<string, PerformanceMetrics[]> {
    const grouped = new Map<string, PerformanceMetrics[]>();

    for (const metrics of this.metrics.values()) {
      const existing = grouped.get(metrics.providerId) || [];
      existing.push(metrics);
      grouped.set(metrics.providerId, existing);
    }

    return grouped;
  }

  /**
   * Calculate average metrics for a provider
   *
   * @param providerId - Provider ID
   * @returns Average metrics
   */
  getAverageMetrics(providerId: string): {
    avgTotalTime?: number;
    avgTimeToFirstToken?: number;
    avgTokensPerSecond?: number;
    successRate: number;
  } {
    const providerMetrics = this.getAllMetrics().filter((m) => m.providerId === providerId);

    if (providerMetrics.length === 0) {
      return { successRate: 0 };
    }

    const successfulMetrics = providerMetrics.filter((m) => m.success);
    const successRate = successfulMetrics.length / providerMetrics.length;

    if (successfulMetrics.length === 0) {
      return { successRate };
    }

    const avgTotalTime =
      successfulMetrics.reduce((sum, m) => sum + (m.totalTime || 0), 0) / successfulMetrics.length;

    const metricsWithFirstToken = successfulMetrics.filter((m) => m.timeToFirstToken);
    const avgTimeToFirstToken =
      metricsWithFirstToken.length > 0
        ? metricsWithFirstToken.reduce((sum, m) => sum + (m.timeToFirstToken || 0), 0) /
          metricsWithFirstToken.length
        : undefined;

    const metricsWithTPS = successfulMetrics.filter((m) => m.tokensPerSecond);
    const avgTokensPerSecond =
      metricsWithTPS.length > 0
        ? metricsWithTPS.reduce((sum, m) => sum + (m.tokensPerSecond || 0), 0) /
          metricsWithTPS.length
        : undefined;

    return {
      avgTotalTime,
      avgTimeToFirstToken,
      avgTokensPerSecond,
      successRate,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Remove metrics for a specific request
   *
   * @param requestId - Request ID
   */
  remove(requestId: string): boolean {
    return this.metrics.delete(requestId);
  }
}

/**
 * Global performance tracker instance
 */
export const performanceTracker = new PerformanceTracker();

/**
 * Create a performance tracking middleware
 *
 * @param requestId - Request ID
 * @param modelId - Model ID
 * @param providerId - Provider ID
 * @param tracker - Performance tracker instance (default: global tracker)
 * @returns Language model middleware
 *
 * @remarks
 * For non-streaming requests (`generateText`), token usage is automatically recorded
 * when the request completes.
 *
 * For streaming requests (`streamText`), basic timing metrics (start time, end time,
 * total time) are automatically recorded, but token usage must be manually updated by
 * the caller after consuming the stream, as usage data is only available from the final
 * result object.
 *
 * @example
 * Non-streaming usage:
 * ```typescript
 * const middleware = createPerformanceMiddleware('req-1', 'gpt-4', 'openai');
 * const model = wrapLanguageModel({
 *   model: openai('gpt-4'),
 *   middleware
 * });
 * const result = await generateText({ model, prompt: 'Hello' });
 * // Usage is automatically recorded
 * ```
 *
 * @example
 * Streaming usage with manual token tracking:
 * ```typescript
 * const requestId = 'req-1';
 * const middleware = createPerformanceMiddleware(requestId, 'gpt-4', 'openai');
 * const model = wrapLanguageModel({
 *   model: openai('gpt-4'),
 *   middleware
 * });
 *
 * const result = await streamText({ model, prompt: 'Hello' });
 *
 * // Consume the stream
 * for await (const chunk of result.textStream) {
 *   console.log(chunk);
 * }
 *
 * // Update token usage after stream completion
 * const usage = await result.usage;
 * performanceTracker.endRequest(requestId, usage);
 * ```
 */
export function createPerformanceMiddleware(
  requestId: string,
  modelId: string,
  providerId: string,
  tracker: PerformanceTracker = performanceTracker,
): LanguageModelMiddleware {
  return {
    // biome-ignore lint/suspicious/noExplicitAny: Middleware function parameters are not strongly typed in AI SDK
    wrapGenerate: async ({ doGenerate }: any) => {
      tracker.startRequest(requestId, modelId, providerId);

      try {
        const result = await doGenerate();

        // Record usage from the result
        if (result.usage) {
          tracker.endRequest(requestId, result.usage);
        } else {
          tracker.endRequest(requestId);
        }

        return result;
      } catch (error) {
        tracker.recordError(requestId, error as Error);
        throw error;
      }
    },

    // biome-ignore lint/suspicious/noExplicitAny: Middleware function parameters are not strongly typed in AI SDK
    wrapStream: async ({ doStream }: any) => {
      tracker.startRequest(requestId, modelId, providerId);
      let firstTokenRecorded = false;

      try {
        const { stream, ...rest } = await doStream();

        const transformStream = new TransformStream({
          transform(chunk, controller) {
            if (!firstTokenRecorded && chunk.type === 'text-delta') {
              tracker.recordFirstToken(requestId);
              firstTokenRecorded = true;
            }

            controller.enqueue(chunk);
          },

          flush() {
            // Record stream completion (basic timing metrics)
            // Note: Token usage must be recorded separately by the caller after
            // consuming the stream, as usage data is only available from the
            // final result object (await result.usage)
            tracker.endRequest(requestId);
          },
        });

        return {
          stream: stream.pipeThrough(transformStream),
          ...rest,
        };
      } catch (error) {
        tracker.recordError(requestId, error as Error);
        throw error;
      }
    },
  };
}
