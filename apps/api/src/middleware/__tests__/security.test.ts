// apps/api/src/middleware/__tests__/security.test.ts
import { describe, test, expect } from "bun:test";
import { Hono } from "hono";
import { securityHeaders } from "../security";

describe("Security Headers Middleware", () => {
  test("adds security headers with the canonical API origin", async () => {
    const app = new Hono();
    app.use("*", securityHeaders);
    app.get("/", (c) => c.text("ok"));

    const response = await app.request("/");
    const csp = response.headers.get("Content-Security-Policy");

    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(response.headers.get("Strict-Transport-Security")).toContain(
      "max-age=31536000",
    );
    expect(csp).toContain("connect-src 'self' https://viral-api.naufaldi.com");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("unsafe-eval");
  });
});
