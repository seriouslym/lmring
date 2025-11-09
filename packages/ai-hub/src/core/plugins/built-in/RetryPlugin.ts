import { AiPlugin, type PluginContext } from '../../../types/plugin';

export interface RetryPluginOptions {
  maxAttempts?: number;
  backoff?: 'linear' | 'exponential' | 'fixed';
  initialDelay?: number;
  maxDelay?: number;
  retryableErrors?: string[] | RegExp[];
  onRetry?: (attempt: number, error: Error, context: PluginContext) => void;
}

export class RetryPlugin extends AiPlugin {
  name = 'retry';
  description = 'Handles automatic retries with configurable backoff strategies';

  private options: RetryPluginOptions;

  constructor(options: RetryPluginOptions = {}) {
    super();
    this.options = {
      maxAttempts: 3,
      backoff: 'exponential',
      initialDelay: 1000,
      maxDelay: 30000,
      ...options,
    };
  }

  async onError(error: Error, context: PluginContext): Promise<void> {
    // Track attempts per-request using context metadata
    const currentAttempt = (context.metadata.retryAttempt as number) || 0;

    // Check if error is retryable
    if (!this.isRetryable(error)) {
      delete context.metadata.retryAttempt;
      return;
    }

    // Check if max attempts reached
    const maxAttempts = this.options.maxAttempts ?? 3;
    if (currentAttempt >= maxAttempts - 1) {
      delete context.metadata.retryAttempt;
      return;
    }

    // Calculate delay
    const delay = this.calculateDelay(currentAttempt);

    // Update attempt count in context metadata
    context.metadata.retryAttempt = currentAttempt + 1;
    context.attempt = currentAttempt + 1;

    // Call retry handler if provided
    if (this.options.onRetry) {
      this.options.onRetry(currentAttempt + 1, error, context);
    }

    // Wait before retrying
    await this.sleep(delay);

    // Note: Actual retry needs to be implemented at a higher level
    // This plugin can only delay and track attempts
  }

  private isRetryable(error: Error): boolean {
    if (!this.options.retryableErrors || this.options.retryableErrors.length === 0) {
      // Default retryable errors
      const defaultRetryablePatterns = [
        'rate limit',
        'timeout',
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        '429',
        '503',
        '504',
      ];

      return defaultRetryablePatterns.some((pattern) =>
        error.message.toLowerCase().includes(pattern.toLowerCase()),
      );
    }

    // Check custom retryable errors
    return this.options.retryableErrors.some((pattern) => {
      if (pattern instanceof RegExp) {
        return pattern.test(error.message);
      }
      return error.message.includes(pattern);
    });
  }

  private calculateDelay(attempt: number): number {
    const { backoff } = this.options;
    const initialDelay = this.options.initialDelay ?? 1000;
    const maxDelay = this.options.maxDelay ?? 30000;
    let delay: number;

    switch (backoff) {
      case 'linear':
        delay = initialDelay * (attempt + 1);
        break;

      case 'exponential':
        delay = initialDelay * 2 ** attempt;
        break;
      default:
        delay = initialDelay;
        break;
    }

    // Add jitter (±10%) to prevent thundering herd
    const jitter = delay * 0.1;
    delay = delay + (Math.random() * 2 - 1) * jitter;

    // Cap at max delay
    return Math.min(delay, maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Reset is now a no-op since attempts are tracked per-request in context
  reset(): void {
    // No global state to clear
  }

  getAttemptCount(context: PluginContext): number {
    // Return attempt count from context metadata
    return (context.metadata.retryAttempt as number) || 0;
  }
}
