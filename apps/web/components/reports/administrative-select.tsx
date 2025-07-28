"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Loader2, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { ComboboxField, ComboboxOption } from "../ui/combobox-field";
import { useAdministrative } from "../../hooks/reports/use-administrative";
import { CreateReportInput } from "../../lib/types/api";
import { Province, Regency, District } from "../../services/api-client";
import { cn } from "@repo/ui/lib/utils";

interface AdministrativeSelectProps {
  form: UseFormReturn<CreateReportInput>;
  disabled?: boolean;
  // Geocoding integration props
  isGeocodingFromCoords?: boolean;
  lastGeocodingSource?: "coordinates" | "address" | null;
  onClearGeocodingError?: () => void;
  // Enable "all" options for filtering context
  enableAllOptions?: boolean;
}

export const AdministrativeSelect = ({
  form,
  disabled = false,
  isGeocodingFromCoords = false,
  lastGeocodingSource = null,
  onClearGeocodingError,
  enableAllOptions = false,
}: AdministrativeSelectProps) => {
  // URL state management
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current form values for cascading
  const selectedProvinceCode = form.watch("province_code");
  const selectedRegencyCode = form.watch("regency_code");
  const selectedDistrictCode = form.watch("district_code");

  // Get "all" states from URL params (default to "all" when no parameter exists)
  const selectedAllProvince = !searchParams.get("provinsi");
  const selectedAllRegency = !searchParams.get("kabupaten_kota");
  const selectedAllDistrict = !searchParams.get("kecamatan");

  // Fetch data using our custom hook
  const { data, loading, error, refetchRegencies, refetchDistricts } =
    useAdministrative();

  // Fetch dependent data when parent selection changes
  React.useEffect(() => {
    if (selectedProvinceCode) {
      refetchRegencies(selectedProvinceCode);
    }
  }, [selectedProvinceCode, refetchRegencies]);

  React.useEffect(() => {
    if (selectedRegencyCode) {
      refetchDistricts(selectedRegencyCode);
    }
  }, [selectedRegencyCode, refetchDistricts]);

  // Helper function to truncate long text
  const truncateText = (text: string, maxLength: number = 20) => {
    if (!text) return text;
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  // Transform data for ComboboxField
  const provinceOptions: ComboboxOption[] = React.useMemo(() => {
    const options: ComboboxOption[] = [];

    // Add "all" option if enabled
    if (enableAllOptions) {
      options.push({
        value: "all",
        label: "Semua Provinsi",
        searchValue: "semua provinsi",
      });
    }

    // Add province options
    if (data.provinces) {
      options.push(
        ...data.provinces.map((province: Province) => ({
          value: province.code,
          label: truncateText(province.name),
          searchValue: province.name.toLowerCase(),
        })),
      );
    }

    return options;
  }, [data.provinces, enableAllOptions]);

  const regencyOptions: ComboboxOption[] = React.useMemo(() => {
    const options: ComboboxOption[] = [];

    // Add "all" option if enabled
    if (enableAllOptions) {
      options.push({
        value: "all",
        label: "Semua Kabupaten/Kota",
        searchValue: "semua kabupaten kota",
      });
    }

    // Add regency options
    if (data.regencies) {
      options.push(
        ...data.regencies.map((regency: Regency) => ({
          value: regency.code,
          label: truncateText(regency.name),
          searchValue: regency.name.toLowerCase(),
        })),
      );
    }

    return options;
  }, [data.regencies, enableAllOptions]);

  const districtOptions: ComboboxOption[] = React.useMemo(() => {
    const options: ComboboxOption[] = [];

    // Add "all" option if enabled
    if (enableAllOptions) {
      options.push({
        value: "all",
        label: "Semua Kecamatan",
        searchValue: "semua kecamatan",
      });
    }

    // Add district options
    if (data.districts) {
      options.push(
        ...data.districts.map((district: District) => ({
          value: district.code,
          label: truncateText(district.name),
          searchValue: district.name.toLowerCase(),
        })),
      );
    }

    return options;
  }, [data.districts, enableAllOptions]);

  // Handle province selection - reset dependent fields
  const handleProvinceChange = (provinceCode: string) => {
    const params = new URLSearchParams(searchParams);

    if (provinceCode === "all") {
      // Handle "all" selection - remove URL parameter (default state)
      params.delete("provinsi");
      form.setValue("province_code", "");
      form.setValue("province", "");

      // Reset dependent fields
      form.setValue("regency_code", "");
      form.setValue("city", "");
      form.setValue("district_code", "");
      form.setValue("district", "");
      params.delete("kabupaten_kota");
      params.delete("kecamatan");
    } else {
      // Handle specific province selection
      params.set("provinsi", provinceCode);
      const selectedProvince = data.provinces?.find(
        (p: Province) => p.code === provinceCode,
      );

      if (selectedProvince) {
        // Update both code and name fields
        form.setValue("province_code", provinceCode);
        form.setValue("province", selectedProvince.name);

        // Reset dependent fields
        form.setValue("regency_code", "");
        form.setValue("city", "");
        form.setValue("district_code", "");
        form.setValue("district", "");
        params.delete("kabupaten_kota");
        params.delete("kecamatan");
      }
    }

    // Update URL
    router.replace(`?${params.toString()}`, { scroll: false });
    onClearGeocodingError?.();
  };

  // Handle regency selection - reset dependent fields
  const handleRegencyChange = (regencyCode: string) => {
    const params = new URLSearchParams(searchParams);

    if (regencyCode === "all") {
      // Handle "all" selection - remove URL parameter (default state)
      params.delete("kabupaten_kota");
      form.setValue("regency_code", "");
      form.setValue("city", "");

      // Reset dependent fields
      form.setValue("district_code", "");
      form.setValue("district", "");
      params.delete("kecamatan");
    } else {
      // Handle specific regency selection
      params.set("kabupaten_kota", regencyCode);
      const selectedRegency = data.regencies?.find(
        (r: Regency) => r.code === regencyCode,
      );

      if (selectedRegency) {
        // Update both code and name fields
        form.setValue("regency_code", regencyCode);
        form.setValue("city", selectedRegency.name);

        // Reset dependent fields
        form.setValue("district_code", "");
        form.setValue("district", "");
        params.delete("kecamatan");
      }
    }

    // Update URL
    router.replace(`?${params.toString()}`, { scroll: false });
    onClearGeocodingError?.();
  };

  // Handle district selection
  const handleDistrictChange = (districtCode: string) => {
    const params = new URLSearchParams(searchParams);

    if (districtCode === "all") {
      // Handle "all" selection - remove URL parameter (default state)
      params.delete("kecamatan");
      form.setValue("district_code", "");
      form.setValue("district", "");
    } else {
      // Handle specific district selection
      params.set("kecamatan", districtCode);
      const selectedDistrict = data.districts?.find(
        (d: District) => d.code === districtCode,
      );

      if (selectedDistrict) {
        // Update both code and name fields
        form.setValue("district_code", districtCode);
        form.setValue("district", selectedDistrict.name);
      }
    }

    // Update URL
    router.replace(`?${params.toString()}`, { scroll: false });
    onClearGeocodingError?.();
  };

  const isFromGeocoding = lastGeocodingSource === "coordinates";
  const geocodingClasses = isFromGeocoding
    ? "border-green-300 bg-green-50/30"
    : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Province Selection */}
      <div className="max-w-full">
        <FormField
          control={form.control}
          name="province"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                Provinsi *
                {isGeocodingFromCoords && (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                )}
                {isFromGeocoding && (
                  <MapPin className="h-4 w-4 text-green-600" />
                )}
              </FormLabel>
              <FormControl>
                <ComboboxField
                  options={provinceOptions}
                  value={
                    selectedAllProvince ? "all" : selectedProvinceCode || "all"
                  }
                  onValueChange={handleProvinceChange}
                  placeholder="Pilih provinsi..."
                  emptyMessage="Tidak ada provinsi ditemukan."
                  searchPlaceholder="Cari provinsi..."
                  disabled={
                    disabled || isGeocodingFromCoords || loading.provinces
                  }
                  loading={loading.provinces}
                  size="lg"
                  error={!!form.formState.errors.province}
                  className={cn(geocodingClasses, "max-w-full truncate")}
                />
              </FormControl>
              <FormDescription className="text-sm text-neutral-600">
                Nama provinsi tempat kerusakan jalan berada.
              </FormDescription>
              <FormMessage />
              {error.provinces && (
                <p className="text-sm text-red-600">
                  Gagal memuat data provinsi. Silakan coba lagi.
                </p>
              )}
            </FormItem>
          )}
        />
      </div>

      {/* Regency Selection */}
      <div className="max-w-full">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                Kabupaten/Kota *
                {isGeocodingFromCoords && (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                )}
                {isFromGeocoding && (
                  <MapPin className="h-4 w-4 text-green-600" />
                )}
              </FormLabel>
              <FormControl>
                <ComboboxField
                  options={regencyOptions}
                  value={
                    selectedAllRegency ? "all" : selectedRegencyCode || "all"
                  }
                  onValueChange={handleRegencyChange}
                  placeholder={
                    !selectedProvinceCode
                      ? "Pilih provinsi terlebih dahulu..."
                      : "Pilih kabupaten/kota..."
                  }
                  emptyMessage={
                    !selectedProvinceCode
                      ? "Silakan pilih provinsi terlebih dahulu."
                      : "Tidak ada kabupaten/kota ditemukan untuk provinsi ini."
                  }
                  searchPlaceholder="Cari kabupaten/kota..."
                  disabled={
                    disabled ||
                    isGeocodingFromCoords ||
                    !selectedProvinceCode ||
                    loading.regencies
                  }
                  loading={loading.regencies}
                  size="lg"
                  error={!!form.formState.errors.city}
                  className={cn(geocodingClasses, "max-w-full truncate")}
                />
              </FormControl>
              <FormDescription className="text-sm text-neutral-600">
                Nama kabupaten atau kota tempat kerusakan jalan berada.
              </FormDescription>
              <FormMessage />
              {error.regencies && selectedProvinceCode && (
                <p className="text-sm text-red-600">
                  Gagal memuat data kabupaten/kota. Silakan coba lagi.
                </p>
              )}
            </FormItem>
          )}
        />
      </div>

      {/* District Selection */}
      <div className="max-w-full">
        <FormField
          control={form.control}
          name="district"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                Kecamatan *
                {isGeocodingFromCoords && (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                )}
                {isFromGeocoding && (
                  <MapPin className="h-4 w-4 text-green-600" />
                )}
              </FormLabel>
              <FormControl>
                <ComboboxField
                  options={districtOptions}
                  value={
                    selectedAllDistrict ? "all" : selectedDistrictCode || "all"
                  }
                  onValueChange={handleDistrictChange}
                  placeholder={
                    !selectedRegencyCode
                      ? "Pilih kabupaten/kota terlebih dahulu..."
                      : "Pilih kecamatan..."
                  }
                  emptyMessage={
                    !selectedRegencyCode
                      ? "Silakan pilih kabupaten/kota terlebih dahulu."
                      : "Tidak ada kecamatan ditemukan untuk kabupaten/kota ini."
                  }
                  searchPlaceholder="Cari kecamatan..."
                  disabled={
                    disabled ||
                    isGeocodingFromCoords ||
                    !selectedRegencyCode ||
                    loading.districts
                  }
                  loading={loading.districts}
                  size="lg"
                  error={!!form.formState.errors.district}
                  className={cn(geocodingClasses, "max-w-full truncate")}
                />
              </FormControl>
              <FormDescription className="text-sm text-neutral-600">
                Nama kecamatan tempat kerusakan jalan berada.
              </FormDescription>
              <FormMessage />
              {error.districts && selectedRegencyCode && (
                <p className="text-sm text-red-600">
                  Gagal memuat data kecamatan. Silakan coba lagi.
                </p>
              )}
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
