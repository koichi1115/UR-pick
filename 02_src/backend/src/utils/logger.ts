import { config } from '../config/index.js';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Log entry structure
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  environment: string;
  data?: unknown;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Logger class for structured logging
 */
class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = config.server.nodeEnv === 'development';
  }

  /**
   * Format log entry
   */
  private formatLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: config.server.nodeEnv,
    };

    if (data) {
      if (data instanceof Error) {
        entry.error = {
          name: data.name,
          message: data.message,
          stack: this.isDevelopment ? data.stack : undefined,
        };
      } else {
        entry.data = data;
      }
    }

    return entry;
  }

  /**
   * Output log entry
   */
  private output(entry: LogEntry): void {
    if (this.isDevelopment) {
      // Pretty print in development
      const emoji = {
        debug: '🐛',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      }[entry.level];

      console.log(
        `${emoji} [${entry.level.toUpperCase()}] ${entry.message}`,
        entry.data || entry.error || ''
      );
    } else {
      // JSON format in production
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Debug log
   */
  debug(message: string, data?: unknown): void {
    this.output(this.formatLogEntry(LogLevel.DEBUG, message, data));
  }

  /**
   * Info log
   */
  info(message: string, data?: unknown): void {
    this.output(this.formatLogEntry(LogLevel.INFO, message, data));
  }

  /**
   * Warning log
   */
  warn(message: string, data?: unknown): void {
    this.output(this.formatLogEntry(LogLevel.WARN, message, data));
  }

  /**
   * Error log
   */
  error(message: string, error?: Error | unknown): void {
    this.output(this.formatLogEntry(LogLevel.ERROR, message, error));
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();
