"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Loader2, MapPin } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { ComboboxField, ComboboxOption } from "../ui/combobox-field";
import {
  useProvinces,
  useRegencies,
  useDistricts,
} from "../../hooks/reports/use-administrative";
import { CreateReportInput } from "../../lib/types/api";
import { Province, Regency, District } from "../../services/api-client";

interface AdministrativeSelectProps {
  form: UseFormReturn<CreateReportInput>;
  disabled?: boolean;
  // Geocoding integration props
  isGeocodingFromCoords?: boolean;
  lastGeocodingSource?: "coordinates" | "address" | null;
  onClearGeocodingError?: () => void;
}

export const AdministrativeSelect = ({
  form,
  disabled = false,
  isGeocodingFromCoords = false,
  lastGeocodingSource = null,
  onClearGeocodingError,
}: AdministrativeSelectProps) => {
  // Get current form values for cascading
  const selectedProvinceCode = form.watch("province_code");
  const selectedRegencyCode = form.watch("regency_code");
  const selectedDistrictCode = form.watch("district_code");

  // Fetch data using our custom hooks
  const {
    data: provincesData,
    isLoading: provincesLoading,
    error: provincesError,
  } = useProvinces();

  const {
    data: regenciesData,
    isLoading: regenciesLoading,
    error: regenciesError,
  } = useRegencies(selectedProvinceCode);

  const {
    data: districtsData,
    isLoading: districtsLoading,
    error: districtsError,
  } = useDistricts(selectedRegencyCode);

  // Transform data for ComboboxField
  const provinceOptions: ComboboxOption[] = React.useMemo(() => {
    if (!provincesData?.data) return [];
    return provincesData.data.map((province: Province) => ({
      value: province.code,
      label: province.name,
      searchValue: province.name.toLowerCase(),
    }));
  }, [provincesData]);

  const regencyOptions: ComboboxOption[] = React.useMemo(() => {
    if (!regenciesData?.data) return [];
    return regenciesData.data.map((regency: Regency) => ({
      value: regency.code,
      label: regency.name,
      searchValue: regency.name.toLowerCase(),
    }));
  }, [regenciesData]);

  const districtOptions: ComboboxOption[] = React.useMemo(() => {
    if (!districtsData?.data) return [];
    return districtsData.data.map((district: District) => ({
      value: district.code,
      label: district.name,
      searchValue: district.name.toLowerCase(),
    }));
  }, [districtsData]);

  // Handle province selection - reset dependent fields
  const handleProvinceChange = (provinceCode: string) => {
    const selectedProvince = provincesData?.data?.find(
      (p: Province) => p.code === provinceCode
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
      
      onClearGeocodingError?.();
    }
  };

  // Handle regency selection - reset dependent fields
  const handleRegencyChange = (regencyCode: string) => {
    const selectedRegency = regenciesData?.data?.find(
      (r: Regency) => r.code === regencyCode
    );

    if (selectedRegency) {
      // Update both code and name fields
      form.setValue("regency_code", regencyCode);
      form.setValue("city", selectedRegency.name);
      
      // Reset dependent fields
      form.setValue("district_code", "");
      form.setValue("district", "");
      
      onClearGeocodingError?.();
    }
  };

  // Handle district selection
  const handleDistrictChange = (districtCode: string) => {
    const selectedDistrict = districtsData?.data?.find(
      (d: District) => d.code === districtCode
    );

    if (selectedDistrict) {
      // Update both code and name fields
      form.setValue("district_code", districtCode);
      form.setValue("district", selectedDistrict.name);
      
      onClearGeocodingError?.();
    }
  };

  const isFromGeocoding = lastGeocodingSource === "coordinates";
  const geocodingClasses = isFromGeocoding ? "border-green-300 bg-green-50/30" : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Province Selection */}
      <FormField
        control={form.control}
        name="province"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              Province *
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
                value={selectedProvinceCode || ""}
                onValueChange={handleProvinceChange}
                placeholder="Select province..."
                emptyMessage="No provinces found."
                searchPlaceholder="Search provinces..."
                disabled={disabled || isGeocodingFromCoords || provincesLoading}
                loading={provincesLoading}
                size="lg"
                error={!!form.formState.errors.province}
                className={geocodingClasses}
              />
            </FormControl>
            <FormDescription className="text-sm text-neutral-600">
              Province name where the damage is located.
            </FormDescription>
            <FormMessage />
            {provincesError && (
              <p className="text-sm text-red-600">
                Failed to load provinces. Please try again.
              </p>
            )}
          </FormItem>
        )}
      />

      {/* Regency Selection */}
      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              City *
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
                value={selectedRegencyCode || ""}
                onValueChange={handleRegencyChange}
                placeholder={
                  !selectedProvinceCode
                    ? "Select province first..."
                    : "Select city..."
                }
                emptyMessage={
                  !selectedProvinceCode
                    ? "Please select a province first."
                    : "No cities found for this province."
                }
                searchPlaceholder="Search cities..."
                disabled={
                  disabled ||
                  isGeocodingFromCoords ||
                  !selectedProvinceCode ||
                  regenciesLoading
                }
                loading={regenciesLoading}
                size="lg"
                error={!!form.formState.errors.city}
                className={geocodingClasses}
              />
            </FormControl>
            <FormDescription className="text-sm text-neutral-600">
              City or regency name where the damage is located.
            </FormDescription>
            <FormMessage />
            {regenciesError && selectedProvinceCode && (
              <p className="text-sm text-red-600">
                Failed to load cities. Please try again.
              </p>
            )}
          </FormItem>
        )}
      />

      {/* District Selection */}
      <FormField
        control={form.control}
        name="district"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              District *
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
                value={selectedDistrictCode || ""}
                onValueChange={handleDistrictChange}
                placeholder={
                  !selectedRegencyCode
                    ? "Select city first..."
                    : "Select district..."
                }
                emptyMessage={
                  !selectedRegencyCode
                    ? "Please select a city first."
                    : "No districts found for this city."
                }
                searchPlaceholder="Search districts..."
                disabled={
                  disabled ||
                  isGeocodingFromCoords ||
                  !selectedRegencyCode ||
                  districtsLoading
                }
                loading={districtsLoading}
                size="lg"
                error={!!form.formState.errors.district}
                className={geocodingClasses}
              />
            </FormControl>
            <FormDescription className="text-sm text-neutral-600">
              District name where the damage is located.
            </FormDescription>
            <FormMessage />
            {districtsError && selectedRegencyCode && (
              <p className="text-sm text-red-600">
                Failed to load districts. Please try again.
              </p>
            )}
          </FormItem>
        )}
      />
    </div>
  );
};