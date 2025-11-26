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
  const { hasExifData } = useImageContext();
  const { isGeocodingFromCoords, geocodingError, isGettingLocation } =
    useLocationContext();
  const {
    handleGetAddressFromCoordinates,
    clearGeocodingError,
    getCurrentLocation,
  } = useReportFormActionsContext();
  const disabled = isLoading;

  return (
    <>
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
                📍 <span className="ml-2">Gunakan bantuan lokasi di bawah</span>
              </>
            )}
          </div>
        </div>
      )}

      {isFormActivated && (
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
                isValidCoordinates={
                  !!(
                    form.watch("lat") &&
                    form.watch("lon") &&
                    form.watch("lat") !== 0 &&
                    form.watch("lon") !== 0
                  )
                }
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
