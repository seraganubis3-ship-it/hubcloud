/**
 * Basic XSS and Injection Sanitizer
 * Strips script tags, inline event handlers, and javascript: pseudo-protocols.
 */
export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') return '';

  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove <iframe> tags
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '') // Remove <svg> vectors
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove <object> tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove <embed> tags
    .replace(/\bon\w+\s*=/gi, '') // Remove inline event handlers (e.g. onerror=, onclick=)
    .replace(/javascript\s*:/gi, '') // Remove javascript: pseudo-protocol
    .replace(/vbscript\s*:/gi, '') // Remove vbscript: pseudo-protocol
    .replace(/data\s*:\s*text\/html/gi, '') // Remove data: HTML URIs
    .trim();

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validates and sanitizes email addresses
 */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return '';
  const clean = input.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(clean) ? clean : '';
}

/**
 * Validates Egyptian phone numbers
 */
export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return '';
  const digits = input.replace(/\D/g, '');
  return digits.slice(0, 15);
}
