// In-memory rate limiter and request validator for /api/chat

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((value, key) => {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

/**
 * Checks if an IP or identifier has exceeded the request quota
 * @param identifier Client IP or User ID
 * @param limit Max allowed requests within window (default 30)
 * @param windowMs Window duration in milliseconds (default 60 seconds)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 30,
  windowMs: number = 60 * 1000
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, reset: record.resetTime };
}

/**
 * Sanitizes and validates user input string
 */
export function validateAndSanitizeInput(text: unknown): { isValid: boolean; sanitized: string; error?: string } {
  if (typeof text !== 'string') {
    return { isValid: false, sanitized: '', error: 'Input must be a valid text string.' };
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { isValid: false, sanitized: '', error: 'Question cannot be empty.' };
  }

  if (trimmed.length > 2000) {
    return { isValid: false, sanitized: '', error: 'Question is too long (maximum 2,000 characters).' };
  }

  // Remove potential dangerous characters while preserving normal punctuation and language scripts
  const sanitized = trimmed
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .slice(0, 2000);

  return { isValid: true, sanitized };
}
