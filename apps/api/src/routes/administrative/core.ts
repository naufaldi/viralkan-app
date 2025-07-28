/**
 * Administrative Core Layer
 *
 * Pure business logic and validation rules for Indonesian administrative data.
 * Contains no side effects - only validation and business rule functions.
 *
 * Following clean architecture: These functions are framework-agnostic
 * and can be easily tested in isolation.
 */

/**
 * Validate Indonesian province code format
 *
 * Province codes are 2-digit numbers (e.g., "11", "32", "73")
 * Valid range: 11-94 (based on official Indonesian province codes)
 *
 * @param code - Province code to validate
 * @returns true if code format is valid
 */
export const isValidProvinceCode = (code: string): boolean => {
  if (!code || typeof code !== "string") {
    return false;
  }

  // Must be exactly 2 characters
  if (code.length !== 2) {
    return false;
  }

  // Must be numeric
  if (!/^\d{2}$/.test(code)) {
    return false;
  }

  // Must be in valid range for Indonesian provinces
  const numericCode = parseInt(code, 10);
  return numericCode >= 11 && numericCode <= 94;
};

/**
 * Validate Indonesian regency/city code format
 *
 * Regency codes are 4-digit numbers that start with province code
 * Format: {province_code}{2_digit_regency_number}
 *
 * @param code - Regency code to validate
 * @returns true if code format is valid
 */
export const isValidRegencyCode = (code: string): boolean => {
  if (!code || typeof code !== "string") {
    return false;
  }

  // Must be exactly 4 characters
  if (code.length !== 4) {
    return false;
  }

  // Must be numeric
  if (!/^\d{4}$/.test(code)) {
    return false;
  }

  // Extract province code (first 2 digits)
  const provinceCode = code.substring(0, 2);

  // Province part must be valid
  if (!isValidProvinceCode(provinceCode)) {
    return false;
  }

  // Regency part (last 2 digits) should be 01-99
  const regencyPart = code.substring(2, 4);
  const regencyNum = parseInt(regencyPart, 10);

  return regencyNum >= 1 && regencyNum <= 99;
};

/**
 * Validate Indonesian district code format
 *
 * District codes are 6-digit numbers that start with regency code
 * Format: {regency_code}{2_digit_district_number}
 *
 * @param code - District code to validate
 * @returns true if code format is valid
 */
export const isValidDistrictCode = (code: string): boolean => {
  if (!code || typeof code !== "string") {
    return false;
  }

  // Must be exactly 6 characters
  if (code.length !== 6) {
    return false;
  }

  // Must be numeric
  if (!/^\d{6}$/.test(code)) {
    return false;
  }

  // Extract regency code (first 4 digits)
  const regencyCode = code.substring(0, 4);

  // Regency part must be valid
  if (!isValidRegencyCode(regencyCode)) {
    return false;
  }

  // District part (last 2 digits) should be 01-99
  const districtPart = code.substring(4, 6);
  const districtNum = parseInt(districtPart, 10);

  return districtNum >= 1 && districtNum <= 99;
};

/**
 * Extract parent codes from administrative code
 *
 * Utility function to extract parent administrative unit codes
 * from a child code based on Indonesian administrative hierarchy.
 */
export const extractParentCodes = (
  code: string,
): {
  provinceCode?: string;
  regencyCode?: string;
} => {
  if (!code || typeof code !== "string") {
    return {};
  }

  const result: { provinceCode?: string; regencyCode?: string } = {};

  // Extract province code from any valid administrative code
  if (code.length >= 2) {
    const provinceCode = code.substring(0, 2);
    if (isValidProvinceCode(provinceCode)) {
      result.provinceCode = provinceCode;
    }
  }

  // Extract regency code from district code
  if (code.length >= 4) {
    const regencyCode = code.substring(0, 4);
    if (isValidRegencyCode(regencyCode)) {
      result.regencyCode = regencyCode;
    }
  }

  return result;
};

/**
 * Validate administrative hierarchy consistency
 *
 * Business rule: District must belong to regency, regency must belong to province
 * This validates the code structure consistency, not database relationships.
 *
 * @param provinceCode - Province code (2 digits)
 * @param regencyCode - Regency code (4 digits)
 * @param districtCode - District code (6 digits)
 * @returns true if hierarchy is structurally consistent
 */
