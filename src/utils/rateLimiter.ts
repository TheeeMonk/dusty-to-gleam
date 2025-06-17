
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private requests: Map<string, RateLimitEntry> = new Map();
  
  // Rate limit configuration
  private readonly limits = {
    api: { requests: 100, windowMs: 60000 }, // 100 requests per minute
    auth: { requests: 5, windowMs: 300000 }, // 5 auth attempts per 5 minutes
    form: { requests: 10, windowMs: 60000 }, // 10 form submissions per minute
  };

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  private getKey(identifier: string, type: string): string {
    return `${type}:${identifier}`;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Static method for easier usage - checks rate limit with custom parameters
   */
  static check(identifier: string, maxRequests: number, windowMs: number): boolean {
    const instance = RateLimiter.getInstance();
    instance.cleanup();
    
    const key = `custom:${identifier}`;
    const now = Date.now();
    
    const entry = instance.requests.get(key);
    
    if (!entry) {
      // First request
      instance.requests.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }
    
    if (now > entry.resetTime) {
      // Window has expired, reset
      instance.requests.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }
    
    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      return false;
    }
    
    // Increment counter
    entry.count++;
    return true;
  }

  checkLimit(identifier: string, type: keyof typeof this.limits): boolean {
    this.cleanup();
    
    const limit = this.limits[type];
    const key = this.getKey(identifier, type);
    const now = Date.now();
    
    const entry = this.requests.get(key);
    
    if (!entry) {
      // First request
      this.requests.set(key, {
        count: 1,
        resetTime: now + limit.windowMs
      });
      return true;
    }
    
    if (now > entry.resetTime) {
      // Window has expired, reset
      this.requests.set(key, {
        count: 1,
        resetTime: now + limit.windowMs
      });
      return true;
    }
    
    if (entry.count >= limit.requests) {
      // Rate limit exceeded
      return false;
    }
    
    // Increment counter
    entry.count++;
    return true;
  }

  getRemainingRequests(identifier: string, type: keyof typeof this.limits): number {
    const limit = this.limits[type];
    const key = this.getKey(identifier, type);
    const entry = this.requests.get(key);
    
    if (!entry || Date.now() > entry.resetTime) {
      return limit.requests;
    }
    
    return Math.max(0, limit.requests - entry.count);
  }

  getResetTime(identifier: string, type: keyof typeof this.limits): number {
    const key = this.getKey(identifier, type);
    const entry = this.requests.get(key);
    
    if (!entry || Date.now() > entry.resetTime) {
      return 0;
    }
    
    return entry.resetTime;
  }
}

export { RateLimiter };
