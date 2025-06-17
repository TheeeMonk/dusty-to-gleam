
import { logger } from './logger';

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  context?: Record<string, any>;
}

export class ErrorHandler {
  static handle(error: any, context?: Record<string, any>): AppError {
    const appError: AppError = {
      message: 'An unexpected error occurred',
      context
    };

    if (error?.message) {
      // Sanitize error messages to avoid exposing sensitive information
      if (this.isSafeErrorMessage(error.message)) {
        appError.message = error.message;
      }
    }

    if (error?.code) {
      appError.code = error.code;
    }

    if (error?.status || error?.statusCode) {
      appError.statusCode = error.status || error.statusCode;
    }

    // Log the full error for debugging (will be sanitized by logger)
    logger.error('Application error occurred', {
      originalError: error,
      sanitizedError: appError,
      ...context
    });

    return appError;
  }

  private static isSafeErrorMessage(message: string): boolean {
    const unsafePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /key/i,
      /database/i,
      /internal/i,
      /server/i,
      /connection/i
    ];

    return !unsafePatterns.some(pattern => pattern.test(message));
  }

  static getDisplayMessage(error: AppError): string {
    // Return user-friendly messages based on error codes
    switch (error.code) {
      case 'PGRST116':
        return 'You do not have permission to perform this action.';
      case 'PGRST301':
        return 'The requested resource was not found.';
      case '23505':
        return 'This record already exists.';
      case '23503':
        return 'Cannot delete this record as it is referenced by other data.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }
}
