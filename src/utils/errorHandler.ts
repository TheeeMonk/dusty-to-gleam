
interface AppError {
  code: string;
  message: string;
  statusCode: number;
  context?: Record<string, any>;
}

class ErrorHandler {
  static handle(error: unknown, context?: Record<string, any>): AppError {
    // Default error response that doesn't leak sensitive information
    const defaultError: AppError = {
      code: 'INTERNAL_ERROR',
      message: 'En feil oppstod. Prøv igjen senere.',
      statusCode: 500,
      context: context ? this.sanitizeContext(context) : undefined
    };

    if (!error) return defaultError;

    // Handle Supabase errors
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const supabaseError = error as any;
      
      switch (supabaseError.code) {
        case 'PGRST116':
          return {
            code: 'NOT_FOUND',
            message: 'Ressursen ble ikke funnet',
            statusCode: 404,
            context: this.sanitizeContext(context)
          };
        case '23505':
          return {
            code: 'DUPLICATE_ENTRY',
            message: 'Dataene eksisterer allerede',
            statusCode: 409,
            context: this.sanitizeContext(context)
          };
        case '42501':
          return {
            code: 'PERMISSION_DENIED',
            message: 'Du har ikke tilgang til denne ressursen',
            statusCode: 403,
            context: this.sanitizeContext(context)
          };
        default:
          // Don't expose internal error details in production
          return {
            code: 'DATABASE_ERROR',
            message: 'En database-feil oppstod',
            statusCode: 500,
            context: this.sanitizeContext(context)
          };
      }
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Nettverksfeil. Sjekk internettforbindelsen din.',
        statusCode: 0,
        context: this.sanitizeContext(context)
      };
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
      // In development, provide more details
      if (import.meta.env.DEV) {
        return {
          code: 'JAVASCRIPT_ERROR',
          message: error.message || 'En uventet feil oppstod',
          statusCode: 500,
          context: this.sanitizeContext(context)
        };
      }
      
      // In production, use generic message
      return defaultError;
    }

    return defaultError;
  }

  static getDisplayMessage(error: AppError): string {
    return error.message;
  }

  private static sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;

    const sensitiveKeys = ['password', 'token', 'api_key', 'secret', 'auth', 'session', 'user_id'];
    const sanitized = { ...context };

    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

export { ErrorHandler };
export type { AppError };
