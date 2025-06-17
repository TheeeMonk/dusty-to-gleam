
export class InputSanitizer {
  static sanitizeText(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  }

  static sanitizePhone(phone: string): string {
    if (typeof phone !== 'string') return '';
    
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Basic phone validation (allow international format)
    if (cleaned.length < 8 || cleaned.length > 15) {
      throw new Error('Invalid phone number format');
    }
    
    return cleaned;
  }

  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return '';
    
    const trimmed = email.trim().toLowerCase();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      throw new Error('Invalid email format');
    }
    
    return trimmed;
  }

  static sanitizeAddress(address: string): string {
    if (typeof address !== 'string') return '';
    
    return address
      .trim()
      .replace(/[<>]/g, '')
      .substring(0, 500);
  }

  static sanitizeNotes(notes: string): string {
    if (typeof notes !== 'string') return '';
    
    return notes
      .trim()
      .replace(/[<>]/g, '')
      .substring(0, 2000);
  }

  static sanitizeNumber(value: any, min?: number, max?: number): number {
    const num = parseInt(value);
    
    if (isNaN(num)) {
      throw new Error('Invalid number format');
    }
    
    if (min !== undefined && num < min) {
      throw new Error(`Number must be at least ${min}`);
    }
    
    if (max !== undefined && num > max) {
      throw new Error(`Number must be at most ${max}`);
    }
    
    return num;
  }
}
