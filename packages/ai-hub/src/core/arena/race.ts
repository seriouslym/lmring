import type { ModelMessage } from 'ai';
import type { ModelComparisonConfig, ModelComparisonResult } from '../../types/runtime';
import { ArenaError } from '../../utils/errors';
import { RuntimeExecutor } from '../runtime/executor';
import { globalMetricsTracker, MetricsCollector } from './metrics';

export async function raceModels(
  models: ModelComparisonConfig[],
  messages: ModelMessage[],
  options?: {
    streaming?: boolean;
  },
): Promise<ModelComparisonResult> {
  const { streaming = true } = options || {};

  // Create promises for each model
  const promises = models.map(async (config): Promise<ModelComparisonResult> => {
    const { provider, model, options: modelOptions } = config;

    // Extract provider info
    let providerId = 'unknown';
    if (typeof provider === 'object' && provider !== null) {
      providerId = provider.providerId || provider.name || 'unknown';
    }

    // Create metrics collector
    const collector = new MetricsCollector();
    collector.start();

    // Create executor
    const executor = new RuntimeExecutor(provider);

    try {
      if (streaming) {
        const streamResult = await executor.streamText({
          model,
          messages,
          ...modelOptions,
        });

        // Consume stream to get full text
        const reader = streamResult.textStream.getReader();
        const chunks: string[] = [];
        let hasFirstToken = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (!hasFirstToken) {
            collector.recordFirstToken();
            hasFirstToken = true;
          }

          chunks.push(value);
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
        const result = await executor.generateText({
          model,
          messages,
          ...modelOptions,
        });

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

      // Re-throw to participate in race
      throw {
        provider: providerId,
        model,
        error: errorObj,
        metrics,
        status: 'failed' as const,
      };
    }
  });

  try {
    // Race all promises - first to complete wins
    const winner = await Promise.race(promises);
    return winner;
  } catch (_firstFailure) {
    // If Promise.race throws, it means the first to complete failed
    // Try to wait for any successful result
    const results = await Promise.allSettled(promises);

    // Find first successful result
    for (const result of results) {
      if (result.status === 'fulfilled') {
        return result.value;
      }
    }

    // All failed - collect errors
    const errors: Error[] = [];
    for (const result of results) {
      if (result.status === 'rejected' && result.reason.error) {
        errors.push(result.reason.error);
      }
    }

    throw new ArenaError('All models failed in race', errors);
  }
}
