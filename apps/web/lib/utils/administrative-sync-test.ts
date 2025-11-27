/**
 * Administrative Sync Test Utility - Phase 1 Validation
 *
 * This utility tests actual geocoding responses against administrative data
 * to validate our Phase 1 findings and identify specific mismatches.
 *
 * Following Viralkan Design System 2.0 & Frontend Development Guidelines
 */

import {
  reverseGeocode,
  forwardGeocode,
  reverseGeocodeWithNominatimData,
} from "../services/geocoding";
import { administrativeService } from "../../services/administrative";
import { processNominatimAddressWithAPI } from "./enhanced-geocoding-handler";
import type {
  CurrentGeocodingResponse,
  Province,
  Regency,
  District,
} from "../types/administrative-sync-analysis";

/**
 * Test case structure for validation
 */
export interface AdministrativeSyncTestCase {
  name: string;
  description: string;
  coordinates?: { lat: number; lon: number };
  address?: string;
  expectedMatch: {
    province: string;
    regency: string;
    district: string;
  };
}

/**
 * Test result structure
 */
export interface AdministrativeSyncTestResult {
  testCase: AdministrativeSyncTestCase;
  geocodingResponse: CurrentGeocodingResponse | null;
  administrativeData: {
    provinces: Province[];
    regencies: Regency[];
    districts: District[];
  };
  matches: {
    province: {
      found: boolean;
      geocodingName: string | null;
      administrativeName: string | null;
      code: string | null;
      confidence: number;
    };
    regency: {
      found: boolean;
      geocodingName: string | null;
      administrativeName: string | null;
      code: string | null;
      confidence: number;
    };
    district: {
      found: boolean;
      geocodingName: string | null;
      administrativeName: string | null;
      code: string | null;
      confidence: number;
    };
  };
  issues: string[];
  success: boolean;
}

/**
 * Test cases based on real Indonesian addresses
 */
export const testCases: AdministrativeSyncTestCase[] = [
  {
    name: "Bekasi Example",
    description: "Test Bekasi address with known naming inconsistencies",
    coordinates: { lat: -6.2383, lon: 106.9756 }, // Bekasi coordinates
    expectedMatch: {
      province: "Jawa Barat",
      regency: "Kota Bekasi",
      district: "Bekasi Barat",
    },
  },
  {
    name: "Jakarta Example",
    description: "Test Jakarta address with city/regency naming issues",
    coordinates: { lat: -6.2088, lon: 106.8456 }, // Jakarta coordinates
    expectedMatch: {
      province: "DKI Jakarta",
      regency: "Kota Jakarta Pusat",
      district: "Menteng",
    },
  },
  {
    name: "Surabaya Example",
    description: "Test Surabaya address with forward geocoding",
    address: "Jalan Tunjungan, Surabaya, Jawa Timur",
    expectedMatch: {
      province: "Jawa Timur",
      regency: "Kota Surabaya",
      district: "Genteng",
    },
  },
];

/**
 * Simple string similarity function for testing
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const normalize = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalized1 = normalize(str1);
  const normalized2 = normalize(str2);

  if (normalized1 === normalized2) return 1.0;
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1))
    return 0.8;

  // Simple Levenshtein-like similarity
  const longer =
    normalized1.length > normalized2.length ? normalized1 : normalized2;
  const shorter =
    normalized1.length > normalized2.length ? normalized2 : normalized1;

  if (longer.length === 0) return 1.0;

  const editDistance = longer.length - shorter.length;
  const similarity = (longer.length - editDistance) / longer.length;

  return Math.max(0, similarity);
}

/**
 * Find best match for administrative name
 */
function findBestMatch(
  searchName: string | null,
  options: Array<{ name: string; code: string }>,
): {
  found: boolean;
  name: string | null;
  code: string | null;
  confidence: number;
} {
  if (!searchName) {
    return { found: false, name: null, code: null, confidence: 0 };
  }

  let bestMatch = {
    name: null as string | null,
    code: null as string | null,
    confidence: 0,
  };

  for (const option of options) {
    const similarity = calculateStringSimilarity(searchName, option.name);

    if (similarity > bestMatch.confidence) {
      bestMatch = {
        name: option.name,
        code: option.code,
        confidence: similarity,
      };
    }
  }

  return {
    found: bestMatch.confidence > 0.7,
    name: bestMatch.name,
    code: bestMatch.code,
    confidence: bestMatch.confidence,
  };
}

