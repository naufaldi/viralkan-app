import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { GetAddressButton } from "../get-address-button";
import { LocationButton } from "../location-button";
import {
  useReportFormContext,
  useImageContext,
  useLocationContext,
  useReportFormActionsContext,
} from "../report-form-context";

export const ReportLocationFields = () => {
  const { form, isLoading, isFormActivated } = useReportFormContext();
  const { hasExifData, geocodingFromExifSucceeded } = useImageContext();
  const { isGeocodingFromCoords, geocodingError, isGettingLocation } =
    useLocationContext();
  const { handleGetAddressFromCoordinates, getCurrentLocation } =
    useReportFormActionsContext();
  const disabled = isLoading;
  const lat = form.watch("lat");
  const lon = form.watch("lon");
  const hasValidCoordinates =
    typeof lat === "number" &&
    typeof lon === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lon);

  // Determine if location buttons should be shown
  // Show buttons if:
  // - No EXIF data (manual required)
  // - OR EXIF exists but geocoding failed (auto fallback)
  // Hide buttons if:
  // - EXIF exists AND geocoding succeeded (auto success)
  const shouldShowLocationButtons =
    !hasExifData || (hasExifData && !geocodingFromExifSucceeded);

  // Show warning banner if EXIF exists but geocoding failed
  const showGeocodingFallbackWarning =
    hasExifData && !geocodingFromExifSucceeded && isFormActivated;

  return (
    <>
      {showGeocodingFallbackWarning && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            ⚠️ Kami tidak bisa menemukan alamat yang pasti dari lokasi foto
          </p>
          <p className="mt-1 text-sm text-amber-700">
            Mohon lengkapi alamat di bawah ini atau gunakan bantuan lokasi.
          </p>
        </div>
      )}

      {isFormActivated && shouldShowLocationButtons && (
        <div className="mt-4 space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm font-semibold text-neutral-900">
            Bantuan Lokasi
          </p>
          <p className="text-sm text-neutral-600">
            Coba lokasi otomatis atau cari berdasarkan alamat.
          </p>
          <div className="flex flex-col gap-3 md:flex-row">
            {getCurrentLocation && (
              <LocationButton
                onGetLocation={getCurrentLocation}
                isLoading={isGettingLocation}
                disabled={disabled}
                isFormActivated={isFormActivated}
              />
            )}
            {handleGetAddressFromCoordinates && (
              <GetAddressButton
                onClick={handleGetAddressFromCoordinates}
                isLoading={isGeocodingFromCoords}
                disabled={disabled}
                isValidCoordinates={hasValidCoordinates}
              />
            )}
          </div>
        </div>
      )}

      {geocodingError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{geocodingError}</p>
        </div>
      )}

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
                Beri petunjuk singkat agar lokasi mudah ditemukan (maksimal 500
                karakter).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
