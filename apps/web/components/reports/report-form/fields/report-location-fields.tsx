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
import { CreateReportInput } from "../../../../lib/types/api";
import { GetCoordinatesButton } from "../get-coordinates-button";
import { GetAddressButton } from "../get-address-button";
import { LocationButton } from "../location-button";
import { Loader2, MapPin } from "lucide-react";

interface ReportLocationFieldsProps {
  form: UseFormReturn<CreateReportInput>;
  disabled?: boolean;
  isFormActivated?: boolean;
  isGeocodingFromCoords?: boolean;
  isGeocodingFromAddress?: boolean;
  lastGeocodingSource?: "coordinates" | "address" | null;
  geocodingError?: string | null;
  onGetAddress?: () => void;
  onGetCoordinates?: () => void;
  onClearGeocodingError?: () => void;
  hasExifData?: boolean;
  onGetLocation?: () => void;
  isGettingLocation?: boolean;
  mode?: "auto" | "manual";
}

export const ReportLocationFields = ({
  form,
  disabled,
  isFormActivated = false,
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
  mode = "auto",
}: ReportLocationFieldsProps) => {
  return (
    <>
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
      {isFormActivated && !hasExifData && onGetLocation && mode === "auto" && (
        <LocationButton
          onGetLocation={onGetLocation}
          isLoading={isGettingLocation}
          disabled={disabled}
          isFormActivated={isFormActivated}
        />
      )}

      {/* Progressive Disclosure: Manual Location Buttons - Only show when form is activated and EXIF unavailable */}
      {isFormActivated && onGetCoordinates && !hasExifData && mode === "manual" && (
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
                      disabled || (mode === "manual" && isGeocodingFromAddress) || !isFormActivated || mode === "manual"
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
                      disabled || (mode === "manual" && isGeocodingFromAddress) || !isFormActivated || mode === "manual"
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
        {isFormActivated && onGetAddress && !hasExifData && mode === "auto" && (
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
