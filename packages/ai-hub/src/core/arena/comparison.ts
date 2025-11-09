import type { ModelMessage } from 'ai';
import { AiPlugin, type PluginContext } from '../../types/plugin';
import type {
  ArenaOptions,
  ModelComparisonConfig,
  ModelComparisonResult,
  RetryOptions,
} from '../../types/runtime';
import { ArenaError } from '../../utils/errors';
import { RuntimeExecutor } from '../runtime/executor';
import { globalMetricsTracker, MetricsCollector } from './metrics';

export async function compareModels(
  models: ModelComparisonConfig[],
  messages: ModelMessage[],
  options?: ArenaOptions,
): Promise<ModelComparisonResult[]> {
  const {
    controller,
    onProgress,
    plugins = [],
    streaming = true,
    stopOnError = false,
    retryOptions,
  } = options || {};

  // Create abort controller for cancellation
  const abortController = controller || new AbortController();

  // Execute all model requests in parallel
  const promises = models.map(async (config) => {
    const { provider, model, options: modelOptions } = config;

    // Extract provider info
    let providerId = 'unknown';
    if (typeof provider === 'object' && provider !== null) {
      providerId = provider.providerId || provider.name || 'unknown';
    }

    // Create metrics collector
    const collector = new MetricsCollector();
    collector.start();

    // Create executor with plugins
    const executor = new RuntimeExecutor(provider, plugins);

    // Add retry plugin if configured
    const executorPlugins: AiPlugin[] = [];
    if (retryOptions) {
      executorPlugins.push(new RetryPlugin(retryOptions));
    }

    try {
      if (streaming) {
        const streamResult = await executor.streamText(
          {
            model,
            messages,
            ...modelOptions,
          },
          {
            plugins: executorPlugins,
          },
        );
        let hasFirstToken = false;

        // Process stream to collect metrics and notify progress
        const reader = streamResult.textStream.getReader();
        const chunks: string[] = [];

        while (true) {
          if (abortController.signal.aborted) {
            reader.cancel();
            throw new Error('Aborted');
          }

          const { done, value } = await reader.read();

          if (done) break;

          if (!hasFirstToken) {
            collector.recordFirstToken();
            hasFirstToken = true;
          }

          chunks.push(value);

          if (onProgress) {
            onProgress(providerId, model, value);
          }
        }

        // Record token usage if available
        const usage = await streamResult.usage;
        if (usage) {
          collector.recordTokens({
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
          });
        }

        // Record metrics to global tracker
        const metrics = collector.getMetrics();
        globalMetricsTracker.record(providerId, model, metrics);

        const successResult: ModelComparisonResult = {
          provider: providerId,
          model,
          result: {
            text: chunks.join(''),
            usage,
          },
          metrics,
          status: 'success' as const,
        };
        return successResult;
      } else {
        // Non-streaming mode
        const result = await executor.generateText(
          {
            model,
            messages,
            ...modelOptions,
          },
          {
            plugins: executorPlugins,
          },
        );

        // Record token usage
        if (result.usage) {
          const usage = result.usage;
          collector.recordTokens({
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
          });
        }

        // Record metrics to global tracker
        const metrics = collector.getMetrics();
        globalMetricsTracker.record(providerId, model, metrics);

        const successResult: ModelComparisonResult = {
          provider: providerId,
          model,
          result,
          metrics,
          status: 'success' as const,
        };
        return successResult;
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));

      // Still record metrics even on error
      const metrics = collector.getMetrics();

      const result: ModelComparisonResult = {
        provider: providerId,
        model,
        error: errorObj,
        metrics,
        status: error instanceof Error && error.message === 'Aborted' ? 'cancelled' : 'failed',
      };

      if (stopOnError) {
        // Cancel all other requests
        abortController.abort();
        throw new ArenaError(`Model ${providerId}/${model} failed`, [errorObj]);
      }

      return result;
    }
  });

  // Wait for all results
  const results = await Promise.all(promises);

  // Check if all failed
  const allFailed = results.every((r) => r.status === 'failed');
  if (allFailed) {
    const errors = results.filter((r) => r.error).map((r) => r.error as Error);
    throw new ArenaError('All models failed', errors);
  }

  return results;
}

// Retry Plugin for Arena
class RetryPlugin extends AiPlugin {
  name = 'arena-retry';
  private attempts = 0;

  constructor(private options: RetryOptions) {
    super();
  }

  async onError(error: Error, _context: PluginContext): Promise<void> {
    this.attempts++;

    const isRetryable = this.options.retryableErrors
      ? this.options.retryableErrors.some((e: string) => error.message.includes(e))
      : true;

    if (isRetryable && this.attempts < this.options.maxAttempts) {
      // Calculate delay
      const baseDelay = this.options.initialDelay || 1000;
      const delay =
        this.options.backoff === 'exponential'
          ? Math.min(baseDelay * 2 ** (this.attempts - 1), this.options.maxDelay || 10000)
          : Math.min(baseDelay * this.attempts, this.options.maxDelay || 10000);

      await new Promise((resolve) => setTimeout(resolve, delay));

      // Note: Retry mechanism needs to be implemented at a higher level
      // The plugin can only delay, not trigger actual retries
    }
  }
}
