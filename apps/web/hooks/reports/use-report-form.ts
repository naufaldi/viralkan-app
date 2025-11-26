import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateReportSchema,
  CreateReportInput,
  ReportResponse,
} from "../../lib/types/api";
import { useReportImage } from "./use-report-image";
import { useReportLocation } from "./use-report-location";
import { useReportSubmit } from "./use-report-submit";

interface UseReportFormProps {
  onSuccess?: (reportId: string) => void;
  initialData?: ReportResponse;
  isEditing?: boolean;
}

export const useReportForm = ({
  onSuccess,
  initialData,
  isEditing = false,
}: UseReportFormProps) => {
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
          province_code: initialData.province_code || "",
          regency_code: initialData.regency_code || "",
          district_code: initialData.district_code || "",
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
          province_code: "",
          regency_code: "",
          district_code: "",
        },
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset({
        street_name: initialData.street_name,
        category: initialData.category,
        location_text: initialData.location_text,
        image_url: initialData.image_url,
        lat: initialData.lat,
        lon: initialData.lon,
        district: initialData.district,
        city: initialData.city,
        province: initialData.province,
        province_code: initialData.province_code || "",
        regency_code: initialData.regency_code || "",
        district_code: initialData.district_code || "",
      });
    }
  }, [initialData, form]);

  const watchedValues = form.watch();
  useEffect(() => {
    if (formError) {
      setFormError(undefined);
    }
  }, [watchedValues, formError]);

  const locationState = useReportLocation({ form });

  const imageState = useReportImage({
    form,
    applyAdministrativeSearchResults:
      locationState.applyAdministrativeSearchResults,
  });

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

  useEffect(() => {
    if (isEditing && initialData?.image_url && !imageState.selectedImage) {
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
    selectedImage: imageState.selectedImage,
    uploadError: imageState.uploadError,
    imageUploadFailed: imageState.imageUploadFailed,
    isUploadingImage: submitState.isUploadingImage,
    isExtractingExif: imageState.isExtractingExif,
    exifError: imageState.exifError,
    hasExifWarning: imageState.hasExifWarning,
    hasExifData: imageState.hasExifData,
    geocodingFromExifSucceeded: imageState.geocodingFromExifSucceeded,
    handleImageSelect: imageState.handleImageSelect,
    handleImageRemove: () =>
      imageState.handleImageRemove(locationState.clearSync),
    handleImageUploadError: imageState.handleImageUploadError,
    handleImageUploadSuccess: imageState.handleImageUploadSuccess,
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
    handleGetAddressFromCoordinates:
      locationState.handleGetAddressFromCoordinates,
    handleGetCoordinatesFromAddress:
      locationState.handleGetCoordinatesFromAddress,
    clearGeocodingError: locationState.clearGeocodingError,
    submitError: submitState.submitError,
    onSubmit: submitState.onSubmit,
  };
};
