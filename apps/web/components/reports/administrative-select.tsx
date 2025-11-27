"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Loader2,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ComboboxField, ComboboxOption } from "../ui/combobox-field";
import {
  useAdministrative,
  useInvalidateAdministrative,
} from "../../hooks/reports/use-administrative";
import { useAdministrativeSync } from "../../hooks/reports/use-administrative-sync";
import { AdministrativeSyncStatus } from "./administrative-sync-status";
import { CreateReportInput } from "../../lib/types/api";
import { Province, Regency, District } from "../../services/administrative";
import { cn } from "@repo/ui/lib/utils";
import type { AdministrativeSyncStatus as AdministrativeSyncStatusType } from "../../lib/utils/enhanced-geocoding-handler";

interface AdministrativeSelectProps {
  form: UseFormReturn<CreateReportInput>;
  disabled?: boolean;
  isFormActivated?: boolean;
  // Geocoding integration props
  isGeocodingFromCoords?: boolean;
  lastGeocodingSource?: "coordinates" | "address" | null;
  onClearGeocodingError?: () => void;
  // Enable "all" options for filtering context
  enableAllOptions?: boolean;
  // Enhanced sync features
  enableAutoSync?: boolean;
  showSyncStatus?: boolean;
  // Administrative sync status props (passed from parent)
  syncStatus?: AdministrativeSyncStatusType | null;
  hasValidMatch?: boolean;
  confidenceLevel?: "high" | "medium" | "low" | "none";
  canAutoSelect?: boolean;
  isProcessingAdminSync?: boolean;
}

