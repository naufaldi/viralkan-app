-- Migration: 009_add_social_media_sharing.sql
-- Adds social media sharing functionality with share count tracking and analytics
-- Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6

-- Add share_count column to existing reports table
-- Default value 0 for backward compatibility
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- Create shares table for tracking individual share events
-- Supports analytics and detailed tracking per platform
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    report_id UUID NOT NULL REFERENCES reports (id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (
        platform IN (
            'whatsapp',
            'twitter',
            'facebook',
            'instagram',
            'telegram'
        )
    ),
    user_id UUID REFERENCES users (id) ON DELETE SET NULL, -- Optional for anonymous shares
    shared_at TIMESTAMPTZ DEFAULT now(),
    ip_address INET, -- For rate limiting and analytics (anonymized)
    user_agent TEXT -- For analytics and bot detection
);

-- Performance indexes for share_count queries
-- Index for sorting reports by popularity (share count)
CREATE INDEX IF NOT EXISTS reports_share_count_idx ON reports (share_count DESC);

-- Composite index for filtering by status and sorting by share count
CREATE INDEX IF NOT EXISTS reports_status_share_count_idx ON reports (status, share_count DESC)
WHERE
    status = 'verified';

-- Analytics and performance indexes for shares table
-- Primary lookup index for report shares
CREATE INDEX IF NOT EXISTS shares_report_id_idx ON shares (report_id);

-- Platform analytics index
CREATE INDEX IF NOT EXISTS shares_platform_idx ON shares (platform);

-- Time-based analytics index (most recent first)
CREATE INDEX IF NOT EXISTS shares_shared_at_idx ON shares (shared_at DESC);

-- User activity tracking index (when user_id is present)
CREATE INDEX IF NOT EXISTS shares_user_id_idx ON shares (user_id)
WHERE
    user_id IS NOT NULL;

-- Composite index for platform analytics over time
CREATE INDEX IF NOT EXISTS shares_platform_time_idx ON shares (platform, shared_at DESC);

-- Composite index for report-specific platform breakdown
CREATE INDEX IF NOT EXISTS shares_report_platform_idx ON shares (report_id, platform);

-- IP-based rate limiting index (for spam prevention)
CREATE INDEX IF NOT EXISTS shares_ip_time_idx ON shares (ip_address, shared_at DESC)
WHERE
    ip_address IS NOT NULL;

-- Note: Recent shares index removed due to PostgreSQL IMMUTABLE function requirement
-- Can be added later with a different approach if needed for performance