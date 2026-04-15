import type { Context, Next } from "hono";

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://viral-api.faldi.xyz",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-XSS-Protection": "1; mode=block",
  "Content-Security-Policy": CSP,
} as const;

/**
 * Security headers middleware
 * Adds OWASP-recommended response headers to every API response.
 * API Layer — registered globally in src/index.ts after CORS.
 */
export const securityHeaders = async (c: Context, next: Next) => {
  await next();
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    c.header(header, value);
  }
};
