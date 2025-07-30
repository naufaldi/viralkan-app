/**
 * Administrative Select Synchronization Analysis - Phase 1
 *
 * This document analyzes the data structures between geocoding service and administrative select
 * to identify synchronization issues and propose solutions.
 *
 * Following Viralkan Design System 2.0 & Frontend Development Guidelines
 */

// ============================================================================
// 1. CURRENT GEOCODING SERVICE DATA STRUCTURE
// ============================================================================

/**
 * Current geocoding response structure from Nominatim API
 * Source: apps/web/lib/services/geocoding.ts
 */
export interface CurrentGeocodingResponse {
  // Core location data
  lat?: number;
  lon?: number;
  street_name?: string;

  // Administrative boundaries (from Nominatim parsing)
  district?: string; // From: suburb, village, city_district, neighbourhood
  city?: string; // From: city, regency, county
  province?: string; // From: state
  country?: string; // Default: "Indonesia"

  // Metadata
  geocoded_at?: string;
  geocoding_source?: "exif" | "nominatim" | "manual";
}

/**
 * Nominatim API raw response structure
 * Source: OpenStreetMap Nominatim API
 */
export interface NominatimRawResponse {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    village?: string;
    city_district?: string;
    neighbourhood?: string;
    city?: string;
    regency?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

// ============================================================================
// 2. CURRENT ADMINISTRATIVE SELECT DATA STRUCTURE
// ============================================================================

/**
 * Administrative data structure from API
 * Source: apps/web/services/api-client.ts
 */
export interface Province {
  code: string; // e.g., "32" for Jawa Barat
  name: string; // e.g., "Jawa Barat"
}

export interface Regency {
  code: string; // e.g., "3275" for Kota Bekasi
  name: string; // e.g., "Kota Bekasi"
  province_code: string; // e.g., "32"
}

export interface District {
  code: string; // e.g., "327501" for Bekasi Barat
  name: string; // e.g., "Bekasi Barat"
  regency_code: string; // e.g., "3275"
}

/**
 * Administrative select component data structure
 * Source: apps/web/hooks/reports/use-administrative.ts
 */
export interface AdministrativeData {
  provinces: Province[];
  regencies: Regency[];
  districts: District[];
}

// ============================================================================
// 3. DATA STRUCTURE ANALYSIS & MISMATCHES
// ============================================================================

/**
 * Identified naming inconsistencies and data gaps
 */
export interface DataStructureAnalysis {
  // Naming inconsistencies between geocoding and administrative data
  namingInconsistencies: {
    province: {
      geocoding: string[]; // e.g., ["Jawa Barat"]
      administrative: string[]; // e.g., ["Jawa Barat"]
      confidence: "HIGH" | "MEDIUM" | "LOW";
    };
    regency: {
      geocoding: string[]; // e.g., ["Bekasi", "Kota Bekasi"]
      administrative: string[]; // e.g., ["Kota Bekasi", "Kabupaten Bekasi"]
      confidence: "HIGH" | "MEDIUM" | "LOW";
    };
    district: {
      geocoding: string[]; // e.g., ["Makrik", "Bekasi Barat"]
      administrative: string[]; // e.g., ["Bekasi Barat", "Bekasi Utara"]
      confidence: "HIGH" | "MEDIUM" | "LOW";
    };
  };

  // Missing data in geocoding response
  missingData: {
    province_code: boolean; // ❌ Geocoding doesn't return codes
    regency_code: boolean; // ❌ Geocoding doesn't return codes
    district_code: boolean; // ❌ Geocoding doesn't return codes
    hierarchical_validation: boolean; // ❌ No validation of parent-child relationships
  };