/**
 * Run a single test case
 */
export async function runAdministrativeSyncTest(
  testCase: AdministrativeSyncTestCase,
): Promise<AdministrativeSyncTestResult> {
  const result: AdministrativeSyncTestResult = {
    testCase,
    geocodingResponse: null,
    administrativeData: {
      provinces: [],
      regencies: [],
      districts: [],
    },
    matches: {
      province: {
        found: false,
        geocodingName: null,
        administrativeName: null,
        code: null,
        confidence: 0,
      },
      regency: {
        found: false,
        geocodingName: null,
        administrativeName: null,
        code: null,
        confidence: 0,
      },
      district: {
        found: false,
        geocodingName: null,
        administrativeName: null,
        code: null,
        confidence: 0,
      },
    },
    issues: [],
    success: false,
  };

  try {
    // Step 1: Get geocoding response
    let geocodingResult;
    if (testCase.coordinates) {
      geocodingResult = await reverseGeocode(
        testCase.coordinates.lat,
        testCase.coordinates.lon,
      );
    } else if (testCase.address) {
      geocodingResult = await forwardGeocode(testCase.address);
    } else {
      throw new Error("No coordinates or address provided");
    }

    if (!geocodingResult.success || !geocodingResult.data) {
      result.issues.push(
        `Geocoding failed: ${geocodingResult.error?.message || "Unknown error"}`,
      );
      return result;
    }

    result.geocodingResponse = geocodingResult.data;

    // Step 2: Get administrative data
    try {
      const provincesResponse = await administrativeService.getProvinces();
      result.administrativeData.provinces = provincesResponse;

      // For now, we'll use a sample of regencies and districts
      // In a full implementation, we'd fetch based on the geocoding response
      const sampleRegenciesResponse =
        await administrativeService.getRegencies("32"); // Jawa Barat
      result.administrativeData.regencies = sampleRegenciesResponse;

      if (sampleRegenciesResponse.length > 0) {
        const sampleDistrictsResponse =
          await administrativeService.getDistricts(
            sampleRegenciesResponse[0]?.code || "",
          );
        result.administrativeData.districts = sampleDistrictsResponse;
      }
    } catch (error) {
      result.issues.push(
        `Failed to fetch administrative data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    // Step 3: Test matches
    const geocodingData = geocodingResult.data;

    // Test province match
    const provinceMatch = findBestMatch(
      geocodingData.province || null,
      result.administrativeData.provinces,
    );
    result.matches.province = {
      ...provinceMatch,
      geocodingName: geocodingData.province || null,
      administrativeName: provinceMatch.name,
    };

    // Test regency match
    const regencyMatch = findBestMatch(
      geocodingData.city || null,
      result.administrativeData.regencies,
    );
    result.matches.regency = {
      ...regencyMatch,
      geocodingName: geocodingData.city || null,
      administrativeName: regencyMatch.name,
    };

    // Test district match
    const districtMatch = findBestMatch(
      geocodingData.district || null,
      result.administrativeData.districts,
    );
    result.matches.district = {
      ...districtMatch,
      geocodingName: geocodingData.district || null,
      administrativeName: districtMatch.name,
    };

    // Step 4: Identify issues
    if (!result.matches.province.found) {
      result.issues.push(
        `Province not found: "${geocodingData.province}" (expected: "${testCase.expectedMatch.province}")`,
      );
    }

    if (!result.matches.regency.found) {
      result.issues.push(
        `Regency not found: "${geocodingData.city}" (expected: "${testCase.expectedMatch.regency}")`,
      );
    }

    if (!result.matches.district.found) {
      result.issues.push(
        `District not found: "${geocodingData.district}" (expected: "${testCase.expectedMatch.district}")`,
      );
    }

    // Check for naming inconsistencies
    if (
      result.matches.province.found &&
      result.matches.province.confidence < 0.9
    ) {
      result.issues.push(
        `Province naming inconsistency: "${geocodingData.province}" vs "${result.matches.province.administrativeName}" (confidence: ${result.matches.province.confidence})`,
      );
    }

    if (
      result.matches.regency.found &&
      result.matches.regency.confidence < 0.9
    ) {
      result.issues.push(
        `Regency naming inconsistency: "${geocodingData.city}" vs "${result.matches.regency.administrativeName}" (confidence: ${result.matches.regency.confidence})`,
      );
    }

    if (
      result.matches.district.found &&
      result.matches.district.confidence < 0.9
    ) {
      result.issues.push(
        `District naming inconsistency: "${geocodingData.district}" vs "${result.matches.district.administrativeName}" (confidence: ${result.matches.district.confidence})`,
      );
    }

    // Step 5: Determine success
    result.success = result.issues.length === 0;
  } catch (error) {
    result.issues.push(
      `Test execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  return result;
}

/**
 * Run all test cases and generate summary report
 */
export async function runAllAdministrativeSyncTests(): Promise<{
  results: AdministrativeSyncTestResult[];
  summary: {
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    commonIssues: string[];
    recommendations: string[];
  };
}> {
  const results: AdministrativeSyncTestResult[] = [];
  const allIssues: string[] = [];

  console.log("🧪 Starting Administrative Sync Tests...");

  for (const testCase of testCases) {
    console.log(`\n📋 Running test: ${testCase.name}`);
    const result = await runAdministrativeSyncTest(testCase);
    results.push(result);

    if (!result.success) {
      console.log(`❌ Test failed with ${result.issues.length} issues:`);
      result.issues.forEach((issue) => {
        console.log(`   - ${issue}`);
        allIssues.push(issue);
      });
    } else {
      console.log(`✅ Test passed successfully`);
    }
  }

  // Generate summary
  const successfulTests = results.filter((r) => r.success).length;
  const failedTests = results.filter((r) => !r.success).length;

  // Identify common issues
  const issueCounts = allIssues.reduce(
    (acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const commonIssues = Object.entries(issueCounts)
    .filter(([, count]) => count > 1)
    .sort(([, a], [, b]) => b - a)
    .map(([issue, count]) => `${issue} (${count} occurrences)`);

  // Generate recommendations based on findings
  const recommendations: string[] = [];

  if (commonIssues.some((issue) => issue.includes("naming inconsistency"))) {
    recommendations.push(
      "Implement synonym mapping for common naming variations",
    );
  }

  if (commonIssues.some((issue) => issue.includes("not found"))) {
    recommendations.push(
      "Improve fuzzy matching algorithm with better similarity scoring",
    );
  }

  if (
    results.some((r) => r.geocodingResponse && !r.geocodingResponse.province)
  ) {
    recommendations.push(
      "Enhance geocoding service to return administrative codes",
    );
  }

  const summary = {
    totalTests: testCases.length,
    successfulTests,
    failedTests,
    commonIssues,
    recommendations,
  };

  console.log("\n📊 Test Summary:");
  console.log(`   Total Tests: ${summary.totalTests}`);
  console.log(`   Successful: ${summary.successfulTests}`);
  console.log(`   Failed: ${summary.failedTests}`);

  if (commonIssues.length > 0) {
    console.log("\n🚨 Common Issues:");
    commonIssues.forEach((issue) => console.log(`   - ${issue}`));
  }

  if (recommendations.length > 0) {
    console.log("\n💡 Recommendations:");
    recommendations.forEach((rec) => console.log(`   - ${rec}`));
  }

  return { results, summary };
}

/**
 * API-based test cases for the new enhanced functionality
 */
export const apiBasedTestCases: AdministrativeSyncTestCase[] = [
  {
    name: "Bekasi API Test",
    description:
      "Test API-based matching for Bekasi with progressive population",
    coordinates: { lat: -6.2383, lon: 106.9756 },
    expectedMatch: {
      province: "JAWA BARAT",
      regency: "KOTA BEKASI",
      district: "BEKASI BARAT",
    },
  },
  {
    name: "Jakarta API Test",
    description: "Test API-based matching for Jakarta with DKI variations",
    coordinates: { lat: -6.2088, lon: 106.8456 },
    expectedMatch: {
      province: "DKI JAKARTA",
      regency: "KOTA JAKARTA PUSAT",
      district: "MENTENG",
    },
  },
  {
    name: "Bandung API Test",
    description: "Test API-based matching for Bandung city",
    coordinates: { lat: -6.9175, lon: 107.6191 },
    expectedMatch: {
      province: "JAWA BARAT",
      regency: "KOTA BANDUNG",
      district: "SUKAJADI",
    },
  },
];

/**
 * Test result for API-based functionality
 */
export interface APIBasedTestResult {
  testCase: AdministrativeSyncTestCase;
  geocodingResponse: CurrentGeocodingResponse | null;
  enhancedResult: unknown | null;
  matches: {
    province: {
      found: boolean;
      confidence: number;
      code: string | null;
      name: string | null;
    };
    regency: {
      found: boolean;
      confidence: number;
      code: string | null;
      name: string | null;
    };
    district: {
      found: boolean;
      confidence: number;
      code: string | null;
      name: string | null;
    };
  };
  overallConfidence: number;
  duration: number;
  success: boolean;
  issues: string[];
}

/**
 * Run API-based test with the new enhanced functionality
 */
export async function runAPIBasedTest(
  testCase: AdministrativeSyncTestCase,
): Promise<APIBasedTestResult> {
  const startTime = Date.now();

  const result: APIBasedTestResult = {
    testCase,
    geocodingResponse: null,
    enhancedResult: null,
    matches: {
      province: { found: false, confidence: 0, code: null, name: null },
      regency: { found: false, confidence: 0, code: null, name: null },
      district: { found: false, confidence: 0, code: null, name: null },
    },
    overallConfidence: 0,
    duration: 0,
    success: false,
    issues: [],
  };

  try {
    console.log(`🧪 Testing API-based functionality: ${testCase.name}`);

    // Step 1: Get enhanced geocoding with Nominatim data
    let geocodingResult;
    if (testCase.coordinates) {
      geocodingResult = await reverseGeocodeWithNominatimData(
        testCase.coordinates.lat,
        testCase.coordinates.lon,
      );
    } else {
      result.issues.push("API-based test requires coordinates");
      return result;
    }

    if (!geocodingResult.success || !geocodingResult.data) {
      result.issues.push(
        `Enhanced geocoding failed: ${geocodingResult.error?.message || "Unknown error"}`,
      );
      return result;
    }

    result.geocodingResponse = geocodingResult.data;
    console.log(`📍 Geocoding result:`, geocodingResult.data);

    // Step 2: Process with API-based progressive population
    const enhancedResult = await processNominatimAddressWithAPI(
      geocodingResult.data,
    );
    result.enhancedResult = enhancedResult;
    result.overallConfidence = enhancedResult.overallConfidence;

    console.log(`🔍 Enhanced result:`, enhancedResult);

    // Step 3: Validate matches
    result.matches.province = {
      found: !!enhancedResult.administrative.province.code,
      confidence: enhancedResult.administrative.province.confidence,
      code: enhancedResult.administrative.province.code,
      name: enhancedResult.administrative.province.name,
    };

    result.matches.regency = {
      found: !!enhancedResult.administrative.regency.code,
      confidence: enhancedResult.administrative.regency.confidence,
      code: enhancedResult.administrative.regency.code,
      name: enhancedResult.administrative.regency.name,
    };

    result.matches.district = {
      found: !!enhancedResult.administrative.district.code,
      confidence: enhancedResult.administrative.district.confidence,
      code: enhancedResult.administrative.district.code,
      name: enhancedResult.administrative.district.name,
    };

    // Step 4: Check against expected results
    if (result.matches.province.found) {
      const provinceName = result.matches.province.name?.toUpperCase();
      if (provinceName !== testCase.expectedMatch.province.toUpperCase()) {
        result.issues.push(
          `Province mismatch: expected "${testCase.expectedMatch.province}", got "${provinceName}"`,
        );
      }
    } else {
      result.issues.push(
        `Province not found (expected: "${testCase.expectedMatch.province}")`,
      );
    }

    if (result.matches.regency.found) {
      const regencyName = result.matches.regency.name?.toUpperCase();
      if (regencyName !== testCase.expectedMatch.regency.toUpperCase()) {
        result.issues.push(
          `Regency mismatch: expected "${testCase.expectedMatch.regency}", got "${regencyName}"`,
        );
      }
    } else {
      result.issues.push(
        `Regency not found (expected: "${testCase.expectedMatch.regency}")`,
      );
    }

    if (result.matches.district.found) {
      const districtName = result.matches.district.name?.toUpperCase();
      if (districtName !== testCase.expectedMatch.district.toUpperCase()) {
        result.issues.push(
          `District mismatch: expected "${testCase.expectedMatch.district}", got "${districtName}"`,
        );
      }
    } else {
      result.issues.push(
        `District not found (expected: "${testCase.expectedMatch.district}")`,
      );
    }

    // Step 5: Evaluate success
    result.success =
      result.issues.length === 0 && result.overallConfidence >= 0.7;

    result.duration = Date.now() - startTime;

    if (result.success) {
      console.log(
        `✅ API test passed (${result.duration}ms, ${(result.overallConfidence * 100).toFixed(1)}% confidence)`,
      );
    } else {
      console.log(
        `❌ API test failed (${result.duration}ms, ${(result.overallConfidence * 100).toFixed(1)}% confidence)`,
      );
      result.issues.forEach((issue) => console.log(`   🔸 ${issue}`));
    }
  } catch (error) {
    result.duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    result.issues.push(`API test execution failed: ${errorMessage}`);
    console.error(`❌ API test error:`, error);
  }

  return result;
}

/**
 * Run all API-based tests and generate comprehensive report
 */
export async function runAllAPIBasedTests(): Promise<{
  results: APIBasedTestResult[];
  summary: {
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    averageConfidence: number;
    averageDuration: number;
    coverageReport: {
      provincesFound: number;
      regenciesFound: number;
      districtsFound: number;
    };
    recommendations: string[];
  };
}> {
  console.log("🚀 Starting API-Based Administrative Sync Tests");
  console.log("===============================================");

  const results: APIBasedTestResult[] = [];

  for (const testCase of apiBasedTestCases) {
    const result = await runAPIBasedTest(testCase);
    results.push(result);

    // Add delay between tests to respect API rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Generate comprehensive summary
  const successfulTests = results.filter((r) => r.success).length;
  const failedTests = results.filter((r) => !r.success).length;
  const averageConfidence =
    results.reduce((sum, r) => sum + r.overallConfidence, 0) / results.length;
  const averageDuration =
    results.reduce((sum, r) => sum + r.duration, 0) / results.length;

  const coverageReport = {
    provincesFound: results.filter((r) => r.matches.province.found).length,
    regenciesFound: results.filter((r) => r.matches.regency.found).length,
    districtsFound: results.filter((r) => r.matches.district.found).length,
  };

  // Generate recommendations
  const recommendations: string[] = [];

  if (averageConfidence < 0.8) {
    recommendations.push(
      "Consider improving fuzzy matching algorithms for better confidence scores",
    );
  }

  if (coverageReport.districtsFound < results.length) {
    recommendations.push("Enhance district-level matching accuracy");
  }

  if (averageDuration > 2000) {
    recommendations.push(
      "Optimize API response times for better user experience",
    );
  }

  const summary = {
    totalTests: apiBasedTestCases.length,
    successfulTests,
    failedTests,
    averageConfidence,
    averageDuration,
    coverageReport,
    recommendations,
  };

  // Print detailed summary
  console.log("\n📊 API-Based Test Summary");
  console.log("========================");
  console.log(
    `✅ Passed: ${successfulTests}/${summary.totalTests} (${((successfulTests / summary.totalTests) * 100).toFixed(1)}%)`,
  );
  console.log(
    `📈 Average Confidence: ${(averageConfidence * 100).toFixed(1)}%`,
  );
  console.log(`⏱️ Average Duration: ${averageDuration.toFixed(0)}ms`);

  console.log("\n📍 Coverage Report:");
  console.log(
    `🏛️ Provinces Found: ${coverageReport.provincesFound}/${summary.totalTests}`,
  );
  console.log(
    `🏙️ Regencies Found: ${coverageReport.regenciesFound}/${summary.totalTests}`,
  );
  console.log(
    `🏘️ Districts Found: ${coverageReport.districtsFound}/${summary.totalTests}`,
  );

  if (recommendations.length > 0) {
    console.log("\n💡 Recommendations:");
    recommendations.forEach((rec) => console.log(`   - ${rec}`));
  }

  console.log("\n🔍 Individual Test Results:");
  results.forEach((result) => {
    const status = result.success ? "✅" : "❌";
    const confidence = `${(result.overallConfidence * 100).toFixed(1)}%`;
    console.log(
      `${status} ${result.testCase.name} - ${confidence} confidence (${result.duration}ms)`,
    );

    if (!result.success && result.issues.length > 0) {
      result.issues.forEach((issue) => console.log(`   🔸 ${issue}`));
    }
  });

  return { results, summary };
}

export default {
  testCases,
  apiBasedTestCases,
  runAdministrativeSyncTest,
  runAllAdministrativeSyncTests,
  runAPIBasedTest,
  runAllAPIBasedTests,
};
