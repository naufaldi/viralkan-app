import { UseFormReturn } from "react-hook-form";
import { CreateReportInput } from "../../../lib/types/api";
import { MapPin } from "lucide-react";
import { ReportCategoryField } from "./fields/report-category-field";
import { ReportAddressFields } from "./fields/report-address-fields";
import { ReportLocationFields } from "./fields/report-location-fields";

interface ReportFormFieldsProps {
  form: UseFormReturn<CreateReportInput>;
  disabled?: boolean;
  isEditing?: boolean;
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
  mode?: "auto" | "manual";
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
  mode = "auto",
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
        <ReportCategoryField 
          form={form} 
          disabled={disabled} 
          isFormActivated={isFormActivated} 
        />

        {/* Street Name & Address */}
        <div className="space-y-6">
          <ReportAddressFields
            form={form}
            disabled={disabled}
            isFormActivated={isFormActivated}
            isGeocodingFromCoords={isGeocodingFromCoords}
            lastGeocodingSource={lastGeocodingSource}
            onClearGeocodingError={onClearGeocodingError}
            syncStatus={syncStatus}
            hasValidMatch={hasValidMatch}
            confidenceLevel={confidenceLevel}
            canAutoSelect={canAutoSelect}
            isProcessingAdminSync={isProcessingAdminSync}
            mode={mode}
          />
        </div>
      </div>

      {/* Location Fields */}
      <ReportLocationFields
        form={form}
        disabled={disabled}
        isFormActivated={isFormActivated}
        isGeocodingFromCoords={isGeocodingFromCoords}
        isGeocodingFromAddress={isGeocodingFromAddress}
        lastGeocodingSource={lastGeocodingSource}
        geocodingError={geocodingError}
        onGetAddress={onGetAddress}
        onGetCoordinates={onGetCoordinates}
        onClearGeocodingError={onClearGeocodingError}
        hasExifData={hasExifData}
        onGetLocation={onGetLocation}
        isGettingLocation={isGettingLocation}
        mode={mode}
      />
    </>
  );
};
