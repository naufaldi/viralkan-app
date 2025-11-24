/**
 * Enhanced Geocoding Handler
 *
 * Processes geocoding responses and maps them to administrative select options
 * using API-based fuzzy matching with confidence scoring.
 *
 * Following Viralkan Design System 2.0 & Frontend Development Guidelines
 */

import {
  batchFuzzyMatch,
  FuzzyMatchResult,
  AdministrativeOption,
} from "./fuzzy-matching";
import type { CurrentGeocodingResponse } from "../types/administrative-sync-analysis";
import {
  administrativeService,
  type Province,
  type Regency,
  type District,
} from "../../services/administrative";

/**
 * Enhanced geocoding response with administrative mapping
 */
export interface EnhancedGeocodingResponse extends CurrentGeocodingResponse {
  administrative: {
    province: {
      code: string | null;
      name: string | null;
      confidence: number;
      matchType: "exact" | "synonym" | "fuzzy" | "none";
    };
    regency: {
      code: string | null;
      name: string | null;
      confidence: number;
      matchType: "exact" | "synonym" | "fuzzy" | "none";
    };
    district: {
      code: string | null;
      name: string | null;
      confidence: number;
      matchType: "exact" | "synonym" | "fuzzy" | "none";
    };
  };
  overallConfidence: number;
  validation: {
    isValid: boolean;
    issues: string[];
  };
}

/**
 * Administrative sync status for UI feedback
 */
export interface AdministrativeSyncStatus {
  isSynced: boolean;
  confidence: number;
  matchType: "exact" | "synonym" | "fuzzy" | "none";
  message: string;
  color: "green" | "yellow" | "red" | "gray";
  canAutoSelect: boolean;
}

/**
 * Process geocoding response and map to administrative data
 */
export function processGeocodingResponse(
  geocodingResponse: CurrentGeocodingResponse,
  administrativeData: {
    provinces: AdministrativeOption[];
    regencies: AdministrativeOption[];
    districts: AdministrativeOption[];
  },
): EnhancedGeocodingResponse {
  // Perform fuzzy matching
  const matches = batchFuzzyMatch(
    {
      province: geocodingResponse.province,
      city: geocodingResponse.city,
      district: geocodingResponse.district,
    },
    administrativeData,
  );

  // Create enhanced response
  const enhancedResponse: EnhancedGeocodingResponse = {
    ...geocodingResponse,
    administrative: {
      province: {
        code: matches.province.code,
        name: matches.province.match,
        confidence: matches.province.confidence,
        matchType: matches.province.matchType,
      },
      regency: {
        code: matches.regency.code,
        name: matches.regency.match,
        confidence: matches.regency.confidence,
        matchType: matches.regency.matchType,
      },
      district: {
        code: matches.district.code,
        name: matches.district.match,
        confidence: matches.district.confidence,
        matchType: matches.district.matchType,
      },
    },
    overallConfidence: matches.overallConfidence,
    validation: {
      isValid: true,
      issues: [],
    },
  };

  // Validate hierarchical relationships
  const validation = validateHierarchicalRelationships(
    enhancedResponse,
    administrativeData,
  );
  enhancedResponse.validation = validation;

  return enhancedResponse;
}

/**
 * Validate hierarchical relationships between administrative levels
 */
