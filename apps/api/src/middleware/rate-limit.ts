import type { Context, Next } from "hono";
import { sql } from "../db/connection";

type RateLimitAction = "report_creation" | "image_upload" | "api_request";

const ACTION_LIMITS: Record<
  RateLimitAction,
  { maxRequests: number; windowHours: number }
> = {
  report_creation: { maxRequests: 10, windowHours: 24 },
  image_upload: { maxRequests: 20, windowHours: 1 },
  api_request: { maxRequests: 1000, windowHours: 1 },
};

const getWindowStart = (windowHours: number): Date => {
  const now = new Date();
  if (windowHours >= 24) {
    now.setHours(0, 0, 0, 0);
  } else {
    now.setMinutes(0, 0, 0);
  }
  return now;
};

/**
 * Creates a rate-limiting middleware for a specific action.
 * Uses PostgreSQL for persistence across restarts and horizontal scaling.
 * Only applies to authenticated users (unauthenticated requests pass through).
 * API Layer — apply per-route in the relevant router.
 */
export const rateLimit = (action: RateLimitAction) => {
  return async (c: Context, next: Next) => {
    const userId = c.get("user_id") as string | undefined;

    // Rate limiting only applies to authenticated users
    if (!userId) {
      await next();
      return;
    }

    const { maxRequests, windowHours } = ACTION_LIMITS[action];
    const windowStart = getWindowStart(windowHours);

    // Count requests in the current window
    const rows = await sql<{ total: string }[]>`
      SELECT COALESCE(SUM(count), 0)::text AS total
      FROM rate_limit_buckets
      WHERE user_id = ${userId}
        AND action = ${action}
        AND window_start >= ${windowStart.toISOString()}
    `;

    const currentCount = parseInt(rows[0]?.total ?? "0");
    const windowResetMs = windowStart.getTime() + windowHours * 3600 * 1000;

    if (currentCount >= maxRequests) {
      c.header("Retry-After", String(windowHours * 3600));
      c.header("X-RateLimit-Limit", String(maxRequests));
      c.header("X-RateLimit-Remaining", "0");
      c.header("X-RateLimit-Reset", String(windowResetMs));
      return c.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowHours} hours.`,
          },
        },
        429,
      );
    }

    // Upsert bucket: increment count for existing window, insert new otherwise
    await sql`
      INSERT INTO rate_limit_buckets (user_id, action, window_start, count)
      VALUES (${userId}, ${action}, ${windowStart.toISOString()}, 1)
      ON CONFLICT ON CONSTRAINT rate_limit_user_action_window_unique
        DO UPDATE SET
          count = rate_limit_buckets.count + 1,
          updated_at = now()
    `;

    c.header("X-RateLimit-Limit", String(maxRequests));
    c.header("X-RateLimit-Remaining", String(maxRequests - currentCount - 1));
    c.header("X-RateLimit-Reset", String(windowResetMs));

    await next();
  };
};
