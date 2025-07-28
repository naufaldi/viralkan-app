import { useState, useEffect, useCallback } from "react";
import {
  administrativeService,
  Province,
  Regency,
  District,
} from "../../services/api-client";

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
}

export function useAdministrative(): UseAdministrativeReturn {
  const [data, setData] = useState<AdministrativeData>({
    provinces: [],
    regencies: [],
    districts: [],
  });

  const [loading, setLoading] = useState({
    provinces: false,
    regencies: false,
    districts: false,
  });

  const [error, setError] = useState({
    provinces: null as string | null,
    regencies: null as string | null,
    districts: null as string | null,
  });

  // Fetch provinces
  const fetchProvinces = useCallback(async () => {
    setLoading((prev) => ({ ...prev, provinces: true }));
    setError((prev) => ({ ...prev, provinces: null }));

    try {
      const response = await administrativeService.getProvinces();
      setData((prev) => ({ ...prev, provinces: response.data }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal memuat data provinsi";
      setError((prev) => ({ ...prev, provinces: errorMessage }));
      console.error("Error fetching provinces:", err);
    } finally {
      setLoading((prev) => ({ ...prev, provinces: false }));
    }
  }, []);

  // Fetch regencies by province
  const fetchRegencies = useCallback(async (provinceCode: string) => {
    if (!provinceCode) {
      setData((prev) => ({ ...prev, regencies: [] }));
      return;
    }

    setLoading((prev) => ({ ...prev, regencies: true }));
    setError((prev) => ({ ...prev, regencies: null }));

    try {
      const response = await administrativeService.getRegencies(provinceCode);
      setData((prev) => ({ ...prev, regencies: response.data }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal memuat data kabupaten/kota";
      setError((prev) => ({ ...prev, regencies: errorMessage }));
      console.error("Error fetching regencies:", err);
    } finally {
      setLoading((prev) => ({ ...prev, regencies: false }));
    }
  }, []);

  // Fetch districts by regency
  const fetchDistricts = useCallback(async (regencyCode: string) => {
    if (!regencyCode) {
      setData((prev) => ({ ...prev, districts: [] }));
      return;
    }

    setLoading((prev) => ({ ...prev, districts: true }));
    setError((prev) => ({ ...prev, districts: null }));

    try {
      const response = await administrativeService.getDistricts(regencyCode);
      setData((prev) => ({ ...prev, districts: response.data }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal memuat data kecamatan";
      setError((prev) => ({ ...prev, districts: errorMessage }));
      console.error("Error fetching districts:", err);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  }, []);

  // Refetch functions - memoized to prevent infinite re-renders
  const refetchProvinces = useCallback(() => fetchProvinces(), []);
  const refetchRegencies = useCallback(
    (provinceCode: string) => fetchRegencies(provinceCode),
    [],
  );
  const refetchDistricts = useCallback(
    (regencyCode: string) => fetchDistricts(regencyCode),
    [],
  );

  // Load provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  return {
    data,
    loading,
    error,
    refetchProvinces,
    refetchRegencies,
    refetchDistricts,
  };
}
