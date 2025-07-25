-- Migration: Add GIS administrative boundary fields and geocoding metadata
-- This migration implements the GIS RFC administrative boundary support

-- Add administrative location fields for Indonesian administrative divisions
ALTER TABLE reports ADD COLUMN IF NOT EXISTS kecamatan TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS kota TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS provinsi TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Indonesia';

-- Add geocoding metadata fields
ALTER TABLE reports ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMPTZ;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS geocoding_source TEXT CHECK (geocoding_source IN ('exif', 'nominatim', 'manual'));

-- Add performance indexes for administrative boundary filtering
CREATE INDEX IF NOT EXISTS reports_kecamatan_idx ON reports(kecamatan);
CREATE INDEX IF NOT EXISTS reports_kota_idx ON reports(kota);  
CREATE INDEX IF NOT EXISTS reports_provinsi_idx ON reports(provinsi);
CREATE INDEX IF NOT EXISTS reports_location_filter_idx ON reports(provinsi, kota, kecamatan);

-- Add index for geocoding metadata
CREATE INDEX IF NOT EXISTS reports_geocoding_source_idx ON reports(geocoding_source);
CREATE INDEX IF NOT EXISTS reports_geocoded_at_idx ON reports(geocoded_at DESC);

-- Add composite index for GIS queries combining location and status
CREATE INDEX IF NOT EXISTS reports_gis_status_idx ON reports(status, provinsi, kota, kecamatan) 
WHERE status IN ('pending', 'verified');

-- Note: The spatial index reports_geo_idx already exists from schema.sql
-- This provides spatial querying capabilities for PostGIS