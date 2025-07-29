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
}: ReportFormFieldsProps) => {
  return (
    <>
      {/* Progressive Activation Notice */}
      {!isFormActivated && (
        <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-lg text-center">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="h-6 w-6 text-neutral-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                Formulir akan aktif setelah foto diunggah
              </h3>
              <p className="text-sm text-neutral-600 max-w-md mx-auto">
                Unggah foto jalan rusak terlebih dahulu. Sistem akan mengekstrak informasi lokasi dari foto untuk mempermudah pengisian formulir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields Grid - Responsive Layout */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-300 ${
        !isFormActivated ? 'opacity-40 pointer-events-none' : 'opacity-100'
      }`}>
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
                    className="border-neutral-300 focus:border-neutral-600 focus:ring-neutral-600/20 bg-white"
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
                <SelectContent className="border-neutral-200 shadow-lg bg-white">
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
              <FormLabel className="text-base font-semibold text-neutral-900 flex items-center gap-2">
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
                  disabled={disabled || isGeocodingFromCoords || !isFormActivated}
                  size="lg"
                  className={`border-neutral-300 focus:border-neutral-600 focus:ring-neutral-600/20 transition-all duration-200 ${
                    lastGeocodingSource === "coordinates"
                      ? "border-green-300 bg-green-50/30"
                      : isFormActivated
                      ? "bg-white hover:border-neutral-400"
                      : "bg-neutral-100 cursor-not-allowed"
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

      {/* Administrative Boundaries - Cascading Dropdowns */}
      <AdministrativeSelect
        form={form}
        disabled={disabled}
        isFormActivated={isFormActivated}
        isGeocodingFromCoords={isGeocodingFromCoords}
        lastGeocodingSource={lastGeocodingSource}
        onClearGeocodingError={onClearGeocodingError}
      />

      {/* Get Coordinates Button */}
      {onGetCoordinates && (
        <div className="flex justify-center">
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
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{geocodingError}</p>
        </div>
      )}

      {/* Location Description - Full Width */}
      <div className={`transition-all duration-300 ${
        !isFormActivated ? 'opacity-40 pointer-events-none' : 'opacity-100'
      }`}>
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
                  className="border-neutral-300 focus:border-neutral-600 focus:ring-neutral-600/20 resize-none bg-white min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-sm text-neutral-600">
                Deskripsi detail lokasi kerusakan jalan untuk memudahkan komunitas
                menemukan lokasi (maksimal 500 karakter).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Latitude and Longitude Inputs with Get Address Button */}
      <div className={`space-y-6 transition-all duration-300 ${
        !isFormActivated ? 'opacity-40 pointer-events-none' : 'opacity-100'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="lat"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-semibold text-neutral-900 flex items-center gap-2">
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
                    disabled={disabled || isGeocodingFromAddress || !isFormActivated}
                    size="lg"
                    className={`border-neutral-300 focus:border-neutral-600 focus:ring-neutral-600/20 bg-white ${
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
                <FormLabel className="text-base font-semibold text-neutral-900 flex items-center gap-2">
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
                    disabled={disabled || isGeocodingFromAddress || !isFormActivated}
                    size="lg"
                    className={`border-neutral-300 focus:border-neutral-600 focus:ring-neutral-600/20 bg-white ${
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

        {/* Get Address Button */}
        {onGetAddress && (
          <div className="flex justify-center">
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
