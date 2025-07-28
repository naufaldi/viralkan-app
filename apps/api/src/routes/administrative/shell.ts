/**
 * Administrative Shell Layer
 *
 * Business logic orchestration for Indonesian administrative data endpoints.
 * Coordinates between core validation logic and data access operations.
 *
 * Following clean architecture: Shell orchestrates between API ← Shell → Core ← Data
 */

import { createSuccess, createError } from "@/types";
import type { AppResult } from "@/types";
import * as core from "./core";
import * as data from "./data";
import type { Province, Regency, District, SyncStatus } from "./types";

/**
 * Get all provinces
 *
 * Returns all Indonesian provinces (should be 38 total).
 * This is a read-only operation with no business logic required.
 */
export const getAllProvinces = async (): Promise<AppResult<Province[]>> => {
  try {
    const result = await data.findAllProvinces();

    if (!result.success) {
      return result;
    }

    // Business rule: Validate expected number of provinces
    if (result.data.length === 0) {
      return createError(
        "No provinces found. Administrative data may not be synced.",
        500,
      );
    }

    // Business rule: Log warning if province count seems low
    if (result.data.length < 30) {
      console.warn(
        `⚠️ Only ${result.data.length} provinces found. Expected 38 Indonesian provinces.`,
      );
    }

    return createSuccess(result.data);
  } catch (error) {
    console.error("Error in getAllProvinces shell:", error);
    return createError("Failed to retrieve provinces", 500);
  }
};

/**
 * Get regencies by province code
 *
 * Returns all regencies/cities within a specific province.
 * Validates province code format and existence.
 */
export const getRegenciesByProvince = async (
  provinceCode: string,
): Promise<AppResult<Regency[]>> => {
  try {
    // Core validation: Check province code format
    if (!core.isValidProvinceCode(provinceCode)) {
      return createError(
        "Invalid province code format. Must be 2 digits.",
        400,
      );
    }

    // Data validation: Check if province exists
    const provinceExists = await data.checkProvinceExists(provinceCode);
    if (!provinceExists.success) {
      return provinceExists;
    }

    if (!provinceExists.data) {
      return createError(`Province with code ${provinceCode} not found`, 404);
    }

    // Fetch regencies for the province
    const result = await data.findRegenciesByProvince(provinceCode);

    if (!result.success) {
      return result;
    }

    // Business rule: Log warning if no regencies found for existing province
    if (result.data.length === 0) {
      console.warn(
        `⚠️ No regencies found for province ${provinceCode}. This may indicate incomplete data.`,
      );
    }

    return createSuccess(result.data);
  } catch (error) {
    console.error("Error in getRegenciesByProvince shell:", error);
    return createError("Failed to retrieve regencies", 500);
  }
};

/**
 * Get districts by regency code
 *
 * Returns all districts within a specific regency/city.
 * Validates regency code format and existence.
 */
export const getDistrictsByRegency = async (
  regencyCode: string,
): Promise<AppResult<District[]>> => {
  try {
    // Core validation: Check regency code format
    if (!core.isValidRegencyCode(regencyCode)) {
      return createError("Invalid regency code format. Must be 4 digits.", 400);
    }

    // Data validation: Check if regency exists
    const regencyExists = await data.checkRegencyExists(regencyCode);
    if (!regencyExists.success) {
      return regencyExists;
    }

    if (!regencyExists.data) {
      return createError(`Regency with code ${regencyCode} not found`, 404);
    }

    // Fetch districts for the regency
    const result = await data.findDistrictsByRegency(regencyCode);

    if (!result.success) {
      return result;
    }

    // Business rule: Log warning if no districts found for existing regency
    if (result.data.length === 0) {
      console.warn(
        `⚠️ No districts found for regency ${regencyCode}. This may indicate incomplete data.`,
      );
    }

    return createSuccess(result.data);
  } catch (error) {
    console.error("Error in getDistrictsByRegency shell:", error);
    return createError("Failed to retrieve districts", 500);
  }
};

/**
 * Get administrative data sync status
 *
 * Returns current counts and last sync timestamp for monitoring purposes.
 * No business logic required - pure data reporting.
 */
export const getSyncStatus = async (): Promise<AppResult<SyncStatus>> => {
  try {
    const result = await data.getAdministrativeCounts();

    if (!result.success) {
      return result;
    }

    return createSuccess(result.data);
  } catch (error) {
    console.error("Error in getSyncStatus shell:", error);
    return createError("Failed to retrieve sync status", 500);
  }
};

/**
 * Validate administrative hierarchy
 *
 * Business logic to validate that district belongs to regency,
 * and regency belongs to province. Used by report creation.
 */
export const validateAdministrativeHierarchy = async (
  provinceCode: string,
  regencyCode: string,
  districtCode: string,
): Promise<AppResult<boolean>> => {
  try {
    // Core validation: Check all code formats
    if (!core.isValidProvinceCode(provinceCode)) {
      return createError("Invalid province code format", 400);
    }

    if (!core.isValidRegencyCode(regencyCode)) {
      return createError("Invalid regency code format", 400);
    }

    if (!core.isValidDistrictCode(districtCode)) {
      return createError("Invalid district code format", 400);
    }

    // Data validation: Check hierarchy relationships
    const hierarchyValid = await data.validateHierarchy(
      provinceCode,
      regencyCode,
      districtCode,
    );

    if (!hierarchyValid.success) {
      return hierarchyValid;
    }

    if (!hierarchyValid.data) {
      return createError(
        "Invalid administrative hierarchy. District does not belong to the specified regency/province.",
        400,
      );
    }

    return createSuccess(true);
  } catch (error) {
    console.error("Error in validateAdministrativeHierarchy shell:", error);
    return createError("Failed to validate administrative hierarchy", 500);
  }
};

/**
 * Get administrative names by codes
 *
 * Utility function to get human-readable names for administrative codes.
 * Used for enriching report data.
 */
export const getAdministrativeNames = async (
  provinceCode: string,
  regencyCode: string,
  districtCode: string,
): Promise<
  AppResult<{
    province: string;
    regency: string;
    district: string;
  }>
> => {
  try {
    // Validate codes first
    const hierarchyValidation = await validateAdministrativeHierarchy(
      provinceCode,
      regencyCode,
      districtCode,
    );

    if (!hierarchyValidation.success) {
      return hierarchyValidation;
    }

    // Fetch names
    const result = await data.getAdministrativeNames(
      provinceCode,
      regencyCode,
      districtCode,
    );

    return result;
  } catch (error) {
    console.error("Error in getAdministrativeNames shell:", error);
    return createError("Failed to get administrative names", 500);
  }
};
