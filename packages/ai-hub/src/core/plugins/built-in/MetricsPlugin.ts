import { AiPlugin, type PluginContext } from '../../../types/plugin';
import type { ModelMetrics } from '../../../types/runtime';
import { globalMetricsTracker, MetricsCollector } from '../../arena/metrics';

export interface MetricsOptions {
  trackGlobally?: boolean;
  onMetrics?: (metrics: ModelMetrics, context: PluginContext) => void;
  trackStreaming?: boolean;
}

export class MetricsPlugin extends AiPlugin {
  name = 'metrics';
  description = 'Tracks performance metrics for AI requests';

  private collectors = new Map<string, MetricsCollector>();
  private options: MetricsOptions;

  constructor(options: MetricsOptions = {}) {
    super();
    this.options = {
      trackGlobally: true,
      trackStreaming: true,
      ...options,
    };
  }

  private getCollector(context: PluginContext): MetricsCollector {
    const key = `${context.providerId}_${context.modelId}_${context.method}`;

    if (!this.collectors.has(key)) {
      this.collectors.set(key, new MetricsCollector());
    }

    const collector = this.collectors.get(key);
    if (!collector) {
      throw new Error(`Failed to get metrics collector for key: ${key}`);
    }
    return collector;
  }

  async onRequestStart(context: PluginContext): Promise<void> {
    const collector = this.getCollector(context);
    // Reset collector to clear any state from previous requests
    collector.reset();
    collector.start();

    // Store collector reference in context for later use
    context.metadata.metricsCollector = collector;
    context.metadata.requestStartTime = Date.now();
  }

  async onStream(chunk: unknown, context: PluginContext): Promise<unknown> {
    if (!this.options.trackStreaming) {
      return chunk;
    }

    const collector = context.metadata.metricsCollector as MetricsCollector;
    if (collector && !context.metadata.firstTokenRecorded) {
      collector.recordFirstToken();
      context.metadata.firstTokenRecorded = true;
    }

    return chunk;
  }

  async onRequestEnd(context: PluginContext, result: unknown): Promise<void> {
    const collector = context.metadata.metricsCollector as MetricsCollector;
    if (!collector) return;

    // Extract token usage from result
    if (result && typeof result === 'object' && 'usage' in result && result.usage) {
      const usage = result.usage as {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
      };
      collector.recordTokens({
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
      });
    }

    // Get final metrics
    const metrics = collector.getMetrics();

    // Track globally if enabled
    if (this.options.trackGlobally) {
      globalMetricsTracker.record(context.providerId, context.modelId, metrics);
    }

    // Call custom handler if provided
    if (this.options.onMetrics) {
      this.options.onMetrics(metrics, context);
    }

    // Store metrics in context for other plugins
    context.metadata.metrics = metrics;
  }

  async onError(error: Error, context: PluginContext): Promise<void> {
    const collector = context.metadata.metricsCollector as MetricsCollector;
    if (!collector) return;

    // Still record metrics even on error
    const metrics = collector.getMetrics();

    // Mark as failed in metadata
    context.metadata.metrics = {
      ...metrics,
      failed: true,
      error: error.message,
    };

    // Track globally if enabled
    if (this.options.trackGlobally) {
      globalMetricsTracker.record(context.providerId, context.modelId, metrics);
    }

    // Call custom handler
    if (this.options.onMetrics) {
      this.options.onMetrics(metrics, context);
    }
  }

  getMetrics(
    providerId?: string,
    modelId?: string,
  ): Map<string, ModelMetrics[]> | ModelMetrics[] | Record<string, ModelMetrics> | undefined {
    if (this.options.trackGlobally) {
      return globalMetricsTracker.getMetrics(providerId, modelId);
    }

    // Return local metrics
    const results: Record<string, ModelMetrics> = {};
    for (const [key, collector] of this.collectors.entries()) {
      if (providerId && !key.startsWith(providerId)) continue;
      if (modelId && !key.includes(modelId)) continue;
      results[key] = collector.getMetrics();
    }
    return results;
  }

  clearMetrics(): void {
    this.collectors.clear();
    if (this.options.trackGlobally) {
      globalMetricsTracker.clear();
    }
  }
}
