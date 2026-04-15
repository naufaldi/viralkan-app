-- Migration: Add rate limiting table
-- Date: 2026-04-15
-- Description: Tracks per-user request counts per action type for rate limiting

BEGIN;

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('report_creation', 'image_upload', 'api_request')),
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT rate_limit_user_action_window_unique UNIQUE (user_id, action, window_start)
);

-- Index for fast per-user per-action lookups
CREATE INDEX IF NOT EXISTS rate_limit_user_action_window_idx
  ON rate_limit_buckets (user_id, action, window_start DESC);

-- Partial index for active windows (last 24h)
CREATE INDEX IF NOT EXISTS rate_limit_active_idx
  ON rate_limit_buckets (user_id, action, count)
  WHERE window_start > (now() - INTERVAL '24 hours');

COMMIT;
