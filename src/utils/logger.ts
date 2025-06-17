export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  
  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.sanitizeContext(context)
    };
  }

  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;
    
    const sanitized = { ...context };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry = this.formatMessage(level, message, context);
    
    // Only log to console in development
    if (this.isDevelopment) {
      console[level === 'debug' ? 'log' : level](entry.message, entry.context || '');
    }
    
    // In production, we would send to a logging service here
    // For now, we'll store critical errors locally for debugging
    if (level === 'error' && !this.isDevelopment) {
      this.storeErrorLocally(entry);
    }
  }

  private storeErrorLocally(entry: LogEntry) {
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(entry);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      // Silent fail if localStorage is not available
    }
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }
}

export const logger = new Logger();
