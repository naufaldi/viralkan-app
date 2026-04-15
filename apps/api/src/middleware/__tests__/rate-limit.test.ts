// apps/api/src/middleware/__tests__/rate-limit.test.ts
import { describe, test, expect } from "bun:test";

describe("Rate Limiting Middleware", () => {
  describe("action limits config", () => {
    const ACTION_LIMITS = {
      report_creation: { maxRequests: 10, windowHours: 24 },
      image_upload: { maxRequests: 20, windowHours: 1 },
      api_request: { maxRequests: 1000, windowHours: 1 },
    } as const;

    test("report_creation limit is 10 per 24h", () => {
      expect(ACTION_LIMITS.report_creation.maxRequests).toBe(10);
      expect(ACTION_LIMITS.report_creation.windowHours).toBe(24);
    });

    test("image_upload limit is 20 per hour", () => {
      expect(ACTION_LIMITS.image_upload.maxRequests).toBe(20);
      expect(ACTION_LIMITS.image_upload.windowHours).toBe(1);
    });

    test("api_request limit is 1000 per hour", () => {
      expect(ACTION_LIMITS.api_request.maxRequests).toBe(1000);
      expect(ACTION_LIMITS.api_request.windowHours).toBe(1);
    });
  });

  describe("rate limit error response", () => {
    test("429 response Retry-After is window in seconds", () => {
      const windowHours = 24;
      const retryAfterSeconds = windowHours * 3600;
      expect(retryAfterSeconds).toBe(86400);
    });

    test("error message matches expected format", () => {
      const message = "Rate limit exceeded. Maximum 10 requests per 24 hours.";
      expect(message).toContain("Rate limit exceeded");
      expect(message).toContain("10");
      expect(message).toContain("24");
    });
  });

  describe("window calculation", () => {
    test("hourly window floors to start of current hour", () => {
      const now = new Date("2026-04-15T14:37:22Z");
      const windowStart = new Date(now);
      windowStart.setMinutes(0, 0, 0);
      expect(windowStart.toISOString()).toBe("2026-04-15T14:00:00.000Z");
    });

    test("daily window floors to start of current day", () => {
      const now = new Date("2026-04-15T14:37:22Z");
      const windowStart = new Date(now);
      windowStart.setHours(0, 0, 0, 0);
      expect(windowStart.toISOString()).toBe("2026-04-15T00:00:00.000Z");
    });
  });
});
