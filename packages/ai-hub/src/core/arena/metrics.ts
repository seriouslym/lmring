import type { ModelMetrics } from '../../types/runtime';

export class MetricsCollector {
  private startTime: number = 0;
  private firstTokenTime: number = 0;
  private totalTokens: number = 0;
  private promptTokens: number = 0;
  private completionTokens: number = 0;

  start(): void {
    this.startTime = Date.now();
  }

  recordFirstToken(): void {
    if (this.firstTokenTime === 0 && this.startTime > 0) {
      this.firstTokenTime = Date.now();
    }
  }

  recordTokens(usage: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  }): void {
    if (usage.promptTokens !== undefined) {
      this.promptTokens = usage.promptTokens;
    }
    if (usage.completionTokens !== undefined) {
      this.completionTokens = usage.completionTokens;
    }
    if (usage.totalTokens !== undefined) {
      this.totalTokens = usage.totalTokens;
    } else if (usage.promptTokens !== undefined && usage.completionTokens !== undefined) {
      this.totalTokens = usage.promptTokens + usage.completionTokens;
    }
  }

  getMetrics(): ModelMetrics {
    const totalTime = Date.now() - this.startTime;
    const timeToFirstToken =
      this.firstTokenTime > 0 ? this.firstTokenTime - this.startTime : undefined;

    const tokensPerSecond =
      this.completionTokens > 0 && totalTime > 0
        ? (this.completionTokens / totalTime) * 1000
        : undefined;

    return {
      totalTime,
      timeToFirstToken,
      promptTokens: this.promptTokens || undefined,
      completionTokens: this.completionTokens || undefined,
      totalTokens: this.totalTokens || undefined,
      tokensPerSecond,
    };
  }

  reset(): void {
    this.startTime = 0;
    this.firstTokenTime = 0;
    this.totalTokens = 0;
    this.promptTokens = 0;
    this.completionTokens = 0;
  }
}

export class GlobalMetricsTracker {
  private metrics = new Map<string, ModelMetrics[]>();

  record(provider: string, model: string, metrics: ModelMetrics): void {
    const key = `${provider}>${model}`;
    const existing = this.metrics.get(key) || [];
    existing.push(metrics);
    this.metrics.set(key, existing);
  }

  getMetrics(
    provider?: string,
    model?: string,
  ): Map<string, ModelMetrics[]> | ModelMetrics[] | undefined {
    if (provider && model) {
      const key = `${provider}>${model}`;
      return this.metrics.get(key);
    }

    if (provider) {
      const result = new Map<string, ModelMetrics[]>();
      for (const [key, value] of this.metrics.entries()) {
        if (key.startsWith(`${provider}>`)) {
          result.set(key, value);
        }
      }
      return result;
    }

    return this.metrics;
  }

  getAverageMetrics(provider: string, model: string): ModelMetrics | undefined {
    const key = `${provider}>${model}`;
    const metrics = this.metrics.get(key);

    if (!metrics || metrics.length === 0) {
      return undefined;
    }

    const sum = metrics.reduce(
      (acc, m) => ({
        totalTime: acc.totalTime + m.totalTime,
        timeToFirstToken: (acc.timeToFirstToken || 0) + (m.timeToFirstToken || 0),
        promptTokens: (acc.promptTokens || 0) + (m.promptTokens || 0),
        completionTokens: (acc.completionTokens || 0) + (m.completionTokens || 0),
        totalTokens: (acc.totalTokens || 0) + (m.totalTokens || 0),
        tokensPerSecond: (acc.tokensPerSecond || 0) + (m.tokensPerSecond || 0),
      }),
      {
        totalTime: 0,
        timeToFirstToken: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        tokensPerSecond: 0,
      } as Required<ModelMetrics>,
    );

    const count = metrics.length;
    const ttftCount = metrics.filter((m) => m.timeToFirstToken !== undefined).length;
    const tpsCount = metrics.filter((m) => m.tokensPerSecond !== undefined).length;

    return {
      totalTime: Math.round(sum.totalTime / count),
      timeToFirstToken:
        ttftCount > 0 && sum.timeToFirstToken !== undefined
          ? Math.round(sum.timeToFirstToken / ttftCount)
          : undefined,
      promptTokens:
        sum.promptTokens !== undefined ? Math.round(sum.promptTokens / count) : undefined,
      completionTokens:
        sum.completionTokens !== undefined ? Math.round(sum.completionTokens / count) : undefined,
      totalTokens: sum.totalTokens !== undefined ? Math.round(sum.totalTokens / count) : undefined,
      tokensPerSecond:
        tpsCount > 0 && sum.tokensPerSecond !== undefined
          ? sum.tokensPerSecond / tpsCount
          : undefined,
    };
  }

  clear(provider?: string, model?: string): void {
    if (provider && model) {
      const key = `${provider}>${model}`;
      this.metrics.delete(key);
    } else if (provider) {
      const keysToDelete: string[] = [];
      for (const key of this.metrics.keys()) {
        if (key.startsWith(`${provider}>`)) {
          keysToDelete.push(key);
        }
      }
      for (const key of keysToDelete) {
        this.metrics.delete(key);
      }
    } else {
      this.metrics.clear();
    }
  }
}

export const globalMetricsTracker = new GlobalMetricsTracker();
