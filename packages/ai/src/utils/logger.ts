/**
 * Simple Logger
 *
 * Basic logging utility for the Arena project
 */

import type { LanguageModelMiddleware } from 'ai';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /** Minimum log level to output */
  level: LogLevel;
  /** Whether to include timestamps */
  timestamps: boolean;
  /** Custom log handler */
  handler?: (level: LogLevel, message: string, data?: unknown) => void;
}

/**
 * Simple Logger class
 */
export class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level ?? LogLevel.INFO,
      timestamps: config.timestamps ?? true,
      handler: config.handler,
    };
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Enable/disable timestamps
   */
  setTimestamps(enabled: boolean): void {
    this.config.timestamps = enabled;
  }

  /**
   * Format log message
   */
  private format(level: string, message: string): string {
    if (this.config.timestamps) {
      const timestamp = new Date().toISOString();
      return `[${timestamp}] [${level}] ${message}`;
    }
    return `[${level}] ${message}`;
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, levelName: string, message: string, data?: unknown): void {
    if (level < this.config.level) {
      return;
    }

    const formatted = this.format(levelName, message);

    if (this.config.handler) {
      this.config.handler(level, formatted, data);
      return;
    }

    // Default console output
    const logFn =
      level === LogLevel.ERROR
        ? console.error
        : level === LogLevel.WARN
          ? console.warn
          : level === LogLevel.DEBUG
            ? console.debug
            : console.log;

    if (data !== undefined) {
      logFn(formatted, data);
    } else {
      logFn(formatted);
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, 'INFO', message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, 'WARN', message, data);
  }

  /**
   * Log error message
   */
  error(message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, 'ERROR', message, data);
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger();

/**
 * Create a logging middleware
 *
 * @param customLogger - Optional custom logger instance
 * @returns Language model middleware
 *
 * @example
 * ```typescript
 * const middleware = createLoggingMiddleware();
 * const model = wrapLanguageModel({
 *   model: openai('gpt-4'),
 *   middleware
 * });
 * ```
 */
export function createLoggingMiddleware(customLogger?: Logger): LanguageModelMiddleware {
  const log = customLogger || logger;

  return {
    // biome-ignore lint/suspicious/noExplicitAny: Middleware function parameters are not strongly typed in AI SDK
    wrapGenerate: async ({ doGenerate, params, model }: any) => {
      log.info('AI Request started (generate)', {
        provider: model.provider,
        modelId: model.modelId,
        messages: params.prompt?.length || 0,
      });

      try {
        const result = await doGenerate();

        log.info('AI Request completed (generate)', {
          text: result.text?.substring(0, 100) || '',
          usage: result.usage,
        });

        return result;
      } catch (error) {
        log.error('AI Request failed (generate)', {
          error: (error as Error).message,
          stack: (error as Error).stack,
        });
        throw error;
      }
    },

    // biome-ignore lint/suspicious/noExplicitAny: Middleware function parameters are not strongly typed in AI SDK
    wrapStream: async ({ doStream, params, model }: any) => {
      log.info('AI Request started (stream)', {
        provider: model.provider,
        modelId: model.modelId,
        messages: params.prompt?.length || 0,
      });

      try {
        const result = await doStream();

        log.info('AI Stream initiated', {
          hasStream: true,
        });

        return result;
      } catch (error) {
        log.error('AI Request failed (stream)', {
          error: (error as Error).message,
          stack: (error as Error).stack,
        });
        throw error;
      }
    },
  };
}
