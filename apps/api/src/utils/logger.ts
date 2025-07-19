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
    console.error(this.formatMessage("error", message, meta));
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage("warn", message, meta));
  }

  info(message: string, meta?: any): void {
    console.info(this.formatMessage("info", message, meta));
  }

  debug(message: string, meta?: any): void {
    console.debug(this.formatMessage("debug", message, meta));
  }
}

export const logger = new Logger();