export const AdministrativeSelect = ({
  form,
  disabled = false,
  isFormActivated = false,
  isGeocodingFromCoords = false,
  lastGeocodingSource = null,
  onClearGeocodingError,
  enableAllOptions = false,
  enableAutoSync = true,
  showSyncStatus = true,
  // Administrative sync status props (passed from parent)
  syncStatus: externalSyncStatus,
  hasValidMatch: externalHasValidMatch = false,
  confidenceLevel: externalConfidenceLevel = "none",
  canAutoSelect: externalCanAutoSelect = false,
  isProcessingAdminSync: externalIsProcessingAdminSync = false,
}: AdministrativeSelectProps) => {
  // URL state management
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current form values for cascading
  const selectedProvinceCode = form.watch("province_code");
  const selectedRegencyCode = form.watch("regency_code");
  const selectedDistrictCode = form.watch("district_code");
  const selectedProvinceName = form.watch("province");
  const selectedRegencyName = form.watch("city");
  const selectedDistrictName = form.watch("district");

  // Get "all" states from URL params (only if form doesn't have values)
  // When editing, form values take precedence over URL params
  const selectedAllProvince =
    !selectedProvinceCode && !searchParams.get("provinsi");
  const selectedAllRegency =
    !selectedRegencyCode && !searchParams.get("kabupaten_kota");
  const selectedAllDistrict =
    !selectedDistrictCode && !searchParams.get("kecamatan");

  // Invalidation helpers for cascading invalidation
  const { invalidateRegencies, invalidateDistricts } =
    useInvalidateAdministrative();

  // Fetch data using our custom hook with TanStack Query
  const { data, loading, error, addDynamicOption } = useAdministrative({
    provinceCode: selectedProvinceCode || undefined,
    regencyCode: selectedRegencyCode || undefined,
  });

  // Enhanced administrative sync hook (only when not provided externally)
  const internalSync = useAdministrativeSync({
    form,
    autoApply: enableAutoSync,
    confidenceThreshold: 0.7,
    enableValidation: true,
  });

  // Use external sync status if provided, otherwise fall back to internal
  const syncStatus = externalSyncStatus || internalSync.syncStatus;
  const hasValidMatch = externalHasValidMatch || internalSync.hasValidMatch;
  const canAutoSelect = externalCanAutoSelect || internalSync.canAutoSelect;
  const confidenceLevel =
    externalConfidenceLevel !== "none"
      ? externalConfidenceLevel
      : internalSync.confidenceLevel;
  const isSyncProcessing =
    externalIsProcessingAdminSync || internalSync.isProcessing;

  // Always use internal sync methods (external props are for status display only)
  const { enhancedGeocoding, processGeocoding, applyToForm, clearSync } =
    internalSync;

  // Get confidence level styling
  const getConfidenceStyling = (level: "high" | "medium" | "low" | "none") => {
    switch (level) {
      case "high":
        return {
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-700",
          iconColor: "text-green-600",
        };
      case "medium":
        return {
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-700",
          iconColor: "text-yellow-600",
        };
      case "low":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-700",
          iconColor: "text-red-600",
        };
      default:
        return {
          bgColor: "bg-neutral-50",
          borderColor: "border-neutral-200",
          textColor: "text-neutral-700",
          iconColor: "text-neutral-600",
        };
    }
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
          label: province.name,
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
          label: regency.name,
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
          label: district.name,
          searchValue: district.name.toLowerCase(),
        })),
      );
    }

    return options;
  }, [data.districts, enableAllOptions]);

  // Ensure auto-filled administrative values appear in combobox options
  React.useEffect(() => {
    if (
      selectedProvinceCode &&
      selectedProvinceName &&
      !provinceOptions.some((option) => option.value === selectedProvinceCode)
    ) {
      addDynamicOption("province", {
        code: selectedProvinceCode,
        name: selectedProvinceName,
      });
    }

    if (
      selectedRegencyCode &&
      selectedRegencyName &&
      selectedProvinceCode &&
      !regencyOptions.some((option) => option.value === selectedRegencyCode)
    ) {
      addDynamicOption("regency", {
        code: selectedRegencyCode,
        name: selectedRegencyName,
        province_code: selectedProvinceCode,
      });
    }

    if (
      selectedDistrictCode &&
      selectedDistrictName &&
      selectedRegencyCode &&
      !districtOptions.some((option) => option.value === selectedDistrictCode)
    ) {
      addDynamicOption("district", {
        code: selectedDistrictCode,
        name: selectedDistrictName,
        regency_code: selectedRegencyCode,
      });
    }
  }, [
    addDynamicOption,
    districtOptions,
    provinceOptions,
    regencyOptions,
    selectedDistrictCode,
    selectedDistrictName,
    selectedProvinceCode,
    selectedProvinceName,
    selectedRegencyCode,
    selectedRegencyName,
  ]);

  // Handle province selection - reset dependent fields
  const handleProvinceChange = (provinceCode: string) => {
    const params = new URLSearchParams(searchParams);

    if (provinceCode === "all") {
      // Handle "all" selection - remove URL parameter (default state)
      params.delete("provinsi");
      form.setValue("province_code", "", { shouldValidate: true });
      form.setValue("province", "", { shouldValidate: true });

      // Reset dependent fields
      form.setValue("regency_code", "", { shouldValidate: true });
      form.setValue("city", "", { shouldValidate: true });
      form.setValue("district_code", "", { shouldValidate: true });
      form.setValue("district", "", { shouldValidate: true });
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
        form.setValue("province_code", provinceCode, { shouldValidate: true });
        form.setValue("province", selectedProvince.name, {
          shouldValidate: true,
        });

        // Reset dependent fields
        form.setValue("regency_code", "", { shouldValidate: true });
        form.setValue("city", "", { shouldValidate: true });
        form.setValue("district_code", "", { shouldValidate: true });
        form.setValue("district", "", { shouldValidate: true });
        params.delete("kabupaten_kota");
        params.delete("kecamatan");
      }
    }

    // Update URL
    router.replace(`?${params.toString()}`, { scroll: false });
    onClearGeocodingError?.();

    // Invalidate dependent queries when province changes
    if (provinceCode !== "all") {
      invalidateRegencies(provinceCode);
    } else {
      invalidateRegencies();
    }

    // Clear sync status when user manually changes selection
    clearSync();
  };

  // Handle regency selection - reset dependent fields
  const handleRegencyChange = (regencyCode: string) => {
    const params = new URLSearchParams(searchParams);

    if (regencyCode === "all") {
      // Handle "all" selection - remove URL parameter (default state)
      params.delete("kabupaten_kota");
      form.setValue("regency_code", "", { shouldValidate: true });
      form.setValue("city", "", { shouldValidate: true });

      // Reset dependent fields
      form.setValue("district_code", "", { shouldValidate: true });
      form.setValue("district", "", { shouldValidate: true });
      params.delete("kecamatan");
    } else {
      // Handle specific regency selection
      params.set("kabupaten_kota", regencyCode);
      const selectedRegency = data.regencies?.find(
        (r: Regency) => r.code === regencyCode,
      );

      if (selectedRegency) {
        // Update both code and name fields
        form.setValue("regency_code", regencyCode, { shouldValidate: true });
        form.setValue("city", selectedRegency.name, { shouldValidate: true });

        // Reset dependent fields
        form.setValue("district_code", "", { shouldValidate: true });
        form.setValue("district", "", { shouldValidate: true });
        params.delete("kecamatan");
      }
    }

    // Update URL
    router.replace(`?${params.toString()}`, { scroll: false });
    onClearGeocodingError?.();

    // Invalidate dependent queries when regency changes
    if (regencyCode !== "all") {
      invalidateDistricts(regencyCode);
    } else {
      invalidateDistricts();
    }

    // Clear sync status when user manually changes selection
    clearSync();
  };

  // Handle district selection
  const handleDistrictChange = (districtCode: string) => {
    const params = new URLSearchParams(searchParams);

    if (districtCode === "all") {
      // Handle "all" selection - remove URL parameter (default state)
      params.delete("kecamatan");
      form.setValue("district_code", "", { shouldValidate: true });
      form.setValue("district", "", { shouldValidate: true });
    } else {
      // Handle specific district selection
      params.set("kecamatan", districtCode);
      const selectedDistrict = data.districts?.find(
        (d: District) => d.code === districtCode,
      );

      if (selectedDistrict) {
        // Update both code and name fields
        form.setValue("district_code", districtCode, { shouldValidate: true });
        form.setValue("district", selectedDistrict.name, {
          shouldValidate: true,
        });
      }
    }

    // Update URL
    router.replace(`?${params.toString()}`, { scroll: false });
    onClearGeocodingError?.();

    // Clear sync status when user manually changes selection
    clearSync();
  };

  // Handle manual override
  const handleManualOverride = () => {
    clearSync();
    // Focus on the first empty field
    if (!selectedProvinceCode) {
      // Focus province field
    } else if (!selectedRegencyCode) {
      // Focus regency field
    } else if (!selectedDistrictCode) {
      // Focus district field
    }
  };

  // Handle apply sync
  const handleApplySync = async () => {
    try {
      const result = await applyToForm();
      if (result.applied) {
        // Show success feedback
        console.log(
          "Administrative data applied successfully:",
          result.appliedFields,
        );
      }
    } catch (error) {
      console.error("Failed to apply administrative sync:", error);
    }
  };

  const isFromGeocoding = lastGeocodingSource === "coordinates";
  const geocodingClasses = isFromGeocoding
    ? "border-green-300 bg-green-50/30"
    : "";

  // Enhanced styling based on sync status
  const syncStyling = getConfidenceStyling(confidenceLevel);
  const enhancedGeocodingClasses = hasValidMatch
    ? `${syncStyling.bgColor} ${syncStyling.borderColor} border`
    : geocodingClasses;

  return (
    <div className="space-y-6">
      {/* Enhanced Sync Status Display */}
      {showSyncStatus && syncStatus && (
        <AdministrativeSyncStatus
          syncStatus={syncStatus}
          isProcessing={isSyncProcessing}
          onApply={handleApplySync}
          onManualOverride={handleManualOverride}
          onRetry={() => {
            // Retry processing if we have geocoding data
            if (enhancedGeocoding) {
              processGeocoding(enhancedGeocoding);
            }
          }}
          className="mb-4"
        />
      )}

      {/* Auto-filled Values Display */}
      {hasValidMatch && enhancedGeocoding && (
        <Card
          className={`${syncStyling.bgColor} ${syncStyling.borderColor} border`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className={`h-5 w-5 ${syncStyling.iconColor}`} />
                <div>
                  <h4
                    className={`text-sm font-medium ${syncStyling.textColor}`}
                  >
                    Lokasi Otomatis Terdeteksi
                  </h4>
                  <p className="mt-1 text-xs text-neutral-600">
                    {enhancedGeocoding.administrative.province.name &&
                      `Provinsi: ${enhancedGeocoding.administrative.province.name}`}
                    {enhancedGeocoding.administrative.regency.name &&
                      ` • Kota: ${enhancedGeocoding.administrative.regency.name}`}
                    {enhancedGeocoding.administrative.district.name &&
                      ` • Kecamatan: ${enhancedGeocoding.administrative.district.name}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {Math.round((syncStatus?.confidence || 0) * 100)}% Akurat
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleManualOverride}
                  className="h-8 px-3 text-xs"
                >
                  <Settings className="mr-1 h-3 w-3" />
                  Ubah
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Administrative Fields Grid */}
      <div
        className={`grid grid-cols-1 gap-6 transition-all duration-300 md:grid-cols-2 lg:grid-cols-3 ${
          !isFormActivated ? "pointer-events-none opacity-40" : "opacity-100"
        }`}
      >
        {/* Province Selection */}
        <div className="w-full">
          <FormField
            control={form.control}
            name="province"
            render={() => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2 text-base font-semibold text-neutral-900">
                  Provinsi *
                  {isGeocodingFromCoords && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                  {isFromGeocoding && (
                    <MapPin className="h-4 w-4 text-green-600" />
                  )}
                  {hasValidMatch &&
                    enhancedGeocoding?.administrative.province.code && (
                      <CheckCircle
                        className={`h-4 w-4 ${syncStyling.iconColor}`}
                      />
                    )}
                </FormLabel>
                <FormControl>
                  <ComboboxField
                    options={provinceOptions}
                    value={
                      selectedAllProvince
                        ? "all"
                        : selectedProvinceCode || "all"
                    }
                    onValueChange={handleProvinceChange}
                    placeholder="Pilih provinsi..."
                    emptyMessage="Tidak ada provinsi ditemukan."
                    searchPlaceholder="Cari provinsi..."
                    disabled={
                      disabled ||
                      isGeocodingFromCoords ||
                      loading.provinces ||
                      !isFormActivated
                    }
                    loading={loading.provinces}
                    size="lg"
                    error={!!form.formState.errors.province}
                    className={cn(enhancedGeocodingClasses, "w-full")}
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
        <div className="w-full">
          <FormField
            control={form.control}
            name="city"
            render={() => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2 text-base font-semibold text-neutral-900">
                  Kabupaten/Kota *
                  {isGeocodingFromCoords && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                  {isFromGeocoding && (
                    <MapPin className="h-4 w-4 text-green-600" />
                  )}
                  {hasValidMatch &&
                    enhancedGeocoding?.administrative.regency.code && (
                      <CheckCircle
                        className={`h-4 w-4 ${syncStyling.iconColor}`}
                      />
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
                      loading.regencies ||
                      !isFormActivated
                    }
                    loading={loading.regencies}
                    size="lg"
                    error={!!form.formState.errors.city}
                    className={cn(enhancedGeocodingClasses, "w-full")}
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
        <div className="w-full">
          <FormField
            control={form.control}
            name="district"
            render={() => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2 text-base font-semibold text-neutral-900">
                  Kecamatan *
                  {isGeocodingFromCoords && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                  {isFromGeocoding && (
                    <MapPin className="h-4 w-4 text-green-600" />
                  )}
                  {hasValidMatch &&
                    enhancedGeocoding?.administrative.district.code && (
                      <CheckCircle
                        className={`h-4 w-4 ${syncStyling.iconColor}`}
                      />
                    )}
                </FormLabel>
                <FormControl>
                  <ComboboxField
                    options={districtOptions}
                    value={
                      selectedAllDistrict
                        ? "all"
                        : selectedDistrictCode || "all"
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
                      loading.districts ||
                      !isFormActivated
                    }
                    loading={loading.districts}
                    size="lg"
                    error={!!form.formState.errors.district}
                    className={cn(enhancedGeocodingClasses, "w-full")}
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

      {/* Manual Override Instructions */}
      {hasValidMatch && !canAutoSelect && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <h4 className="mb-1 text-sm font-medium text-blue-700">
                Perlu Verifikasi Manual
              </h4>
              <p className="mb-3 text-sm text-blue-600">
                Lokasi terdeteksi dengan keakuratan rendah. Silakan periksa dan
                pilih data administratif yang benar.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleManualOverride}
                className="h-8 px-3 text-xs"
              >
                <Settings className="mr-1 h-3 w-3" />
                Pilih Manual
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
