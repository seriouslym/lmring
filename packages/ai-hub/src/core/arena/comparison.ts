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

  const abortController = controller || new AbortController();

  const promises = models.map(async (config) => {
    const { provider, model, options: modelOptions } = config;

    let providerId = 'unknown';
    if (typeof provider === 'object' && provider !== null) {
      providerId = provider.providerId || provider.name || 'unknown';
    }

    const collector = new MetricsCollector();
    collector.start();

    const executor = new RuntimeExecutor(provider, plugins);

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

        const usage = await streamResult.usage;
        if (usage) {
          collector.recordTokens({
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
          });
        }

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

        if (result.usage) {
          const usage = result.usage;
          collector.recordTokens({
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
          });
        }

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
      const metrics = collector.getMetrics();

      const result: ModelComparisonResult = {
        provider: providerId,
        model,
        error: errorObj,
        metrics,
        status: error instanceof Error && error.message === 'Aborted' ? 'cancelled' : 'failed',
      };

      if (stopOnError) {
        abortController.abort();
        throw new ArenaError(`Model ${providerId}/${model} failed`, [errorObj]);
      }

      return result;
    }
  });

  const results = await Promise.all(promises);

  const allFailed = results.every((r) => r.status === 'failed');
  if (allFailed) {
    const errors = results.filter((r) => r.error).map((r) => r.error as Error);
    console.error('=== Arena Comparison: All Models Failed ===');
    for (const result of results) {
      console.error(`\n--- Model: ${result.provider}/${result.model} ---`);
      console.error('Status:', result.status);
      if (result.error) {
        console.error('Error Name:', result.error.name);
        console.error('Error Message:', result.error.message);
        if (result.error.cause) {
          console.error('Error Cause:', result.error.cause);
        }
        if (result.error.stack) {
          console.error('Stack Trace:', result.error.stack);
        }
      }
      console.error('Metrics:', JSON.stringify(result.metrics, null, 2));
    }
    console.error('===========================================\n');

    throw new ArenaError('All models failed', errors);
  }

  return results;
}

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
      const baseDelay = this.options.initialDelay || 1000;
      const delay =
        this.options.backoff === 'exponential'
          ? Math.min(baseDelay * 2 ** (this.attempts - 1), this.options.maxDelay || 10000)
          : Math.min(baseDelay * this.attempts, this.options.maxDelay || 10000);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
