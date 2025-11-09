export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export type LogData = unknown;

export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  timestamp?: boolean;
  colors?: boolean;
  writer?: (message: string, level: LogLevel) => void;
}

export class Logger {
  private level: LogLevel;
  private options: LoggerOptions;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.options = {
      timestamp: true,
      colors: true,
      ...options,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(level: LogLevel, message: string, data?: LogData): string {
    const parts: string[] = [];

    if (this.options.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    if (this.options.prefix) {
      parts.push(`[${this.options.prefix}]`);
    }

    const levelName = LogLevel[level];
    if (this.options.colors && typeof process !== 'undefined' && process.stdout?.isTTY) {
      parts.push(this.colorize(levelName, level));
    } else {
      parts.push(`[${levelName}]`);
    }

    parts.push(message);

    if (data !== undefined) {
      if (typeof data === 'object') {
        parts.push(JSON.stringify(data, null, 2));
      } else {
        parts.push(String(data));
      }
    }

    return parts.join(' ');
  }

  private colorize(text: string, level: LogLevel): string {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };

    const color = colors[level];
    const reset = '\x1b[0m';

    return `${color}[${text}]${reset}`;
  }

  private log(level: LogLevel, message: string, data?: LogData): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formatted = this.formatMessage(level, message, data);

    if (this.options.writer) {
      this.options.writer(formatted, level);
    } else {
      switch (level) {
        case LogLevel.ERROR:
          console.error(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
        default:
          console.log(formatted);
      }
    }
  }

  debug(message: string, data?: LogData): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: LogData): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: LogData): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: LogData): void {
    this.log(LogLevel.ERROR, message, data);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  child(prefix: string): Logger {
    const childPrefix = this.options.prefix ? `${this.options.prefix}:${prefix}` : prefix;

    return new Logger({
      ...this.options,
      prefix: childPrefix,
      level: this.level,
    });
  }
}

// Global logger instance
export const logger = new Logger({
  prefix: 'ai-hub',
  level: LogLevel.INFO,
});
