// Administrative Data Service
// Pure async functions for fetching administrative data (provinces, regencies, districts)

import { apiRequest } from "./api-client";

// Administrative data types
export interface Province {
  code: string;
  name: string;
}

export interface Regency {
  code: string;
  name: string;
  province_code: string;
}

export interface District {
  code: string;
  name: string;
  regency_code: string;
}

export interface AdministrativeResponse<T> {
  data: T[];
  meta?: {
    total?: number;
    lastSync?: string;
  };
}

// Administrative API Service - Pure fetcher functions
export const administrativeService = {
  // Get all provinces
  getProvinces: async (): Promise<Province[]> => {
    const response = await apiRequest<Province[]>(
      "/api/administrative/provinces",
    );
    // Handle both array response and wrapped response
    if (Array.isArray(response)) {
      return response;
    }
    // If response is wrapped in { data: [...] }, unwrap it
    if (response && typeof response === "object" && "data" in response) {
      return (response as { data: Province[] }).data;
    }
    return [];
  },

  // Get regencies by province code
  getRegencies: async (provinceCode: string): Promise<Regency[]> => {
    const response = await apiRequest<Regency[]>(
      `/api/administrative/regencies/${provinceCode}`,
    );
    // Handle both array response and wrapped response
    if (Array.isArray(response)) {
      return response;
    }
    // If response is wrapped in { data: [...] }, unwrap it
    if (response && typeof response === "object" && "data" in response) {
      return (response as { data: Regency[] }).data;
    }
    return [];
  },

  // Get districts by regency code
  getDistricts: async (regencyCode: string): Promise<District[]> => {
    const response = await apiRequest<District[]>(
      `/api/administrative/districts/${regencyCode}`,
    );
    // Handle both array response and wrapped response
    if (Array.isArray(response)) {
      return response;
    }
    // If response is wrapped in { data: [...] }, unwrap it
    if (response && typeof response === "object" && "data" in response) {
      return (response as { data: District[] }).data;
    }
    return [];
  },

  // Get sync status
  getSyncStatus: async (): Promise<{
    provinces: number;
    regencies: number;
    districts: number;
    lastSync: string | null;
  }> => {
    return apiRequest("/api/administrative/sync/status");
  },

  // Validate administrative hierarchy
  validateHierarchy: async (
    provinceCode: string,
    regencyCode: string,
    districtCode: string,
  ): Promise<{
    isValid: boolean;
    names: {
      province: string;
      regency: string;
      district: string;
    };
  }> => {
    return apiRequest(
      `/api/administrative/validate/${provinceCode}/${regencyCode}/${districtCode}`,
    );
  },

  // Search province by name with fuzzy matching
  searchProvinces: async (query: string): Promise<Province | null> => {
    if (!query || query.trim().length < 2) {
      return null;
    }

    const searchParams = new URLSearchParams();
    searchParams.append("q", query.trim());

    return apiRequest<Province | null>(
      `/api/administrative/provinces/search?${searchParams.toString()}`,
    );
  },

  // Search regencies by name within province with fuzzy matching
  searchRegencies: async (
    query: string,
    provinceCode: string,
  ): Promise<Regency | null> => {
    if (!query || query.trim().length < 2 || !provinceCode) {
      return null;
    }

    const searchParams = new URLSearchParams();
    searchParams.append("q", query.trim());

    return apiRequest<Regency | null>(
      `/api/administrative/regencies/${provinceCode}/search?${searchParams.toString()}`,
    );
  },

  // Search districts by name within regency with fuzzy matching
  searchDistricts: async (
    query: string,
    regencyCode: string,
  ): Promise<District | null> => {
    if (!query || query.trim().length < 2 || !regencyCode) {
      return null;
    }

    const searchParams = new URLSearchParams();
    searchParams.append("q", query.trim());

    return apiRequest<District | null>(
      `/api/administrative/districts/${regencyCode}/search?${searchParams.toString()}`,
    );
  },
};
