import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { CreateReportInput, REPORT_CATEGORIES } from "../../../lib/types/api";
import { GetCoordinatesButton } from "./get-coordinates-button";
import { GetAddressButton } from "./get-address-button";
import { LocationButton } from "./location-button";
import { AdministrativeSelect } from "../administrative-select";
import { Loader2, MapPin } from "lucide-react";

interface ReportFormFieldsProps {
  form: UseFormReturn<CreateReportInput>;
  disabled?: boolean;
  isFormActivated?: boolean;
  selectedImage?: File | null;
  // Geocoding props
  isGeocodingFromCoords?: boolean;
  isGeocodingFromAddress?: boolean;
  lastGeocodingSource?: "coordinates" | "address" | null;
  geocodingError?: string | null;
  onGetAddress?: () => void;
  onGetCoordinates?: () => void;
  onClearGeocodingError?: () => void;
  // Progressive disclosure props
  hasExifData?: boolean;
  // Location props
  onGetLocation?: () => void;
  isGettingLocation?: boolean;
  // Administrative sync props
  syncStatus?: any; // TODO: Import proper type
  hasValidMatch?: boolean;
  confidenceLevel?: "high" | "medium" | "low" | "none";
  canAutoSelect?: boolean;
  isProcessingAdminSync?: boolean;
}