  // Search and matching limitations
  searchLimitations: {
    exact_match_only: boolean; // ❌ No fuzzy matching
    case_sensitive: boolean; // ❌ Case sensitivity issues
    partial_match: boolean; // ❌ No partial matching
    synonym_handling: boolean; // ❌ No synonym mapping
  };
}

// ============================================================================
// 4. SPECIFIC MISMATCH EXAMPLES
// ============================================================================

/**
 * Real-world examples of data mismatches
 */
export const MismatchExamples = {
  // Example 1: Bekasi naming inconsistency
  bekasi: {
    geocodingResponse: {
      street_name: "Jalan Lumbu Timur IV",
      district: "Makrik",
      city: "Bekasi", // ❌ Just "Bekasi"
      province: "Jawa Barat",
    },
    administrativeData: {
      province: { code: "32", name: "Jawa Barat" },
      regency: { code: "3275", name: "Kota Bekasi" }, // ❌ "Kota Bekasi"
      district: { code: "327501", name: "Bekasi Barat" }, // ❌ Different district
    },
    issues: [
      "City name mismatch: 'Bekasi' vs 'Kota Bekasi'",
      "District name mismatch: 'Makrik' vs 'Bekasi Barat'",
      "Missing administrative codes in geocoding response",
    ],
  },

  // Example 2: Jakarta naming inconsistency
  jakarta: {
    geocodingResponse: {
      street_name: "Jalan Sudirman",
      district: "Menteng",
      city: "Jakarta", // ❌ Just "Jakarta"
      province: "DKI Jakarta",
    },
    administrativeData: {
      province: { code: "31", name: "DKI Jakarta" },
      regency: { code: "3171", name: "Kota Jakarta Pusat" }, // ❌ "Kota Jakarta Pusat"
      district: { code: "317101", name: "Menteng" },
    },
    issues: [
      "City name mismatch: 'Jakarta' vs 'Kota Jakarta Pusat'",
      "Missing administrative codes in geocoding response",
    ],
  },
};

// ============================================================================
// 5. SEARCH FUNCTIONALITY ANALYSIS
// ============================================================================

/**
 * Current search functionality in administrative select
 * Source: apps/web/components/reports/administrative-select.tsx
 */
export interface SearchFunctionalityAnalysis {
  // Current search implementation
  currentSearch: {
    method: "ComboboxField search"; // Uses shadcn/ui ComboboxField
    searchValue: string; // Uses name field for search
    matching: "exact" | "contains" | "fuzzy";
    caseSensitive: boolean;
    partialMatch: boolean;
  };

  // Limitations identified
  limitations: [
    "No fuzzy matching algorithm",
    "No synonym mapping (e.g., 'Bekasi' = 'Kota Bekasi')",
    "No confidence scoring for matches",
    "No fallback search strategies",
    "Case sensitivity may cause issues",
    "No normalization of search terms",
  ];

  // Required improvements
  improvements: [
    "Implement fuzzy matching with confidence scoring",
    "Add synonym mapping for common variations",
    "Create normalized search terms",
    "Add multiple search strategies with fallbacks",
    "Implement hierarchical validation",
    "Add visual feedback for match confidence",
  ];
}

// ============================================================================
// 6. PHASE 1 FINDINGS SUMMARY
// ============================================================================

/**
 * Key findings from Phase 1 analysis
 */
export const Phase1Findings = {
  // Data structure gaps
  dataStructureGaps: {
    geocodingMissingCodes: true, // No administrative codes returned
    inconsistentNaming: true, // Different naming conventions
    missingHierarchicalValidation: true, // No parent-child relationship validation
    noConfidenceScoring: true, // No match quality indicators
  },

  // Search functionality gaps
  searchFunctionalityGaps: {
    noFuzzyMatching: true, // Only exact/contains matching
    noSynonymMapping: true, // No handling of naming variations
    noNormalization: true, // No text normalization
    noFallbackStrategies: true, // No multiple search approaches
  },

  // User experience gaps
  userExperienceGaps: {
    noVisualFeedback: true, // No indication of auto-fill status
    noConfidenceIndicators: true, // No match quality feedback
    noManualOverride: true, // No easy correction options
    confusingState: true, // Form values set but UI not updated
  },

  // Priority issues for Phase 2
  priorityIssues: [
    "Implement fuzzy matching algorithm",
    "Add synonym mapping for administrative names",
    "Create confidence scoring system",
    "Add visual feedback for auto-fill status",
    "Implement hierarchical validation",
    "Add manual override capabilities",
  ],
};

// ============================================================================
// 7. RECOMMENDATIONS FOR PHASE 2
// ============================================================================

/**
 * Technical recommendations for Phase 2 implementation
 */
export const Phase2Recommendations = {
  // Data mapping improvements
  dataMapping: {
    createNormalizedMapping: true, // Standardize naming conventions
    implementSynonymDictionary: true, // Map common variations
    addConfidenceScoring: true, // Score match quality
    createHierarchicalValidation: true, // Validate parent-child relationships
  },

  // Search algorithm improvements
  searchAlgorithm: {
    implementFuzzyMatching: true, // Use similarity algorithms
    addMultipleSearchStrategies: true, // Exact > Contains > Fuzzy
    createNormalizedSearchTerms: true, // Standardize search input
    addFallbackMechanisms: true, // Handle edge cases
  },

  // User experience improvements
  userExperience: {
    addVisualStatusIndicators: true, // Show auto-fill status
    implementConfidenceFeedback: true, // Display match quality
    createManualOverrideOptions: true, // Easy correction interface
    addProgressiveDisclosure: true, // Show options based on confidence
  },

  // API integration improvements
  apiIntegration: {
    enhanceGeocodingResponse: true, // Return more structured data
    addAdministrativeCodes: true, // Include codes in response
    implementDataValidation: true, // Validate response consistency
    createFallbackMechanisms: true, // Handle API failures
  },
};

export default {
  Phase1Findings,
  Phase2Recommendations,
  MismatchExamples,
};
