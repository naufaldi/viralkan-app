import { useQuery } from "@tanstack/react-query";
import { administrativeService, Province, Regency, District } from "../../services/api-client";

/**
 * Hook for fetching all provinces
 */
export const useProvinces = () => {
  return useQuery({
    queryKey: ["administrative", "provinces"],
    queryFn: () => administrativeService.getProvinces(),
    staleTime: 30 * 60 * 1000, // 30 minutes - administrative data changes rarely
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes("HTTP 4")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook for fetching regencies by province code
 */
export const useRegencies = (provinceCode: string | undefined) => {
  return useQuery({
    queryKey: ["administrative", "regencies", provinceCode],
    queryFn: () => administrativeService.getRegencies(provinceCode!),
    enabled: !!provinceCode && provinceCode.length === 2,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("HTTP 4")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook for fetching districts by regency code
 */
export const useDistricts = (regencyCode: string | undefined) => {
  return useQuery({
    queryKey: ["administrative", "districts", regencyCode],
    queryFn: () => administrativeService.getDistricts(regencyCode!),
    enabled: !!regencyCode && regencyCode.length === 4,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("HTTP 4")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook for fetching administrative sync status
 */
export const useAdministrativeSyncStatus = () => {
  return useQuery({
    queryKey: ["administrative", "sync-status"],
    queryFn: () => administrativeService.getSyncStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("HTTP 4")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook for validating administrative hierarchy
 */
export const useValidateAdministrativeHierarchy = (
  provinceCode: string | undefined,
  regencyCode: string | undefined,
  districtCode: string | undefined
) => {
  return useQuery({
    queryKey: ["administrative", "validate", provinceCode, regencyCode, districtCode],
    queryFn: () => administrativeService.validateHierarchy(provinceCode!, regencyCode!, districtCode!),
    enabled: !!(
      provinceCode?.length === 2 && 
      regencyCode?.length === 4 && 
      districtCode?.length === 6
    ),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("HTTP 4")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Utility hook for getting administrative options for dropdowns
export const useAdministrativeOptions = () => {
  const { data: provincesData, isLoading: provincesLoading, error: provincesError } = useProvinces();

  const provinces = provincesData?.data || [];
  
  // Transform provinces for dropdown usage
  const provinceOptions = provinces.map((province: Province) => ({
    value: province.code,
    label: province.name,
    searchValue: province.name.toLowerCase(),
  }));

  return {
    provinces: provinceOptions,
    isLoading: provincesLoading,
    error: provincesError,
    // Helper function to get regencies for a specific province
    getRegencyOptions: (provinceCode: string) => {
      // This will be used by the cascading dropdown component
      return [];
    },
    // Helper function to get districts for a specific regency  
    getDistrictOptions: (regencyCode: string) => {
      // This will be used by the cascading dropdown component
      return [];
    },
  };
};