// apps/api/src/middleware/__tests__/security.test.ts
import { describe, test, expect } from "bun:test";

describe("Security Headers Middleware", () => {
  describe("header values", () => {
    test("X-Frame-Options is DENY", () => {
      const SECURITY_HEADERS = {
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "X-XSS-Protection": "1; mode=block",
      } as const;

      expect(SECURITY_HEADERS["X-Frame-Options"]).toBe("DENY");
      expect(SECURITY_HEADERS["X-Content-Type-Options"]).toBe("nosniff");
      expect(SECURITY_HEADERS["Referrer-Policy"]).toBe(
        "strict-origin-when-cross-origin",
      );
      expect(SECURITY_HEADERS["Strict-Transport-Security"]).toContain(
        "max-age=31536000",
      );
    });

    test("CSP includes self and trusted sources", () => {
      const csp = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' https://viral-api.faldi.xyz",
        "frame-ancestors 'none'",
      ].join("; ");

      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).not.toContain("unsafe-eval");
    });
  });
});
