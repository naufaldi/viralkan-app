-- Migration: Rename administrative boundary fields to English for data consistency
-- This migration updates field names from Indonesian to English

-- Rename administrative location fields to English equivalents
-- kecamatan (sub-district) -> district
-- kota (city/regency) -> city  
-- provinsi (province) -> province

-- Add new English columns
ALTER TABLE reports ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS province TEXT;

-- Copy data from Indonesian columns to English columns
UPDATE reports SET 
  district = kecamatan,
  city = kota,
  province = provinsi
WHERE kecamatan IS NOT NULL OR kota IS NOT NULL OR provinsi IS NOT NULL;

-- Drop old Indonesian columns (after data migration)
ALTER TABLE reports DROP COLUMN IF EXISTS kecamatan;
ALTER TABLE reports DROP COLUMN IF EXISTS kota;
ALTER TABLE reports DROP COLUMN IF EXISTS provinsi;

-- Drop old indexes (they will be invalid after column drops)
DROP INDEX IF EXISTS reports_kecamatan_idx;
DROP INDEX IF EXISTS reports_kota_idx;
DROP INDEX IF EXISTS reports_provinsi_idx;
DROP INDEX IF EXISTS reports_location_filter_idx;
DROP INDEX IF EXISTS reports_gis_status_idx;

-- Create new indexes with English column names
CREATE INDEX IF NOT EXISTS reports_district_idx ON reports(district);
CREATE INDEX IF NOT EXISTS reports_city_idx ON reports(city);
CREATE INDEX IF NOT EXISTS reports_province_idx ON reports(province);
CREATE INDEX IF NOT EXISTS reports_location_filter_idx ON reports(province, city, district);

-- Recreate composite index for GIS queries with English field names
CREATE INDEX IF NOT EXISTS reports_gis_status_idx ON reports(status, province, city, district) 
WHERE status IN ('pending', 'verified');