-- Migration: Add upload system tables and fields
-- Date: 2025-01-20
-- Description: Add uploads table for tracking file uploads and image_key field to reports table

-- Add image_key field to reports table for R2 object management
ALTER TABLE reports ADD COLUMN IF NOT EXISTS image_key TEXT;

-- Create uploads table for tracking upload metadata
CREATE TABLE IF NOT EXISTS uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users (id) ON DELETE CASCADE,
    image_key TEXT UNIQUE NOT NULL,
    image_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS uploads_user_id_idx ON uploads (user_id);

CREATE INDEX IF NOT EXISTS uploads_image_key_idx ON uploads (image_key);

CREATE INDEX IF NOT EXISTS uploads_created_at_idx ON uploads (created_at DESC);

CREATE INDEX IF NOT EXISTS reports_image_key_idx ON reports (image_key);

-- Add constraints for file validation
ALTER TABLE uploads
ADD CONSTRAINT uploads_file_size_positive CHECK (file_size > 0);

ALTER TABLE uploads
ADD CONSTRAINT uploads_file_type_valid CHECK (
    file_type IN (
        'image/jpeg',
        'image/png',
        'image/webp'
    )
);