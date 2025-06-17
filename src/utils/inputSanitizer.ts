
class InputSanitizer {
  /**
   * Sanitizes text input to prevent XSS attacks
   */
  static sanitizeText(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .substring(0, 1000); // Limit length
  }

  /**
   * Sanitizes email input
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return '';
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const sanitized = email.toLowerCase().trim();
    
    return emailRegex.test(sanitized) ? sanitized : '';
  }

  /**
   * Sanitizes phone number input
   */
  static sanitizePhone(phone: string): string {
    if (typeof phone !== 'string') return '';
    
    // Remove all non-digit characters except + at the beginning
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Ensure + is only at the beginning
    const sanitized = cleaned.replace(/\+/g, '').replace(/^/, cleaned.startsWith('+') ? '+' : '');
    
    return sanitized.substring(0, 20); // Limit length
  }

  /**
   * Sanitizes address input
   */
  static sanitizeAddress(address: string): string {
    if (typeof address !== 'string') return '';
    
    return address
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .substring(0, 500); // Limit length for addresses
  }

  /**
   * Sanitizes notes input
   */
  static sanitizeNotes(notes: string): string {
    if (typeof notes !== 'string') return '';
    
    return notes
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .substring(0, 2000); // Longer limit for notes
  }

  /**
   * Sanitizes numeric input with optional range validation
   */
  static sanitizeNumber(input: string | number, min?: number, max?: number): number {
    let num: number;
    
    if (typeof input === 'number') {
      num = input;
    } else if (typeof input === 'string') {
      num = parseFloat(input.replace(/[^\d.-]/g, ''));
    } else {
      throw new Error('Invalid input type for number sanitization');
    }
    
    if (!isFinite(num)) {
      throw new Error('Invalid number value');
    }
    
    if (min !== undefined && num < min) {
      throw new Error(`Number must be at least ${min}`);
    }
    
    if (max !== undefined && num > max) {
      throw new Error(`Number must be at most ${max}`);
    }
    
    return num;
  }

  /**
   * Sanitizes property data for booking forms
   */
  static sanitizePropertyData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    // Text fields
    const textFields = ['name', 'address', 'type', 'notes', 'special_instructions'];
    textFields.forEach(field => {
      if (data[field]) {
        sanitized[field] = this.sanitizeText(data[field]);
      }
    });

    // Numeric fields
    const numericFields = ['rooms', 'square_meters', 'windows', 'floors', 'bathrooms', 'bedrooms', 'estimated_duration'];
    numericFields.forEach(field => {
      if (data[field] !== undefined) {
        try {
          sanitized[field] = this.sanitizeNumber(data[field]);
        } catch (error) {
          // Skip invalid numeric values
        }
      }
    });

    // Boolean fields
    const booleanFields = ['has_pets', 'balcony', 'garden', 'parking', 'elevator'];
    booleanFields.forEach(field => {
      if (data[field] !== undefined) {
        sanitized[field] = Boolean(data[field]);
      }
    });

    return sanitized;
  }

  /**
   * Validates and sanitizes booking data
   */
  static sanitizeBookingData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    // Required text fields
    if (data.service_type) {
      sanitized.service_type = this.sanitizeText(data.service_type);
    }

    // Optional text fields
    const textFields = ['special_instructions', 'notes', 'employee_notes'];
    textFields.forEach(field => {
      if (data[field]) {
        sanitized[field] = this.sanitizeText(data[field]);
      }
    });

    // Numeric fields
    const numericFields = ['estimated_duration', 'estimated_price_min', 'estimated_price_max', 'actual_duration'];
    numericFields.forEach(field => {
      if (data[field] !== undefined) {
        try {
          sanitized[field] = this.sanitizeNumber(data[field]);
        } catch (error) {
          // Skip invalid numeric values
        }
      }
    });

    // Date/time fields - ensure they are valid ISO strings
    const dateFields = ['scheduled_date', 'start_time', 'end_time'];
    dateFields.forEach(field => {
      if (data[field]) {
        const date = new Date(data[field]);
        if (!isNaN(date.getTime())) {
          sanitized[field] = date.toISOString();
        }
      }
    });

    // Time field for scheduled_time
    if (data.scheduled_time) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (timeRegex.test(data.scheduled_time)) {
        sanitized.scheduled_time = data.scheduled_time;
      }
    }

    // Status field - whitelist allowed values
    if (data.status) {
      const allowedStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
      if (allowedStatuses.includes(data.status)) {
        sanitized.status = data.status;
      }
    }

    return sanitized;
  }
}

export { InputSanitizer };
