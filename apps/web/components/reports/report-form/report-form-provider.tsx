"use client";

import { useState, useEffect, useMemo } from "react";
import { ReportResponse } from "../../../lib/types/api";
import { useReportForm } from "../../../hooks/reports/use-report-form";
import {
  ReportFormContext,
  ImageContext,
  LocationContext,
  ReportFormActionsContext,
} from "./report-form-context";

interface ReportFormProviderProps {
  children: React.ReactNode;
  onSuccess?: (reportId: string) => void;
  initialData?: ReportResponse;
  isEditing?: boolean;
  mode?: "auto" | "manual";
}

export function ReportFormProvider({
  children,
  onSuccess,
  initialData,
  isEditing = false,
  mode = "auto",
}: ReportFormProviderProps) {
  const [isFormActivated, setIsFormActivated] = useState(isEditing);

  const formState = useReportForm({ onSuccess, initialData, isEditing });

  // Derive form activation from selectedImage and isEditing
  useEffect(() => {
    if (isEditing) {
      setIsFormActivated(true);
    } else if (formState.selectedImage && !isFormActivated) {
      setIsFormActivated(true);
    } else if (!formState.selectedImage && !isEditing && isFormActivated) {
      setIsFormActivated(false);
    }
  }, [formState.selectedImage, isFormActivated, isEditing]);

  // Core form context value (6 properties)
  const formContextValue = useMemo(
    () => ({
      form: formState.form,
      formError: formState.formError,
      isLoading: formState.isLoading,
      isFormActivated,
      mode,
      submitError: formState.submitError,
    }),
    [
      formState.form,
      formState.formError,
      formState.isLoading,
      isFormActivated,
      mode,
      formState.submitError,
    ],
  );

  // Image context value (7 properties)
  const imageContextValue = useMemo(
    () => ({
      selectedImage: formState.selectedImage,
      uploadError: formState.uploadError,
      imageUploadFailed: formState.imageUploadFailed,
      isUploadingImage: formState.isUploadingImage,
      isExtractingExif: formState.isExtractingExif,
      hasExifWarning: formState.hasExifWarning,
      hasExifData: formState.hasExifData,
    }),
    [
      formState.selectedImage,
      formState.uploadError,
      formState.imageUploadFailed,
      formState.isUploadingImage,
      formState.isExtractingExif,
      formState.hasExifWarning,
      formState.hasExifData,
    ],
  );

  // Location context value (11 properties)
  const locationContextValue = useMemo(
    () => ({
      // Geocoding state
      isGeocodingFromCoords: formState.isGeocodingFromCoords,
      isGeocodingFromAddress: formState.isGeocodingFromAddress,
      lastGeocodingSource: formState.lastGeocodingSource,
      geocodingError: formState.geocodingError,
      // Location state
      isGettingLocation: formState.isGettingLocation,
      // Administrative sync state
      syncStatus: formState.syncStatus,
      hasValidMatch: formState.hasValidMatch,
      confidenceLevel: formState.confidenceLevel,
      canAutoSelect: formState.canAutoSelect,
      isProcessingAdminSync: formState.isProcessingAdminSync,
    }),
    [
      formState.isGeocodingFromCoords,
      formState.isGeocodingFromAddress,
      formState.lastGeocodingSource,
      formState.geocodingError,
      formState.isGettingLocation,
      formState.syncStatus,
      formState.hasValidMatch,
      formState.confidenceLevel,
      formState.canAutoSelect,
      formState.isProcessingAdminSync,
    ],
  );

  // Actions context value (stable references - 9 properties)
  const actionsContextValue = useMemo(
    () => ({
      handleImageSelect: formState.handleImageSelect,
      handleImageRemove: formState.handleImageRemove,
      handleImageUploadError: formState.handleImageUploadError,
      handleImageUploadSuccess: formState.handleImageUploadSuccess,
      getCurrentLocation: formState.getCurrentLocation,
      handleGetAddressFromCoordinates:
        formState.handleGetAddressFromCoordinates,
      handleGetCoordinatesFromAddress:
        formState.handleGetCoordinatesFromAddress,
      clearGeocodingError: formState.clearGeocodingError,
      onSubmit: formState.onSubmit,
    }),
    [
      formState.handleImageSelect,
      formState.handleImageRemove,
      formState.handleImageUploadError,
      formState.handleImageUploadSuccess,
      formState.getCurrentLocation,
      formState.handleGetAddressFromCoordinates,
      formState.handleGetCoordinatesFromAddress,
      formState.clearGeocodingError,
      formState.onSubmit,
    ],
  );

  return (
    <ReportFormContext.Provider value={formContextValue}>
      <ImageContext.Provider value={imageContextValue}>
        <LocationContext.Provider value={locationContextValue}>
          <ReportFormActionsContext.Provider value={actionsContextValue}>
            {children}
          </ReportFormActionsContext.Provider>
        </LocationContext.Provider>
      </ImageContext.Provider>
    </ReportFormContext.Provider>
  );
}