export const isValidAdministrativeHierarchy = (
  provinceCode: string,
  regencyCode: string,
  districtCode: string,
): boolean => {
  // Validate individual codes first
  if (!isValidProvinceCode(provinceCode)) {
    return false;
  }

  if (!isValidRegencyCode(regencyCode)) {
    return false;
  }

  if (!isValidDistrictCode(districtCode)) {
    return false;
  }

  // Check hierarchical consistency
  // Regency code must start with province code
  if (!regencyCode.startsWith(provinceCode)) {
    return false;
  }

  // District code must start with regency code
  if (!districtCode.startsWith(regencyCode)) {
    return false;
  }

  return true;
};

/**
 * Normalize administrative name
 *
 * Business rule for consistent administrative name formatting.
 * Removes common prefixes and normalizes casing.
 *
 * @param name - Raw administrative name
 * @param type - Type of administrative unit
 * @returns normalized name
 */
export const normalizeAdministrativeName = (
  name: string,
  type: "province" | "regency" | "district",
): string => {
  if (!name || typeof name !== "string") {
    return "";
  }

  let normalized = name.trim().toUpperCase();

  // Remove common prefixes based on type
  switch (type) {
    case "province":
      // Provinces don't typically have prefixes to remove
      break;

    case "regency":
      // Remove KABUPATEN, KOTA prefixes but keep them for clarity
      // This is a business decision - we keep them for user recognition
      break;

    case "district":
      // Remove KECAMATAN prefix if present
      normalized = normalized.replace(/^KECAMATAN\s+/, "");
      break;
  }

  return normalized;
};

/**
 * Get administrative level from code
 *
 * Determines the administrative level based on code length and format.
 *
 * @param code - Administrative code
 * @returns administrative level or null if invalid
 */
export const getAdministrativeLevel = (
  code: string,
): "province" | "regency" | "district" | null => {
  if (!code || typeof code !== "string") {
    return null;
  }

  if (code.length === 2 && isValidProvinceCode(code)) {
    return "province";
  }

  if (code.length === 4 && isValidRegencyCode(code)) {
    return "regency";
  }

  if (code.length === 6 && isValidDistrictCode(code)) {
    return "district";
  }

  return null;
};

/**
 * Generate administrative hierarchy path
 *
 * Creates a hierarchical path string for display purposes.
 *
 * @param province - Province name
 * @param regency - Regency name
 * @param district - District name
 * @returns formatted hierarchy path
 */
export const generateHierarchyPath = (
  province: string,
  regency: string,
  district: string,
): string => {
  const parts = [district, regency, province].filter(Boolean);
  return parts.join(", ");
};

/**
 * Expected administrative data counts
 *
 * Business constants for validating sync completeness.
 * Based on official Indonesian administrative structure.
 */
export const EXPECTED_COUNTS = {
  PROVINCES: 38, // 34 provinces + 4 special regions + adjustments
  MIN_REGENCIES: 400, // Approximate minimum regencies/cities
  MAX_REGENCIES: 600, // Approximate maximum regencies/cities
  MIN_DISTRICTS: 6000, // Approximate minimum districts
  MAX_DISTRICTS: 8000, // Approximate maximum districts
} as const;

/**
 * Validate sync completeness
 *
 * Business rule to check if administrative data sync appears complete
 * based on expected counts.
 */
export const isSyncComplete = (counts: {
  provinces: number;
  regencies: number;
  districts: number;
}): {
  isComplete: boolean;
  warnings: string[];
} => {
  const warnings: string[] = [];

  // Check provinces count
  if (counts.provinces < EXPECTED_COUNTS.PROVINCES) {
    warnings.push(
      `Province count (${counts.provinces}) is below expected (${EXPECTED_COUNTS.PROVINCES})`,
    );
  }

  // Check regencies count
  if (counts.regencies < EXPECTED_COUNTS.MIN_REGENCIES) {
    warnings.push(
      `Regency count (${counts.regencies}) is below minimum expected (${EXPECTED_COUNTS.MIN_REGENCIES})`,
    );
  } else if (counts.regencies > EXPECTED_COUNTS.MAX_REGENCIES) {
    warnings.push(
      `Regency count (${counts.regencies}) is above maximum expected (${EXPECTED_COUNTS.MAX_REGENCIES})`,
    );
  }

  // Check districts count
  if (counts.districts < EXPECTED_COUNTS.MIN_DISTRICTS) {
    warnings.push(
      `District count (${counts.districts}) is below minimum expected (${EXPECTED_COUNTS.MIN_DISTRICTS})`,
    );
  } else if (counts.districts > EXPECTED_COUNTS.MAX_DISTRICTS) {
    warnings.push(
      `District count (${counts.districts}) is above maximum expected (${EXPECTED_COUNTS.MAX_DISTRICTS})`,
    );
  }

  return {
    isComplete: warnings.length === 0,
    warnings,
  };
};
