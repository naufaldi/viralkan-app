import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateReportSchema, CreateReportInput, ReportResponse } from "../../../lib/types/api";
import { useReportImage } from "./use-report-image";
import { useReportLocation } from "./use-report-location";
import { useReportSubmit } from "./use-report-submit";

interface UseReportFormProps {
  onSuccess?: (reportId: string) => void;
  initialData?: ReportResponse;
  isEditing?: boolean;
}

export const useReportForm = ({ onSuccess, initialData, isEditing = false }: UseReportFormProps) => {
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const form = useForm<CreateReportInput>({
    resolver: zodResolver(CreateReportSchema),
    mode: "onChange",
    defaultValues: initialData
      ? {
          street_name: initialData.street_name,
          category: initialData.category,
          location_text: initialData.location_text,
          image_url: initialData.image_url,
          lat: initialData.lat,
          lon: initialData.lon,
          district: initialData.district,
          city: initialData.city,
          province: initialData.province,
          province_code: "", // These might not be in initialData, so default to empty
          regency_code: "",
          district_code: "",
        }
      : {
          street_name: "",
          category: undefined,
          location_text: "",
          image_url: "",
          lat: 0,
          lon: 0,
          district: "",
          city: "",
          province: "",
          // Administrative codes (optional - for backend validation)
          province_code: "",
          regency_code: "",
          district_code: "",
        },
  });

  // Clear form errors when user starts typing
  const watchedValues = form.watch();
  useEffect(() => {
    if (formError) {
      setFormError(undefined);
    }
  }, [watchedValues, formError]);

  // Initialize location hook first as image hook needs applyAdministrativeSearchResults
  const locationState = useReportLocation({ form });

  // Initialize image hook
  const imageState = useReportImage({ 
    form, 
    applyAdministrativeSearchResults: locationState.applyAdministrativeSearchResults 
  });

  // Initialize submit hook
  const submitState = useReportSubmit({
    form,
    selectedImage: imageState.selectedImage,
    imageUploadFailed: imageState.imageUploadFailed,
    isEditing,
    initialData,
    onSuccess,
    setFormError,
    setUploadError: imageState.setUploadError,
  });

  // Initialize selected image if editing
  useEffect(() => {
    if (isEditing && initialData?.image_url && !imageState.selectedImage) {
      // We can't easily convert URL to File object here without fetching,
      // but we can set the form value (already done in defaultValues)
      // and maybe set a flag that we have an existing image
    }
  }, [isEditing, initialData, imageState.selectedImage]);

  const isLoading =
    submitState.isSubmitting ||
    submitState.isUpdating ||
    submitState.isUploading ||
    submitState.isUploadingImage ||
    locationState.isGettingLocation ||
    imageState.isExtractingExif ||
    locationState.isGeocodingFromCoords ||
    locationState.isGeocodingFromAddress ||
    locationState.isProcessingAdminSync;

  return {
    form,
    formError,
    isLoading,
    // Image State & Handlers
    selectedImage: imageState.selectedImage,
    uploadError: imageState.uploadError,
    imageUploadFailed: imageState.imageUploadFailed,
    isUploadingImage: submitState.isUploadingImage,
    isExtractingExif: imageState.isExtractingExif,
    exifError: imageState.exifError,
    hasExifWarning: imageState.hasExifWarning,
    hasExifData: imageState.hasExifData,
    handleImageSelect: imageState.handleImageSelect,
    handleImageRemove: () => imageState.handleImageRemove(locationState.clearSync),
    handleImageUploadError: imageState.handleImageUploadError,
    handleImageUploadSuccess: imageState.handleImageUploadSuccess,
    // Location State & Handlers
    isGettingLocation: locationState.isGettingLocation,
    isGeocodingFromCoords: locationState.isGeocodingFromCoords,
    isGeocodingFromAddress: locationState.isGeocodingFromAddress,
    lastGeocodingSource: locationState.lastGeocodingSource,
    geocodingError: locationState.geocodingError,
    syncStatus: locationState.syncStatus,
    hasValidMatch: locationState.hasValidMatch,
    confidenceLevel: locationState.confidenceLevel,
    canAutoSelect: locationState.canAutoSelect,
    isProcessingAdminSync: locationState.isProcessingAdminSync,
    getCurrentLocation: locationState.getCurrentLocation,
    handleGetAddressFromCoordinates: locationState.handleGetAddressFromCoordinates,
    handleGetCoordinatesFromAddress: locationState.handleGetCoordinatesFromAddress,
    clearGeocodingError: locationState.clearGeocodingError,
    // Submit State & Handlers
    submitError: submitState.submitError,
    onSubmit: submitState.onSubmit,
  };
};
