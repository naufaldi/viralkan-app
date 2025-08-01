/**
 * Fuzzy Matching Utility for Administrative Names
 *
 * Implements multiple string similarity algorithms with confidence scoring
 * for matching geocoding responses to administrative select options.
 *
 * Following Viralkan Design System 2.0 & Frontend Development Guidelines
 */

// ============================================================================
// 1. STRING SIMILARITY ALGORITHMS
// ============================================================================

/**
 * Calculate Levenshtein distance between two strings
 * Lower distance = higher similarity
 */
function calculateLevenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0]![j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1, // substitution
          matrix[i]![j - 1]! + 1, // insertion
          matrix[i - 1]![j]! + 1, // deletion
        );
      }
    }
  }

  return matrix[str2.length]![str1.length]!;
}

/**
 * Calculate Jaro-Winkler similarity
 * Better for short strings and names
 */
function calculateJaroWinklerSimilarity(str1: string, str2: string): number {
  const normalize = (str: string) => str.toLowerCase().trim();
  const s1 = normalize(str1);
  const s2 = normalize(str2);

  if (s1 === s2) return 1.0;

  const matchWindow = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  if (matchWindow < 0) return 0.0;

  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  // Find matches
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  // Count transpositions
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro =
    (matches / s1.length +
      matches / s2.length +
      (matches - transpositions / 2) / matches) /
    3;

  // Winkler modification
  let prefix = 0;
  const maxPrefix = Math.min(4, Math.min(s1.length, s2.length));
  for (let i = 0; i < maxPrefix; i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  return jaro + 0.1 * prefix * (1 - jaro);
}

/**
 * Calculate normalized similarity score
 * Combines multiple algorithms for better accuracy
 */
function calculateNormalizedSimilarity(str1: string, str2: string): number {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();
  const n1 = normalize(str1);
  const n2 = normalize(str2);

  if (n1 === n2) return 1.0;
  if (n1.includes(n2) || n2.includes(n1)) return 0.95;

  const levenshtein = calculateLevenshteinDistance(n1, n2);
  const maxLength = Math.max(n1.length, n2.length);
  const levenshteinSimilarity = 1 - levenshtein / maxLength;

  const jaroWinkler = calculateJaroWinklerSimilarity(n1, n2);

  // Weighted combination
  return levenshteinSimilarity * 0.4 + jaroWinkler * 0.6;
}

// ============================================================================
// 2. SYNONYM DICTIONARY FOR INDONESIAN ADMINISTRATIVE NAMES
// ============================================================================

/**
 * Indonesian administrative name synonyms
 * Maps common variations to standardized names
 */
export const ADMINISTRATIVE_SYNONYMS: Record<string, string[]> = {
  // Provinces
  "jawa barat": ["jabar", "west java", "jawa barat"],
  "dki jakarta": [
    "jakarta",
    "jakarta raya",
    "daerah khusus ibukota jakarta",
    "dki",
  ],
  "jawa timur": ["jatim", "east java", "jawa timur"],
  "jawa tengah": ["jateng", "central java", "jawa tengah"],
  banten: ["banten"],
  lampung: ["lampung"],
  "sumatera selatan": ["sumsel", "south sumatra", "sumatera selatan"],
  "sumatera utara": ["sumut", "north sumatra", "sumatera utara"],
  aceh: ["daerah istimewa aceh", "nanggroe aceh darussalam", "nad"],
  bali: ["bali"],
  "kalimantan barat": ["kalbar", "west kalimantan", "kalimantan barat"],
  "kalimantan timur": ["kaltim", "east kalimantan", "kalimantan timur"],
  "sulawesi selatan": ["sulsel", "south sulawesi", "sulawesi selatan"],
  "sulawesi utara": ["sulut", "north sulawesi", "sulawesi utara"],
  papua: ["papua", "papua barat", "west papua"],

  // Regency/City patterns
  kota: ["city", "kotamadya", "kotamadya"],
  kabupaten: ["regency", "kab", "kabupaten"],

  // Common city variations
  "kota bekasi": ["bekasi", "bekasi kota", "kotamadya bekasi"],
  "kota jakarta pusat": [
    "jakarta pusat",
    "jakarta",
    "jakpus",
    "kotamadya jakarta pusat",
  ],
  "kota jakarta selatan": [
    "jakarta selatan",
    "jaksel",
    "kotamadya jakarta selatan",
  ],
  "kota jakarta utara": ["jakarta utara", "jakut", "kotamadya jakarta utara"],
  "kota jakarta barat": ["jakarta barat", "jakbar", "kotamadya jakarta barat"],
  "kota jakarta timur": ["jakarta timur", "jaktim", "kotamadya jakarta timur"],
  "kota surabaya": ["surabaya", "kotamadya surabaya"],
  "kota bandung": ["bandung", "kotamadya bandung"],
  "kota semarang": ["semarang", "kotamadya semarang"],
  "kota yogyakarta": ["yogyakarta", "jogja", "kotamadya yogyakarta"],
  "kota medan": ["medan", "kotamadya medan"],
  "kota palembang": ["palembang", "kotamadya palembang"],
  "kota makassar": ["makassar", "kotamadya makassar"],
  "kota denpasar": ["denpasar", "kotamadya denpasar"],

  // Common district variations
  "bekasi barat": ["bekasi barat", "bekasi-barat"],
  "bekasi timur": ["bekasi timur", "bekasi-timur"],
  "bekasi utara": ["bekasi utara", "bekasi-utara"],
  "bekasi selatan": ["bekasi selatan", "bekasi-selatan"],
  menteng: ["menteng"],
  "tanah abang": ["tanah abang"],
  kemayoran: ["kemayoran"],
  genteng: ["genteng"],
  gubeng: ["gubeng"],
  tegalsari: ["tegalsari"],
  wonokromo: ["wonokromo"],
};

/**
 * Find synonym for a given administrative name
 */
function findSynonym(searchTerm: string): string[] {
  const normalized = searchTerm.toLowerCase().trim();

  // Direct match
  if (ADMINISTRATIVE_SYNONYMS[normalized]) {
    return ADMINISTRATIVE_SYNONYMS[normalized];
  }

  // Partial match
  for (const [key, synonyms] of Object.entries(ADMINISTRATIVE_SYNONYMS)) {
    if (synonyms.includes(normalized)) {
      return synonyms;
    }
  }

  return [normalized]; // Return original if no synonym found
}

// ============================================================================
// 3. FUZZY MATCHING WITH CONFIDENCE SCORING
// ============================================================================

/**
 * Match result with confidence scoring
 */
export interface FuzzyMatchResult {
  found: boolean;
  match: string | null;
  code: string | null;
  confidence: number;
  matchType: "exact" | "synonym" | "fuzzy" | "none";
  alternatives: Array<{
    match: string;
    code: string;
    confidence: number;
  }>;
}

/**
 * Administrative option interface
 */
export interface AdministrativeOption {
  code: string;
  name: string;
  searchValue?: string;
  province_code?: string;
  regency_code?: string;
}

/**
 * Fuzzy match administrative name with confidence scoring
 */
export function fuzzyMatchAdministrative(
  searchTerm: string | null,
  options: AdministrativeOption[],
  type: "province" | "regency" | "district" = "regency",
): FuzzyMatchResult {
  if (!searchTerm || !searchTerm.trim()) {
    return {
      found: false,
      match: null,
      code: null,
      confidence: 0,
      matchType: "none",
      alternatives: [],
    };
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();
  const synonyms = findSynonym(normalizedSearch);
  const allSearchTerms = [normalizedSearch, ...synonyms];

  let bestMatch: FuzzyMatchResult = {
    found: false,
    match: null,
    code: null,
    confidence: 0,
    matchType: "none",
    alternatives: [],
  };

  const allMatches: Array<{
    match: string;
    code: string;
    confidence: number;
    matchType: "exact" | "synonym" | "fuzzy";
  }> = [];

  // Test all options against all search terms
  for (const option of options) {
    const optionName = option.name.toLowerCase().trim();
    const optionSearchValue =
      option.searchValue?.toLowerCase().trim() || optionName;

    for (const searchTerm of allSearchTerms) {
      let confidence = 0;
      let matchType: "exact" | "synonym" | "fuzzy" = "fuzzy";

      // Exact match
      if (optionName === searchTerm || optionSearchValue === searchTerm) {
        confidence = 1.0;
        matchType = "exact";
      }
      // Contains match
      else if (
        optionName.includes(searchTerm) ||
        searchTerm.includes(optionName)
      ) {
        confidence = 0.9;
        matchType = "synonym";
      }
      // Fuzzy match
      else {
        confidence = calculateNormalizedSimilarity(searchTerm, optionName);
        if (confidence < 0.7) continue; // Skip low confidence matches
      }

      allMatches.push({
        match: option.name,
        code: option.code,
        confidence,
        matchType,
      });
    }
  }

  // Sort by confidence and remove duplicates
  const uniqueMatches = allMatches
    .sort((a, b) => b.confidence - a.confidence)
    .filter(
      (match, index, arr) =>
        arr.findIndex((m) => m.code === match.code) === index,
    );

  if (uniqueMatches.length > 0) {
    const best = uniqueMatches[0]!;
    bestMatch = {
      found: true,
      match: best.match,
      code: best.code,
      confidence: best.confidence,
      matchType: best.matchType,
      alternatives: uniqueMatches.slice(1, 5).map((m) => ({
        match: m.match,
        code: m.code,
        confidence: m.confidence,
      })),
    };
  }

  return bestMatch;
}

/**
 * Batch fuzzy match multiple administrative names
 */
export function batchFuzzyMatch(
  geocodingData: {
    province?: string;
    city?: string;
    district?: string;
  },
  administrativeData: {
    provinces: AdministrativeOption[];
    regencies: AdministrativeOption[];
    districts: AdministrativeOption[];
  },
): {
  province: FuzzyMatchResult;
  regency: FuzzyMatchResult;
  district: FuzzyMatchResult;
  overallConfidence: number;
} {
  const provinceMatch = fuzzyMatchAdministrative(
    geocodingData.province ?? null,
    administrativeData.provinces,
    "province",
  );

  const regencyMatch = fuzzyMatchAdministrative(
    geocodingData.city ?? null,
    administrativeData.regencies,
    "regency",
  );

  const districtMatch = fuzzyMatchAdministrative(
    geocodingData.district ?? null,
    administrativeData.districts,
    "district",
  );

  // Calculate overall confidence
  const matches = [provinceMatch, regencyMatch, districtMatch].filter(
    (m) => m.found,
  );
  const overallConfidence =
    matches.length > 0
      ? matches.reduce((sum, match) => sum + match.confidence, 0) /
        matches.length
      : 0;

  return {
    province: provinceMatch,
    regency: regencyMatch,
    district: districtMatch,
    overallConfidence,
  };
}

// ============================================================================
// 4. UTILITY FUNCTIONS
// ============================================================================

/**
 * Normalize administrative name for consistent comparison
 */
export function normalizeAdministrativeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Get confidence level description
 */
export function getConfidenceLevel(confidence: number): {
  level: "high" | "medium" | "low";
  description: string;
  color: string;
} {
  if (confidence >= 0.9) {
    return {
      level: "high",
      description: "Sangat Akurat",
      color: "text-green-600",
    };
  } else if (confidence >= 0.7) {
    return {
      level: "medium",
      description: "Cukup Akurat",
      color: "text-yellow-600",
    };
  } else {
    return {
      level: "low",
      description: "Kurang Akurat",
      color: "text-red-600",
    };
  }
}

/**
 * Validate hierarchical relationships
 */
export function validateHierarchicalMatch(
  provinceMatch: FuzzyMatchResult,
  regencyMatch: FuzzyMatchResult,
  districtMatch: FuzzyMatchResult,
  administrativeData: {
    provinces: AdministrativeOption[];
    regencies: AdministrativeOption[];
    districts: AdministrativeOption[];
  },
): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check if regency belongs to province
  if (provinceMatch.found && regencyMatch.found) {
    const regency = administrativeData.regencies.find(
      (r) => r.code === regencyMatch.code,
    );
    if (
      regency &&
      regency.province_code &&
      regency.province_code !== provinceMatch.code
    ) {
      issues.push(
        `Regency ${regencyMatch.match} does not belong to province ${provinceMatch.match}`,
      );
    }
  }

  // Check if district belongs to regency
  if (regencyMatch.found && districtMatch.found) {
    const district = administrativeData.districts.find(
      (d) => d.code === districtMatch.code,
    );
    if (
      district &&
      district.regency_code &&
      district.regency_code !== regencyMatch.code
    ) {
      issues.push(
        `District ${districtMatch.match} does not belong to regency ${regencyMatch.match}`,
      );
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

export default {
  fuzzyMatchAdministrative,
  batchFuzzyMatch,
  normalizeAdministrativeName,
  getConfidenceLevel,
  validateHierarchicalMatch,
};
