-- Migration: 008_add_administrative_tables.sql
-- Creates administrative reference tables for Indonesian provinces, regencies, districts
-- Supports hybrid approach: reference tables + nullable code columns in reports

-- Provinces table (38 provinces)
CREATE TABLE IF NOT EXISTS provinces (
  code VARCHAR(2) PRIMARY KEY,           -- "32" (Jawa Barat)
  name VARCHAR(100) NOT NULL,            -- "JAWA BARAT"
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Regencies table (500+ regencies/cities)  
CREATE TABLE IF NOT EXISTS regencies (
  code VARCHAR(4) PRIMARY KEY,           -- "3273" (Kota Bandung)
  name VARCHAR(100) NOT NULL,            -- "KOTA BANDUNG"
  province_code VARCHAR(2) NOT NULL REFERENCES provinces(code) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Districts table (7000+ districts)
CREATE TABLE IF NOT EXISTS districts (
  code VARCHAR(6) PRIMARY KEY,           -- "327301" (Sukasari)
  name VARCHAR(100) NOT NULL,            -- "SUKASARI"  
  regency_code VARCHAR(4) NOT NULL REFERENCES regencies(code) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add code columns to reports table (nullable for backward compatibility)
-- These columns will reference the new administrative tables
ALTER TABLE reports ADD COLUMN IF NOT EXISTS province_code VARCHAR(2) REFERENCES provinces(code);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS regency_code VARCHAR(4) REFERENCES regencies(code);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS district_code VARCHAR(6) REFERENCES districts(code);

-- Performance indexes for administrative hierarchy queries
CREATE INDEX IF NOT EXISTS idx_regencies_province_code ON regencies(province_code);
CREATE INDEX IF NOT EXISTS idx_districts_regency_code ON districts(regency_code);
CREATE INDEX IF NOT EXISTS idx_reports_province_code ON reports(province_code);
CREATE INDEX IF NOT EXISTS idx_reports_regency_code ON reports(regency_code); 
CREATE INDEX IF NOT EXISTS idx_reports_district_code ON reports(district_code);

-- Name indexes for search performance (autocomplete features)
CREATE INDEX IF NOT EXISTS idx_provinces_name ON provinces(name);
CREATE INDEX IF NOT EXISTS idx_regencies_name ON regencies(name);
CREATE INDEX IF NOT EXISTS idx_districts_name ON districts(name);

-- Partial indexes for non-null values in reports (future optimization)
CREATE INDEX IF NOT EXISTS idx_reports_province_code_nn ON reports(province_code) WHERE province_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_regency_code_nn ON reports(regency_code) WHERE regency_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_district_code_nn ON reports(district_code) WHERE district_code IS NOT NULL;

-- Composite index for administrative hierarchy filtering
CREATE INDEX IF NOT EXISTS idx_reports_admin_hierarchy ON reports(province_code, regency_code, district_code) WHERE province_code IS NOT NULL;