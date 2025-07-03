-- Enable PostGIS extension for spatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table for Firebase Auth integration
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  provider TEXT NOT NULL DEFAULT 'google', -- 'google', 'facebook', 'email', etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reports table for road damage reports
CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('berlubang','retak','lainnya')),
  street_name TEXT NOT NULL,
  location_text TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- V1 indexes for performance
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS reports_user_idx ON reports(user_id);
CREATE INDEX IF NOT EXISTS users_firebase_uid_idx ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_provider_idx ON users(provider);

-- Spatial index for future GIS queries (V3 ready)
CREATE INDEX IF NOT EXISTS reports_geo_idx ON reports USING GIST (geography(ST_MakePoint(lon,lat)))
WHERE lat IS NOT NULL AND lon IS NOT NULL; 