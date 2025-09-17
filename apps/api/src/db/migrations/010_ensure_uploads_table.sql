-- Migration: 010_ensure_uploads_table.sql
-- Purpose: Ensure uploads metadata table and related indexes/constraints exist for rate limiting
-- Context: Production reported "relation \"uploads\" does not exist" during upload rate checks

-- Ensure reports table has image_key for correlating uploads
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS image_key TEXT;

-- Ensure uploads table exists with expected columns
CREATE TABLE IF NOT EXISTS uploads (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users (id) ON DELETE CASCADE,
    image_key TEXT UNIQUE NOT NULL,
    image_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Align defaults with application expectations (uuidv7 inserted from app layer, fallback to gen_random_uuid)
ALTER TABLE uploads
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Enforce positive file size (ignore if constraint already exists)
DO $$
BEGIN
    ALTER TABLE uploads
        ADD CONSTRAINT uploads_file_size_positive CHECK (file_size > 0);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;

-- Restrict file types to supported MIME types (ignore if constraint already exists)
DO $$
BEGIN
    ALTER TABLE uploads
        ADD CONSTRAINT uploads_file_type_valid CHECK (
            file_type IN (
                'image/jpeg',
                'image/png',
                'image/webp'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;

-- Indexes to support rate limiting and metadata lookups
CREATE INDEX IF NOT EXISTS uploads_user_id_idx ON uploads (user_id);
CREATE INDEX IF NOT EXISTS uploads_created_at_idx ON uploads (created_at DESC);
CREATE INDEX IF NOT EXISTS uploads_image_key_idx ON uploads (image_key);

-- Ensure reports image_key lookups are fast
CREATE INDEX IF NOT EXISTS reports_image_key_idx ON reports (image_key);
