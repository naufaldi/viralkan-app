-- Enable PostGIS extension for spatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Note: Schema uses gen_random_uuid() as DEFAULT for new installations
-- In production, the application layer should use uuidv7() for time-ordered UUIDs
-- The DEFAULT is fallback only - application should explicitly generate UUIDs

-- Users table for Firebase Auth integration
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  provider TEXT NOT NULL DEFAULT 'google', -- 'google', 'facebook', 'email', etc.
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reports table for road damage reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('berlubang','retak','lainnya')),
  street_name TEXT NOT NULL,
  location_text TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'deleted')),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- V1 indexes for performance
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS reports_user_idx ON reports(user_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE INDEX IF NOT EXISTS reports_verified_by_idx ON reports(verified_by);
CREATE INDEX IF NOT EXISTS users_firebase_uid_idx ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_provider_idx ON users(provider);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- Admin actions logging table
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin actions indexes
CREATE INDEX IF NOT EXISTS admin_actions_admin_user_idx ON admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_actions_action_type_idx ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS admin_actions_target_idx ON admin_actions(target_type, target_id);
CREATE INDEX IF NOT EXISTS admin_actions_created_at_idx ON admin_actions(created_at DESC);

-- Spatial index for future GIS queries (V3 ready)
CREATE INDEX IF NOT EXISTS reports_geo_idx ON reports USING GIST (geography(ST_MakePoint(lon,lat)))
WHERE lat IS NOT NULL AND lon IS NOT NULL; 