function validateHierarchicalRelationships(
  response: EnhancedGeocodingResponse,
  administrativeData: {
    provinces: AdministrativeOption[];
    regencies: AdministrativeOption[];
    districts: AdministrativeOption[];
  },
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check if regency belongs to province
  if (
    response.administrative.province.code &&
    response.administrative.regency.code
  ) {
    const regency = administrativeData.regencies.find(
      (r) => r.code === response.administrative.regency.code,
    );
    if (
      regency &&
      "province_code" in regency &&
      regency.province_code !== response.administrative.province.code
    ) {
      issues.push(
        `Regency ${response.administrative.regency.name} does not belong to province ${response.administrative.province.name}`,
      );
    }
  }

  // Check if district belongs to regency
  if (
    response.administrative.regency.code &&
    response.administrative.district.code
  ) {
    const district = administrativeData.districts.find(
      (d) => d.code === response.administrative.district.code,
    );
    if (
      district &&
      "regency_code" in district &&
      district.regency_code !== response.administrative.regency.code
    ) {
      issues.push(
        `District ${response.administrative.district.name} does not belong to regency ${response.administrative.regency.name}`,
      );
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Get sync status for UI feedback
 */
export function getAdministrativeSyncStatus(
  enhancedResponse: EnhancedGeocodingResponse,
): AdministrativeSyncStatus {
  const { administrative, overallConfidence, validation } = enhancedResponse;

  // Determine if any administrative data was found
  const hasAnyMatch =
    administrative.province.code ||
    administrative.regency.code ||
    administrative.district.code;

  if (!hasAnyMatch) {
    return {
      isSynced: false,
      confidence: 0,
      matchType: "none",
      message: "Lokasi tidak ditemukan dalam data administratif",
      color: "gray",
      canAutoSelect: false,
    };
  }

  // Determine confidence level and auto-select capability
  if (overallConfidence >= 0.9 && validation.isValid) {
    return {
      isSynced: true,
      confidence: overallConfidence,
      matchType: "exact",
      message: "Lokasi otomatis terdeteksi dengan akurat",
      color: "green",
      canAutoSelect: true,
    };
  } else if (overallConfidence >= 0.7) {
    return {
      isSynced: true,
      confidence: overallConfidence,
      matchType: "synonym",
      message: "Lokasi terdeteksi, silakan periksa keakuratan",
      color: "yellow",
      canAutoSelect: true,
    };
  } else {
    return {
      isSynced: true,
      confidence: overallConfidence,
      matchType: "fuzzy",
      message: "Lokasi terdeteksi dengan keakuratan rendah",
      color: "red",
      canAutoSelect: false,
    };
  }
}

/**
 * Apply enhanced geocoding response to form
 */
export function applyEnhancedGeocodingToForm(
  enhancedResponse: EnhancedGeocodingResponse,
  form: any, // UseFormReturn<CreateReportInput>
  syncStatus: AdministrativeSyncStatus,
): {
  applied: boolean;
  appliedFields: string[];
  skippedFields: string[];
} {
  const appliedFields: string[] = [];
  const skippedFields: string[] = [];

  // Only apply if we can auto-select
  if (!syncStatus.canAutoSelect) {
    return {
      applied: false,
      appliedFields: [],
      skippedFields: ["province", "regency", "district"],
    };
  }

  // Apply province
  if (
    enhancedResponse.administrative.province.code &&
    enhancedResponse.administrative.province.name
  ) {
    form.setValue(
      "province_code",
      enhancedResponse.administrative.province.code,
    );
    form.setValue("province", enhancedResponse.administrative.province.name);
    appliedFields.push("province");
  } else {
    skippedFields.push("province");
  }

  // Apply regency
  if (
    enhancedResponse.administrative.regency.code &&
    enhancedResponse.administrative.regency.name
  ) {
    form.setValue("regency_code", enhancedResponse.administrative.regency.code);
    form.setValue("city", enhancedResponse.administrative.regency.name);
    appliedFields.push("regency");
  } else {
    skippedFields.push("regency");
  }

  // Apply district
  if (
    enhancedResponse.administrative.district.code &&
    enhancedResponse.administrative.district.name
  ) {
    form.setValue(
      "district_code",
      enhancedResponse.administrative.district.code,
    );
    form.setValue("district", enhancedResponse.administrative.district.name);
    appliedFields.push("district");
  } else {
    skippedFields.push("district");
  }

  return {
    applied: appliedFields.length > 0,
    appliedFields,
    skippedFields,
  };
}

/**
 * Get confidence level description for UI
 */
export function getConfidenceDescription(confidence: number): {
  level: "high" | "medium" | "low";
  description: string;
  icon: string;
} {
  if (confidence >= 0.9) {
    return {
      level: "high",
      description: "Sangat Akurat",
      icon: "✅",
    };
  } else if (confidence >= 0.7) {
    return {
      level: "medium",
      description: "Cukup Akurat",
      icon: "⚠️",
    };
  } else {
    return {
      level: "low",
      description: "Kurang Akurat",
      icon: "❌",
    };
  }
}

/**
 * Get match type description for UI
 */
export function getMatchTypeDescription(
  matchType: "exact" | "synonym" | "fuzzy" | "none",
): {
  description: string;
  icon: string;
} {
  switch (matchType) {
    case "exact":
      return { description: "Cocok Sempurna", icon: "🎯" };
    case "synonym":
      return { description: "Cocok dengan Variasi", icon: "🔄" };
    case "fuzzy":
      return { description: "Cocok dengan Perkiraan", icon: "🔍" };
    case "none":
      return { description: "Tidak Ditemukan", icon: "❓" };
    default:
      return { description: "Tidak Diketahui", icon: "❓" };
  }
}

/**
 * Process Nominatim address structure using API-based search
 *
 * Leverages the new search endpoints to find administrative matches
 * using fuzzy matching with hierarchical validation.
 */
export async function processNominatimAddressWithAPI(
  geocodingResponse: CurrentGeocodingResponse,
): Promise<EnhancedGeocodingResponse> {
  const results = {
    province: {
      code: null as string | null,
      name: null as string | null,
      confidence: 0,
      matchType: "none" as "exact" | "synonym" | "fuzzy" | "none",
    },
    regency: {
      code: null as string | null,
      name: null as string | null,
      confidence: 0,
      matchType: "none" as "exact" | "synonym" | "fuzzy" | "none",
    },
    district: {
      code: null as string | null,
      name: null as string | null,
      confidence: 0,
      matchType: "none" as "exact" | "synonym" | "fuzzy" | "none",
    },
  };

  try {
    // Step 1: Search for province using API
    if (geocodingResponse.province) {
      const provinceMatch = await administrativeService.searchProvinces(
        geocodingResponse.province,
      );
      if (provinceMatch) {
        results.province = {
          code: provinceMatch.code,
          name: provinceMatch.name,
          confidence: calculateMatchConfidence(
            geocodingResponse.province,
            provinceMatch.name,
          ),
          matchType: getMatchType(
            geocodingResponse.province,
            provinceMatch.name,
          ),
        };

        // Step 2: Search for regency within found province
        if (geocodingResponse.city && results.province.code) {
          const regencyMatch = await administrativeService.searchRegencies(
            geocodingResponse.city,
            results.province.code,
          );
          if (regencyMatch) {
            results.regency = {
              code: regencyMatch.code,
              name: regencyMatch.name,
              confidence: calculateMatchConfidence(
                geocodingResponse.city,
                regencyMatch.name,
              ),
              matchType: getMatchType(
                geocodingResponse.city,
                regencyMatch.name,
              ),
            };

            // Step 3: Search for district within found regency
            if (geocodingResponse.district && results.regency.code) {
              const districtMatch = await administrativeService.searchDistricts(
                geocodingResponse.district,
                results.regency.code,
              );
              if (districtMatch) {
                results.district = {
                  code: districtMatch.code,
                  name: districtMatch.name,
                  confidence: calculateMatchConfidence(
                    geocodingResponse.district,
                    districtMatch.name,
                  ),
                  matchType: getMatchType(
                    geocodingResponse.district,
                    districtMatch.name,
                  ),
                };
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error processing Nominatim address with API:", error);
  }

  // Calculate overall confidence
  const confidenceScores = [
    results.province.confidence,
    results.regency.confidence,
    results.district.confidence,
  ].filter((score) => score > 0);

  const overallConfidence =
    confidenceScores.length > 0
      ? confidenceScores.reduce((sum, score) => sum + score, 0) /
        confidenceScores.length
      : 0;

  // Create enhanced response
  const enhancedResponse: EnhancedGeocodingResponse = {
    ...geocodingResponse,
    administrative: results,
    overallConfidence,
    validation: {
      isValid: true,
      issues: [],
    },
  };

  // Validate hierarchical relationships
  const validation = validateAPIBasedHierarchy(enhancedResponse);
  enhancedResponse.validation = validation;

  return enhancedResponse;
}

/**
 * Calculate match confidence between search term and result
 */
function calculateMatchConfidence(
  searchTerm: string,
  resultName: string,
): number {
  if (!searchTerm || !resultName) return 0;

  const search = searchTerm.toLowerCase().trim();
  const result = resultName.toLowerCase().trim();

  // Exact match
  if (search === result) return 1.0;

  // One contains the other
  if (search.includes(result) || result.includes(search)) return 0.8;

  // Partial similarity (simple Levenshtein-like approach)
  const maxLength = Math.max(search.length, result.length);
  const minLength = Math.min(search.length, result.length);

  // Basic similarity calculation
  let commonChars = 0;
  for (let i = 0; i < minLength; i++) {
    if (search[i] === result[i]) commonChars++;
  }

  return Math.max(0.3, commonChars / maxLength);
}

/**
 * Determine match type based on search term and result
 */
function getMatchType(
  searchTerm: string,
  resultName: string,
): "exact" | "synonym" | "fuzzy" | "none" {
  if (!searchTerm || !resultName) return "none";

  const search = searchTerm.toLowerCase().trim();
  const result = resultName.toLowerCase().trim();

  // Exact match
  if (search === result) return "exact";

  // Common synonyms for Indonesian administrative names
  const synonymMap: Record<string, string[]> = {
    bekasi: ["kota bekasi", "kabupaten bekasi"],
    jakarta: [
      "dki jakarta",
      "jakarta pusat",
      "jakarta selatan",
      "jakarta barat",
      "jakarta utara",
      "jakarta timur",
    ],
    bandung: ["kota bandung", "kabupaten bandung"],
    bogor: ["kota bogor", "kabupaten bogor"],
    depok: ["kota depok"],
    tangerang: ["kota tangerang", "kabupaten tangerang"],
  };

  // Check for known synonyms
  const searchKey = search.replace(/^(kota|kabupaten|dki)\s+/, "");
  const resultKey = result.replace(/^(kota|kabupaten|dki)\s+/, "");

  if (
    synonymMap[searchKey]?.some((synonym) => synonym.includes(resultKey)) ||
    synonymMap[resultKey]?.some((synonym) => synonym.includes(searchKey))
  ) {
    return "synonym";
  }

  // Contains match
  if (search.includes(result) || result.includes(search)) return "synonym";

  // Otherwise it's fuzzy
  return "fuzzy";
}

/**
 * Validate hierarchical relationships for API-based results
 */
function validateAPIBasedHierarchy(response: EnhancedGeocodingResponse): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Since we're using API-based search with hierarchical constraints,
  // the hierarchy should automatically be valid if we found matches
  // But we can still validate the logic flow

  if (
    response.administrative.regency.code &&
    !response.administrative.province.code
  ) {
    issues.push(
      "Regency found without province - this should not happen with API-based search",
    );
  }

  if (
    response.administrative.district.code &&
    !response.administrative.regency.code
  ) {
    issues.push(
      "District found without regency - this should not happen with API-based search",
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

export default {
  processGeocodingResponse,
  processNominatimAddressWithAPI,
  getAdministrativeSyncStatus,
  applyEnhancedGeocodingToForm,
  getConfidenceDescription,
  getMatchTypeDescription,
};
