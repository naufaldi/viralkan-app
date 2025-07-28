/**
 * Administrative Types
 * 
 * TypeScript type definitions for Indonesian administrative data.
 * Includes database entities and API response types.
 */

// Database entity types (matching database schema)

export interface Province {
  code: string;           // 2-digit province code (e.g., "32")
  name: string;           // Province name (e.g., "JAWA BARAT")
}

export interface Regency {
  code: string;           // 4-digit regency code (e.g., "3273")
  name: string;           // Regency name (e.g., "KOTA BANDUNG")
  province_code: string;  // Parent province code (e.g., "32")
}

export interface District {
  code: string;           // 6-digit district code (e.g., "327301")
  name: string;           // District name (e.g., "SUKASARI")
  regency_code: string;   // Parent regency code (e.g., "3273")
}

// Extended types with hierarchy information

export interface ProvinceWithStats extends Province {
  regency_count: number;  // Number of regencies in this province
  district_count: number; // Number of districts in this province
}

export interface RegencyWithStats extends Regency {
  district_count: number; // Number of districts in this regency
}

// Sync and status types

export interface SyncStatus {
  provinces: number;      // Current count of provinces in database
  regencies: number;      // Current count of regencies in database
  districts: number;      // Current count of districts in database
  lastSync: Date | null;  // Last sync timestamp, null if never synced
}

export interface SyncStats {
  provinces: {
    total: number;        // Total fetched from API
    inserted: number;     // Successfully inserted
    updated: number;      // Successfully updated
    errors: number;       // Failed operations
  };
  regencies: {
    total: number;
    inserted: number;
    updated: number;
    errors: number;
  };
  districts: {
    total: number;
    inserted: number;
    updated: number;
    errors: number;
  };
  duration: number;       // Total sync duration in milliseconds
}

// Hierarchy validation types

export interface AdministrativeHierarchy {
  province: Province;
  regency: Regency;
  district: District;
}

export interface AdministrativeNames {
  province: string;       // Province name
  regency: string;        // Regency name
  district: string;       // District name
}

// Search and filtering types

export interface AdministrativeSearchParams {
  query?: string;         // Search query for name
  limit?: number;         // Maximum results to return
  offset?: number;        // Pagination offset
}

export interface AdministrativeSearchResult<T> {
  items: T[];             // Search results
  total: number;          // Total matching results
  hasMore: boolean;       // Whether more results are available
}

// Validation result types

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface HierarchyValidationResult extends ValidationResult {
  hierarchy?: AdministrativeHierarchy;
}

// Bulk operations types

export interface BulkCheckRequest {
  provinces?: string[];   // Province codes to check
  regencies?: string[];   // Regency codes to check
  districts?: string[];   // District codes to check
}

export interface BulkCheckResult {
  provinces: string[];    // Existing province codes
  regencies: string[];    // Existing regency codes
  districts: string[];    // Existing district codes
}

// API response wrapper types

export interface AdministrativeApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    lastSync?: Date;
  };
}

// Geocoding integration types (for future use)

export interface GeocodingAdministrative {
  province_code?: string;
  regency_code?: string;
  district_code?: string;
  province_name?: string;
  regency_name?: string;
  district_name?: string;
  confidence?: number;    // Geocoding confidence score
}

// Database insert/update types

export interface DbProvince {
  code: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface DbRegency {
  code: string;
  name: string;
  province_code: string;
  created_at: Date;
  updated_at: Date;
}

export interface DbDistrict {
  code: string;
  name: string;
  regency_code: string;
  created_at: Date;
  updated_at: Date;
}

// External API types (for admin sync service)

export interface ExternalApiProvince {
  code: string;
  name: string;
}

export interface ExternalApiRegency {
  code: string;
  name: string;
  provinceCode: string;
}

export interface ExternalApiDistrict {
  code: string;
  name: string;
  regencyCode: string;
}

export interface ExternalApiResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
  meta: {
    total: number;
    pagination: {
      total: number;
      pages: {
        first: number;
        last: number;
        current: number;
        previous: number | null;
        next: number | null;
      };
    };
  };
}

// Constants and enums

export enum AdministrativeLevel {
  PROVINCE = 'province',
  REGENCY = 'regency',
  DISTRICT = 'district',
}

export const ADMINISTRATIVE_CODE_LENGTHS = {
  PROVINCE: 2,
  REGENCY: 4,
  DISTRICT: 6,
} as const;

export const ADMINISTRATIVE_PATTERNS = {
  PROVINCE: /^\d{2}$/,
  REGENCY: /^\d{4}$/,
  DISTRICT: /^\d{6}$/,
} as const;