import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  administrativeService,
  Province,
  Regency,
  District,
} from "../../services/administrative";

interface AdministrativeData {
  provinces: Province[];
  regencies: Regency[];
  districts: District[];
}

interface UseAdministrativeReturn {
  data: AdministrativeData;
  loading: {
    provinces: boolean;
    regencies: boolean;
    districts: boolean;
  };
  error: {
    provinces: string | null;
    regencies: string | null;
    districts: string | null;
  };
  refetchProvinces: () => void;
  refetchRegencies: (provinceCode: string) => void;
  refetchDistricts: (regencyCode: string) => void;
  addDynamicOption: (
    type: "province" | "regency" | "district",
    option: Province | Regency | District,
  ) => void;
}

interface UseAdministrativeOptions {
  provinceCode?: string | null;
  regencyCode?: string | null;
}

// Query keys
const ADMINISTRATIVE_KEYS = {
  provinces: ["administrative", "provinces"] as const,
  regencies: (provinceCode: string) =>
    ["administrative", "regencies", provinceCode] as const,
  districts: (regencyCode: string) =>
    ["administrative", "districts", regencyCode] as const,
};

// Hook for invalidating administrative queries
export function useInvalidateAdministrative() {
  const queryClient = useQueryClient();

  const invalidateRegencies = (provinceCode?: string) => {
    if (provinceCode) {
      queryClient.invalidateQueries({
        queryKey: ["administrative", "regencies", provinceCode],
      });
    } else {
      // Invalidate all regency queries
      queryClient.invalidateQueries({
        queryKey: ["administrative", "regencies"],
      });
    }
    // Also invalidate all districts when province changes
    queryClient.invalidateQueries({
      queryKey: ["administrative", "districts"],
    });
  };

  const invalidateDistricts = (regencyCode?: string) => {
    if (regencyCode) {
      queryClient.invalidateQueries({
        queryKey: ["administrative", "districts", regencyCode],
      });
    } else {
      // Invalidate all district queries
      queryClient.invalidateQueries({
        queryKey: ["administrative", "districts"],
      });
    }
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: ["administrative"],
    });
  };

  return {
    invalidateRegencies,
    invalidateDistricts,
    invalidateAll,
  };
}

export function useAdministrative(
  options?: UseAdministrativeOptions,
): UseAdministrativeReturn {
  const queryClient = useQueryClient();
  const { provinceCode = null, regencyCode = null } = options || {};

  // Fetch provinces - always enabled
  const provincesQuery = useQuery({
    queryKey: ADMINISTRATIVE_KEYS.provinces,
    queryFn: () => administrativeService.getProvinces(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch regencies - enabled only when provinceCode exists
  const regenciesQuery = useQuery({
    queryKey: ADMINISTRATIVE_KEYS.regencies(provinceCode || ""),
    queryFn: () => administrativeService.getRegencies(provinceCode!),
    enabled: !!provinceCode,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch districts - enabled only when regencyCode exists
  const districtsQuery = useQuery({
    queryKey: ADMINISTRATIVE_KEYS.districts(regencyCode || ""),
    queryFn: () => administrativeService.getDistricts(regencyCode!),
    enabled: !!regencyCode,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Refetch functions
  const refetchProvinces = () => {
    provincesQuery.refetch();
  };

  const refetchRegencies = (provinceCode: string) => {
    if (provinceCode) {
      queryClient.invalidateQueries({
        queryKey: ["administrative", "regencies", provinceCode],
      });
    }
  };

  const refetchDistricts = (regencyCode: string) => {
    if (regencyCode) {
      queryClient.invalidateQueries({
        queryKey: ["administrative", "districts", regencyCode],
      });
    }
  };

  // Add dynamic option to cache
  const addDynamicOption = (
    type: "province" | "regency" | "district",
    option: Province | Regency | District,
  ) => {
    if (type === "province") {
      const province = option as Province;
      queryClient.setQueryData<Province[]>(
        ADMINISTRATIVE_KEYS.provinces,
        (oldData) => {
          if (!oldData) return [province];
          const exists = oldData.some((p) => p.code === province.code);
          if (exists) return oldData;
          return [...oldData, province];
        },
      );
    } else if (type === "regency") {
      const regency = option as Regency;
      queryClient.setQueryData<Regency[]>(
        ADMINISTRATIVE_KEYS.regencies(regency.province_code),
        (oldData) => {
          if (!oldData) return [regency];
          const exists = oldData.some((r) => r.code === regency.code);
          if (exists) return oldData;
          return [...oldData, regency];
        },
      );
    } else if (type === "district") {
      const district = option as District;
      queryClient.setQueryData<District[]>(
        ADMINISTRATIVE_KEYS.districts(district.regency_code),
        (oldData) => {
          if (!oldData) return [district];
          const exists = oldData.some((d) => d.code === district.code);
          if (exists) return oldData;
          return [...oldData, district];
        },
      );
    }
  };

  return {
    data: {
      provinces: provincesQuery.data || [],
      regencies: regenciesQuery.data || [],
      districts: districtsQuery.data || [],
    },
    loading: {
      provinces: provincesQuery.isLoading,
      regencies: regenciesQuery.isLoading,
      districts: districtsQuery.isLoading,
    },
    error: {
      provinces: provincesQuery.error
        ? provincesQuery.error instanceof Error
          ? provincesQuery.error.message
          : "Gagal memuat data provinsi"
        : null,
      regencies: regenciesQuery.error
        ? regenciesQuery.error instanceof Error
          ? regenciesQuery.error.message
          : "Gagal memuat data kabupaten/kota"
        : null,
      districts: districtsQuery.error
        ? districtsQuery.error instanceof Error
          ? districtsQuery.error.message
          : "Gagal memuat data kecamatan"
        : null,
    },
    refetchProvinces,
    refetchRegencies,
    refetchDistricts,
    addDynamicOption,
  };
}
