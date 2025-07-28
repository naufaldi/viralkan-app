/**
 * Administrative Data Layer
 * 
 * Database operations for Indonesian administrative data.
 * Pure data access with no business logic.
 * 
 * Following clean architecture: Data layer only handles database operations
 * and external API calls - no business logic or HTTP concerns.
 */

import { sql } from "@/db/connection";
import { createSuccess, createError } from "@/types";
import type { AppResult } from "@/types";
import type {
  Province,
  Regency,
  District,
  SyncStatus,
} from "./types";

/**
 * Find all provinces
 * 
 * Returns all provinces ordered by code for consistent ordering.
 */
export const findAllProvinces = async (): Promise<AppResult<Province[]>> => {
  try {
    const query = `
      SELECT code, name
      FROM provinces
      ORDER BY code ASC
    `;

    const result = await sql.unsafe(query);
    return createSuccess(result as unknown as Province[]);
  } catch (error) {
    console.error("Database error in findAllProvinces:", error);
    return createError("Failed to fetch provinces from database", 500);
  }
};

/**
 * Check if province exists
 * 
 * Validates that a province code exists in the database.
 */
export const checkProvinceExists = async (
  provinceCode: string
): Promise<AppResult<boolean>> => {
  try {
    const query = `
      SELECT 1
      FROM provinces
      WHERE code = $1
      LIMIT 1
    `;

    const result = await sql.unsafe(query, [provinceCode]);
    return createSuccess(result.length > 0);
  } catch (error) {
    console.error("Database error in checkProvinceExists:", error);
    return createError("Failed to check province existence", 500);
  }
};

/**
 * Find regencies by province
 * 
 * Returns all regencies/cities within a specific province.
 */
export const findRegenciesByProvince = async (
  provinceCode: string
): Promise<AppResult<Regency[]>> => {
  try {
    const query = `
      SELECT code, name, province_code
      FROM regencies
      WHERE province_code = $1
      ORDER BY name ASC
    `;

    const result = await sql.unsafe(query, [provinceCode]);
    return createSuccess(result as unknown as Regency[]);
  } catch (error) {
    console.error("Database error in findRegenciesByProvince:", error);
    return createError("Failed to fetch regencies from database", 500);
  }
};

/**
 * Check if regency exists
 * 
 * Validates that a regency code exists in the database.
 */
export const checkRegencyExists = async (
  regencyCode: string
): Promise<AppResult<boolean>> => {
  try {
    const query = `
      SELECT 1
      FROM regencies
      WHERE code = $1
      LIMIT 1
    `;

    const result = await sql.unsafe(query, [regencyCode]);
    return createSuccess(result.length > 0);
  } catch (error) {
    console.error("Database error in checkRegencyExists:", error);
    return createError("Failed to check regency existence", 500);
  }
};

/**
 * Find districts by regency
 * 
 * Returns all districts within a specific regency/city.
 */
export const findDistrictsByRegency = async (
  regencyCode: string
): Promise<AppResult<District[]>> => {
  try {
    const query = `
      SELECT code, name, regency_code
      FROM districts
      WHERE regency_code = $1
      ORDER BY name ASC
    `;

    const result = await sql.unsafe(query, [regencyCode]);
    return createSuccess(result as unknown as District[]);
  } catch (error) {
    console.error("Database error in findDistrictsByRegency:", error);
    return createError("Failed to fetch districts from database", 500);
  }
};

/**
 * Get administrative counts and sync status
 * 
 * Returns current counts of all administrative units and last sync timestamp.
 */
