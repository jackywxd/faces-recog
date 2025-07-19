import { config } from "../config";

interface LogLevel {
  error: 0;
  warn: 1;
  info: 2;
  debug: 3;
}

const LOG_LEVELS: LogLevel = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLogLevel =
  LOG_LEVELS[config.logging.level as keyof LogLevel] ?? LOG_LEVELS.info;

class Logger {
  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (meta && Object.keys(meta).length > 0) {
      return `${baseMessage} ${JSON.stringify(meta)}`;
    }

    return baseMessage;
  }

  error(message: string, meta?: any): void {
    if (currentLogLevel >= LOG_LEVELS.error) {
      console.error(this.formatMessage("error", message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (currentLogLevel >= LOG_LEVELS.warn) {
      console.warn(this.formatMessage("warn", message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (currentLogLevel >= LOG_LEVELS.info) {
      console.info(this.formatMessage("info", message, meta));
    }
  }

  debug(message: string, meta?: any): void {
    if (currentLogLevel >= LOG_LEVELS.debug) {
      console.debug(this.formatMessage("debug", message, meta));
    }
  }
}

export const logger = new Logger();
