import { AiPlugin, type PluginContext } from '../../../types/plugin';

export type PluginLogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogData {
  [key: string]: unknown;
}

export interface AiParams {
  apiKey?: string;
  messages?: Array<{ content: string; [key: string]: unknown }>;
  prompt?: string;
  [key: string]: unknown;
}

export interface AiResult {
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  [key: string]: unknown;
}

export interface LoggingOptions {
  level?: PluginLogLevel;
  logParams?: boolean;
  logResults?: boolean;
  logErrors?: boolean;
  logMetrics?: boolean;
  formatter?: (level: PluginLogLevel, message: string, data?: LogData) => string;
  writer?: (message: string) => void;
}

export class LoggingPlugin extends AiPlugin {
  name = 'logging';
  description = 'Logs AI requests and responses';

  private level: PluginLogLevel;
  private options: LoggingOptions;

  constructor(options: LoggingOptions = {}) {
    super();
    this.level = options.level || 'info';
    this.options = {
      logParams: true,
      logResults: true,
      logErrors: true,
      logMetrics: true,
      ...options,
    };
  }

  private shouldLog(level: PluginLogLevel): boolean {
    const levels: PluginLogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(this.level);
    const targetIndex = levels.indexOf(level);
    return targetIndex >= currentIndex;
  }

  private log(level: PluginLogLevel, message: string, data?: LogData): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const formatted = this.options.formatter
      ? this.options.formatter(level, message, data)
      : `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (this.options.writer) {
      this.options.writer(formatted);
    } else {
      switch (level) {
        case 'error':
          console.error(formatted, data || '');
          break;
        case 'warn':
          console.warn(formatted, data || '');
          break;
        case 'debug':
          console.debug(formatted, data || '');
          break;
        default:
          console.log(formatted, data || '');
      }
    }
  }

  async onRequestStart(context: PluginContext): Promise<void> {
    this.log('info', `AI Request started`, {
      provider: context.providerId,
      model: context.modelId,
      method: context.method,
      attempt: context.attempt,
    });
  }

  async transformParams(params: AiParams, context: PluginContext): Promise<AiParams> {
    if (this.options.logParams) {
      this.log('debug', 'Request parameters', {
        provider: context.providerId,
        model: context.modelId,
        params: this.sanitizeParams(params),
      });
    }
    return params;
  }

  async transformResult(result: AiResult, context: PluginContext): Promise<AiResult> {
    if (this.options.logResults) {
      this.log('debug', 'Response received', {
        provider: context.providerId,
        model: context.modelId,
        hasResult: !!result,
        resultType: typeof result,
      });
    }
    return result;
  }

  async onRequestEnd(context: PluginContext, result: AiResult): Promise<void> {
    this.log('info', `AI Request completed`, {
      provider: context.providerId,
      model: context.modelId,
      method: context.method,
      metadata: context.metadata,
    });

    // Log metrics if available
    if (this.options.logMetrics && result?.usage) {
      this.log('info', 'Token usage', {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      });
    }
  }

  async onError(error: Error, context: PluginContext): Promise<void> {
    if (this.options.logErrors) {
      this.log('error', `AI Request failed`, {
        provider: context.providerId,
        model: context.modelId,
        method: context.method,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      });
    }
  }

  private sanitizeParams(params: AiParams): AiParams {
    if (!params) return params;

    const sanitized = { ...params };

    // Hide sensitive information
    if (sanitized.apiKey) {
      sanitized.apiKey = '***';
    }

    // Truncate long messages
    if (sanitized.messages && Array.isArray(sanitized.messages)) {
      sanitized.messages = sanitized.messages.map((msg) => ({
        ...msg,
        content: this.truncate(msg.content, 200),
      }));
    }

    if (sanitized.prompt) {
      sanitized.prompt = this.truncate(sanitized.prompt, 200);
    }

    return sanitized;
  }

  private truncate(str: string, maxLength: number): string {
    if (!str || str.length <= maxLength) return str;
    return `${str.substring(0, maxLength)}...`;
  }
}