export const getAdministrativeCounts = async (): Promise<AppResult<SyncStatus>> => {
  try {
    // Get counts from all administrative tables
    const countsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM provinces) as provinces,
        (SELECT COUNT(*) FROM regencies) as regencies,
        (SELECT COUNT(*) FROM districts) as districts
    `;

    // Get last sync timestamp (most recent updated_at from any administrative table)
    const lastSyncQuery = `
      SELECT MAX(updated_at) as last_sync
      FROM (
        SELECT MAX(updated_at) as updated_at FROM provinces
        UNION ALL
        SELECT MAX(updated_at) as updated_at FROM regencies
        UNION ALL
        SELECT MAX(updated_at) as updated_at FROM districts
      ) combined
    `;

    const [countsResult, lastSyncResult] = await Promise.all([
      sql.unsafe(countsQuery),
      sql.unsafe(lastSyncQuery),
    ]);

    const counts = countsResult[0] as any;
    const lastSync = lastSyncResult[0] as any;

    const syncStatus: SyncStatus = {
      provinces: Number(counts.provinces) || 0,
      regencies: Number(counts.regencies) || 0,
      districts: Number(counts.districts) || 0,
      lastSync: lastSync.last_sync || null,
    };

    return createSuccess(syncStatus);
  } catch (error) {
    console.error("Database error in getAdministrativeCounts:", error);
    return createError("Failed to fetch administrative counts", 500);
  }
};

/**
 * Validate administrative hierarchy
 * 
 * Checks that district belongs to regency and regency belongs to province
 * by validating the relationships exist in the database.
 */
export const validateHierarchy = async (
  provinceCode: string,
  regencyCode: string,
  districtCode: string
): Promise<AppResult<boolean>> => {
  try {
    const query = `
      SELECT 1
      FROM districts d
      JOIN regencies r ON d.regency_code = r.code
      JOIN provinces p ON r.province_code = p.code
      WHERE p.code = $1 
        AND r.code = $2 
        AND d.code = $3
      LIMIT 1
    `;

    const result = await sql.unsafe(query, [provinceCode, regencyCode, districtCode]);
    return createSuccess(result.length > 0);
  } catch (error) {
    console.error("Database error in validateHierarchy:", error);
    return createError("Failed to validate administrative hierarchy", 500);
  }
};

/**
 * Get administrative names by codes
 * 
 * Fetches human-readable names for administrative codes.
 * Used for enriching report data and validation messages.
 */
export const getAdministrativeNames = async (
  provinceCode: string,
  regencyCode: string,
  districtCode: string
): Promise<AppResult<{
  province: string;
  regency: string;
  district: string;
}>> => {
  try {
    const query = `
      SELECT 
        p.name as province,
        r.name as regency,
        d.name as district
      FROM districts d
      JOIN regencies r ON d.regency_code = r.code
      JOIN provinces p ON r.province_code = p.code
      WHERE p.code = $1 
        AND r.code = $2 
        AND d.code = $3
      LIMIT 1
    `;

    const result = await sql.unsafe(query, [provinceCode, regencyCode, districtCode]);

    if (result.length === 0) {
      return createError("Administrative hierarchy not found", 404);
    }

    const names = result[0] as any;
    return createSuccess({
      province: names.province,
      regency: names.regency,
      district: names.district,
    });
  } catch (error) {
    console.error("Database error in getAdministrativeNames:", error);
    return createError("Failed to fetch administrative names", 500);
  }
};

/**
 * Find province by name (fuzzy search)
 * 
 * Searches for provinces by name using case-insensitive partial matching.
 * Useful for geocoding validation and name resolution.
 */
export const findProvinceByName = async (
  name: string
): Promise<AppResult<Province | null>> => {
  try {
    const query = `
      SELECT code, name
      FROM provinces
      WHERE UPPER(name) LIKE UPPER($1)
      ORDER BY 
        CASE 
          WHEN UPPER(name) = UPPER($2) THEN 1  -- Exact match first
          WHEN UPPER(name) LIKE UPPER($3) THEN 2  -- Starts with second
          ELSE 3  -- Contains third
        END,
        name ASC
      LIMIT 1
    `;

    const searchPattern = `%${name}%`;
    const startsWithPattern = `${name}%`;
    
    const result = await sql.unsafe(query, [searchPattern, name, startsWithPattern]);

    if (result.length === 0) {
      return createSuccess(null);
    }

    return createSuccess(result[0] as unknown as Province);
  } catch (error) {
    console.error("Database error in findProvinceByName:", error);
    return createError("Failed to search province by name", 500);
  }
};

/**
 * Find regency by name within province
 * 
 * Searches for regencies by name within a specific province.
 */
export const findRegencyByName = async (
  name: string,
  provinceCode: string
): Promise<AppResult<Regency | null>> => {
  try {
    const query = `
      SELECT code, name, province_code
      FROM regencies
      WHERE province_code = $1
        AND UPPER(name) LIKE UPPER($2)
      ORDER BY 
        CASE 
          WHEN UPPER(name) = UPPER($3) THEN 1
          WHEN UPPER(name) LIKE UPPER($4) THEN 2
          ELSE 3
        END,
        name ASC
      LIMIT 1
    `;

    const searchPattern = `%${name}%`;
    const startsWithPattern = `${name}%`;
    
    const result = await sql.unsafe(query, [
      provinceCode,
      searchPattern,
      name,
      startsWithPattern,
    ]);

    if (result.length === 0) {
      return createSuccess(null);
    }

    return createSuccess(result[0] as unknown as Regency);
  } catch (error) {
    console.error("Database error in findRegencyByName:", error);
    return createError("Failed to search regency by name", 500);
  }
};

/**
 * Find district by name within regency
 * 
 * Searches for districts by name within a specific regency.
 */
export const findDistrictByName = async (
  name: string,
  regencyCode: string
): Promise<AppResult<District | null>> => {
  try {
    const query = `
      SELECT code, name, regency_code
      FROM districts
      WHERE regency_code = $1
        AND UPPER(name) LIKE UPPER($2)
      ORDER BY 
        CASE 
          WHEN UPPER(name) = UPPER($3) THEN 1
          WHEN UPPER(name) LIKE UPPER($4) THEN 2
          ELSE 3
        END,
        name ASC
      LIMIT 1
    `;

    const searchPattern = `%${name}%`;
    const startsWithPattern = `${name}%`;
    
    const result = await sql.unsafe(query, [
      regencyCode,
      searchPattern,
      name,
      startsWithPattern,
    ]);

    if (result.length === 0) {
      return createSuccess(null);
    }

    return createSuccess(result[0] as unknown as District);
  } catch (error) {
    console.error("Database error in findDistrictByName:", error);
    return createError("Failed to search district by name", 500);
  }
};

/**
 * Bulk check administrative codes existence
 * 
 * Efficiently checks if multiple administrative codes exist.
 * Used for batch validation operations.
 */
export const checkCodesExist = async (codes: {
  provinces?: string[];
  regencies?: string[];
  districts?: string[];
}): Promise<AppResult<{
  provinces: string[];
  regencies: string[];
  districts: string[];
}>> => {
  try {
    const results = {
      provinces: [] as string[],
      regencies: [] as string[],
      districts: [] as string[],
    };

    // Check provinces if provided
    if (codes.provinces && codes.provinces.length > 0) {
      const provinceQuery = `
        SELECT code
        FROM provinces
        WHERE code = ANY($1)
      `;
      const provinceResult = await sql.unsafe(provinceQuery, [codes.provinces]);
      results.provinces = provinceResult.map((row: any) => row.code);
    }

    // Check regencies if provided
    if (codes.regencies && codes.regencies.length > 0) {
      const regencyQuery = `
        SELECT code
        FROM regencies
        WHERE code = ANY($1)
      `;
      const regencyResult = await sql.unsafe(regencyQuery, [codes.regencies]);
      results.regencies = regencyResult.map((row: any) => row.code);
    }

    // Check districts if provided
    if (codes.districts && codes.districts.length > 0) {
      const districtQuery = `
        SELECT code
        FROM districts
        WHERE code = ANY($1)
      `;
      const districtResult = await sql.unsafe(districtQuery, [codes.districts]);
      results.districts = districtResult.map((row: any) => row.code);
    }

    return createSuccess(results);
  } catch (error) {
    console.error("Database error in checkCodesExist:", error);
    return createError("Failed to check administrative codes", 500);
  }
};