export const ReportFormFields = ({
  form,
  disabled,
  isFormActivated = false,
  // selectedImage = null, // Remove unused parameter
  isGeocodingFromCoords = false,
  isGeocodingFromAddress = false,
  lastGeocodingSource = null,
  geocodingError = null,
  onGetAddress,
  onGetCoordinates,
  onClearGeocodingError,
  hasExifData = false,
  onGetLocation,
  isGettingLocation = false,
  // Administrative sync props
  syncStatus,
  hasValidMatch = false,
  confidenceLevel = "none",
  canAutoSelect = false,
  isProcessingAdminSync = false,
}: ReportFormFieldsProps) => {
  return (
    <>
      {/* Progressive Activation Notice */}
      {!isFormActivated && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center">
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200">
              <MapPin className="h-6 w-6 text-neutral-500" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-neutral-700">
                Formulir akan aktif setelah foto diunggah
              </h3>
              <p className="mx-auto max-w-md text-sm text-neutral-600">
                Unggah foto jalan rusak terlebih dahulu. Sistem akan mengekstrak
                informasi lokasi dari foto untuk mempermudah pengisian formulir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields Grid - Responsive Layout */}
      <div
        className={`grid grid-cols-1 gap-6 transition-all duration-300 lg:grid-cols-2 ${
          !isFormActivated ? "pointer-events-none opacity-40" : "opacity-100"
        }`}
      >
        {/* Category Selection */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold text-neutral-900">
                Kategori Kerusakan *
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
                disabled={disabled || !isFormActivated}
              >
                <FormControl>
                  <SelectTrigger
                    size="lg"
                    className="border-neutral-300 bg-white focus:border-neutral-600 focus:ring-neutral-600/20"
                  >
                    <SelectValue placeholder="Pilih kategori kerusakan">
                      {field.value && (
                        <div className="flex flex-col items-start text-left">
                          <div className="font-medium text-neutral-900">
                            {
                              REPORT_CATEGORIES.find(
                                (cat) => cat.value === field.value,
                              )?.label
                            }
                          </div>
                          <div className="text-sm text-neutral-600">
                            {
                              REPORT_CATEGORIES.find(
                                (cat) => cat.value === field.value,
                              )?.description
                            }
                          </div>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="border-neutral-200 bg-white shadow-lg">
                  {REPORT_CATEGORIES.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="py-3"
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-neutral-900">
                          {option.label}
                        </div>
                        <div className="text-sm text-neutral-600">
                          {option.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription className="text-sm text-neutral-600">
                Pilih jenis kerusakan jalan yang paling sesuai dengan kondisi
                yang Anda temukan.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Street Name */}
        <FormField
          control={form.control}
          name="street_name"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2 text-base font-semibold text-neutral-900">
                Nama Jalan *
                {isGeocodingFromCoords && (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                )}
                {lastGeocodingSource === "coordinates" && (
                  <MapPin className="h-4 w-4 text-green-600" />
                )}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: Jl. Sudirman"
                  disabled={
                    disabled || isGeocodingFromCoords || !isFormActivated
                  }
                  size="lg"
                  className={`border-neutral-300 transition-all duration-200 focus:border-neutral-600 focus:ring-neutral-600/20 ${
                    lastGeocodingSource === "coordinates"
                      ? "border-green-300 bg-green-50/30"
                      : isFormActivated
                        ? "bg-white hover:border-neutral-400"
                        : "cursor-not-allowed bg-neutral-100"
                  }`}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onClearGeocodingError?.();
                  }}
                />
              </FormControl>
              <FormDescription className="text-sm text-neutral-600">
                Nama jalan atau area tempat kerusakan berada (maksimal 255
                karakter).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Administrative Boundaries - Enhanced with Sync Features */}
      <AdministrativeSelect
        form={form}
        disabled={disabled}
        isFormActivated={isFormActivated}
        isGeocodingFromCoords={isGeocodingFromCoords}
        lastGeocodingSource={lastGeocodingSource}
        onClearGeocodingError={onClearGeocodingError}
        enableAutoSync={true}
        showSyncStatus={true}
        // Administrative sync status props
        syncStatus={syncStatus}
        hasValidMatch={hasValidMatch}
        confidenceLevel={confidenceLevel}
        canAutoSelect={canAutoSelect}
        isProcessingAdminSync={isProcessingAdminSync}
      />

      {/* Location Status Indicator - UX Enhancement - Only show when form is activated */}
      {isFormActivated && (
        <div className="flex justify-center">
          <div
            className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
              hasExifData
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-blue-200 bg-blue-50 text-blue-700"
            }`}
          >
            {hasExifData ? (
              <>
                ✅{" "}
                <span className="ml-2">
                  Lokasi berhasil diekstrak dari foto
                </span>
              </>
            ) : (
              <>
                📍{" "}
                <span className="ml-2">Pilih metode lokasi di bawah ini</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Smart Fallback: Current Location Button - Only show when form is activated and EXIF unavailable */}
      {isFormActivated && !hasExifData && onGetLocation && (
        <LocationButton
          onGetLocation={onGetLocation}
          isLoading={isGettingLocation}
          disabled={disabled}
          isFormActivated={isFormActivated}
        />
      )}

      {/* Progressive Disclosure: Manual Location Buttons - Only show when form is activated and EXIF unavailable */}
      {isFormActivated && onGetCoordinates && !hasExifData && (
        <div className="flex flex-col items-center space-y-3 pt-4">
          <div className="max-w-md text-center">
            <p className="mb-2 text-sm text-neutral-600">
              🗺️ <strong>Dapatkan koordinat dari alamat</strong>
            </p>
            <p className="text-xs text-neutral-500">
              Isi nama jalan dan kabupaten/kota, lalu klik tombol di bawah
            </p>
          </div>
          <GetCoordinatesButton
            onClick={onGetCoordinates}
            isLoading={isGeocodingFromAddress}
            disabled={disabled}
            isValidAddress={!!(form.watch("street_name") && form.watch("city"))}
          />
        </div>
      )}

      {/* Geocoding Error Display */}
      {geocodingError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{geocodingError}</p>
        </div>
      )}

      {/* Location Description - Full Width */}
      <div
        className={`transition-all duration-300 ${
          !isFormActivated ? "pointer-events-none opacity-40" : "opacity-100"
        }`}
      >
        <FormField
          control={form.control}
          name="location_text"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold text-neutral-900">
                Deskripsi Lokasi *
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Contoh: Depan Mall Tunjungan Plaza, sebelah kiri arah Surabaya"
                  rows={4}
                  disabled={disabled || !isFormActivated}
                  className="min-h-[120px] resize-none border-neutral-300 bg-white focus:border-neutral-600 focus:ring-neutral-600/20"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-sm text-neutral-600">
                Deskripsi detail lokasi kerusakan jalan untuk memudahkan
                komunitas menemukan lokasi (maksimal 500 karakter).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Latitude and Longitude Inputs with Get Address Button */}
      <div
        className={`space-y-6 transition-all duration-300 ${
          !isFormActivated ? "pointer-events-none opacity-40" : "opacity-100"
        }`}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="lat"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2 text-base font-semibold text-neutral-900">
                  Latitude *
                  {isGeocodingFromAddress && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                  {lastGeocodingSource === "address" && (
                    <MapPin className="h-4 w-4 text-green-600" />
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Contoh: -7.260000"
                    disabled={
                      disabled || isGeocodingFromAddress || !isFormActivated
                    }
                    size="lg"
                    className={`border-neutral-300 bg-white focus:border-neutral-600 focus:ring-neutral-600/20 ${
                      lastGeocodingSource === "address"
                        ? "border-green-300 bg-green-50/30"
                        : ""
                    }`}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? 0 : parseFloat(value));
                      onClearGeocodingError?.();
                    }}
                    value={field.value === 0 ? "" : field.value}
                  />
                </FormControl>
                <FormDescription className="text-sm text-neutral-600">
                  Koordinat latitude lokasi kerusakan.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lon"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center gap-2 text-base font-semibold text-neutral-900">
                  Longitude *
                  {isGeocodingFromAddress && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                  {lastGeocodingSource === "address" && (
                    <MapPin className="h-4 w-4 text-green-600" />
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Contoh: 112.780000"
                    disabled={
                      disabled || isGeocodingFromAddress || !isFormActivated
                    }
                    size="lg"
                    className={`border-neutral-300 bg-white focus:border-neutral-600 focus:ring-neutral-600/20 ${
                      lastGeocodingSource === "address"
                        ? "border-green-300 bg-green-50/30"
                        : ""
                    }`}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? 0 : parseFloat(value));
                      onClearGeocodingError?.();
                    }}
                    value={field.value === 0 ? "" : field.value}
                  />
                </FormControl>
                <FormDescription className="text-sm text-neutral-600">
                  Koordinat longitude lokasi kerusakan.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Progressive Disclosure: Manual Address Button - Only show when form is activated and EXIF unavailable */}
        {isFormActivated && onGetAddress && !hasExifData && (
          <div className="flex flex-col items-center space-y-3 pt-4">
            <div className="max-w-md text-center">
              <p className="mb-2 text-sm text-neutral-600">
                📍 <strong>Dapatkan alamat dari koordinat</strong>
              </p>
              <p className="text-xs text-neutral-500">
                Isi latitude dan longitude, lalu klik tombol di bawah
              </p>
            </div>
            <GetAddressButton
              onClick={onGetAddress}
              isLoading={isGeocodingFromCoords}
              disabled={disabled}
              isValidCoordinates={
                !!(
                  form.watch("lat") &&
                  form.watch("lon") &&
                  form.watch("lat") !== 0 &&
                  form.watch("lon") !== 0
                )
              }
            />
          </div>
        )}
      </div>
    </>
  );
};
