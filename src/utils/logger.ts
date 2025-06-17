
interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

// Only log errors and warnings in production
const isProduction = import.meta.env.PROD;
const allowedLevels = isProduction 
  ? [LOG_LEVELS.ERROR, LOG_LEVELS.WARN] 
  : [LOG_LEVELS.ERROR, LOG_LEVELS.WARN, LOG_LEVELS.INFO, LOG_LEVELS.DEBUG];

class Logger {
  private shouldLog(level: string): boolean {
    return allowedLevels.includes(level as any);
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    // Remove sensitive information from logs
    const sensitiveKeys = ['password', 'token', 'api_key', 'secret', 'auth', 'session'];
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      for (const key of sensitiveKeys) {
        if (key in sanitized) {
          sanitized[key] = '[REDACTED]';
        }
      }
      return sanitized;
    }
    
    return data;
  }

  error(message: string, data?: any) {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      console.error(`[ERROR] ${message}`, this.sanitizeData(data));
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      console.warn(`[WARN] ${message}`, this.sanitizeData(data));
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.info(`[INFO] ${message}`, this.sanitizeData(data));
    }
  }

  debug(message: string, data?: any) {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.debug(`[DEBUG] ${message}`, this.sanitizeData(data));
    }
  }
}

export const logger = new Logger();
