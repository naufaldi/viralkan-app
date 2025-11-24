"use client";

import { createContext, useContext } from "react";
import { UseFormReturn } from "react-hook-form";
import { CreateReportInput } from "../../../lib/types/api";

/**
 * ReportFormContext - Core form state + Submit error
 * Used by: ALL components
 * Properties: 6 (form, formError, isLoading, isFormActivated, mode, submitError)
 */
interface ReportFormContextType {
  form: UseFormReturn<CreateReportInput>;
  formError: string | undefined;
  isLoading: boolean;
  isFormActivated: boolean;
  mode: "auto" | "manual";
  submitError: string | null;
}

const ReportFormContext = createContext<ReportFormContextType | undefined>(
  undefined,
);

export function useReportFormContext(): ReportFormContextType {
  const context = useContext(ReportFormContext);
  if (context === undefined) {
    throw new Error(
      "useReportFormContext must be used within ReportFormProvider",
    );
  }
  return context;
}

/**
 * ImageContext - Image and EXIF state
 * Used by: Components that display/use image state
 * Properties: 7 (selectedImage, uploadError, imageUploadFailed, isUploadingImage, isExtractingExif, hasExifWarning, hasExifData)
 */
interface ImageContextType {
  selectedImage: File | null;
  uploadError: string | undefined;
  imageUploadFailed: boolean;
  isUploadingImage: boolean;
  isExtractingExif: boolean;
  hasExifWarning: boolean;
  hasExifData: boolean;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export function useImageContext(): ImageContextType {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error("useImageContext must be used within ReportFormProvider");
  }
  return context;
}

/**
 * LocationContext - All location-related state (Geocoding + Location + Admin Sync)
 * Used by: Components that display/use location, geocoding, or admin sync state
 * Properties: 11 (geocoding: 4, location: 1, admin sync: 5, submit: 1)
 */
interface LocationContextType {
  // Geocoding state
  isGeocodingFromCoords: boolean;
  isGeocodingFromAddress: boolean;
  lastGeocodingSource: "coordinates" | "address" | null;
  geocodingError: string | null;
  // Location state
  isGettingLocation: boolean;
  // Administrative sync state
  syncStatus: any;
  hasValidMatch: boolean;
  confidenceLevel: "high" | "medium" | "low" | "none";
  canAutoSelect: boolean;
  isProcessingAdminSync: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

export function useLocationContext(): LocationContextType {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error(
      "useLocationContext must be used within ReportFormProvider",
    );
  }
  return context;
}

/**
 * ReportFormActionsContext - All action handlers (stable references)
 * Used by: Components that trigger actions
 * Properties: 9 (image: 4, location: 1, geocoding: 3, submit: 1)
 */
interface ReportFormActionsContextType {
  // Image handlers
  handleImageSelect: (file: File, originalFile?: File) => Promise<void>;
  handleImageRemove: () => void;
  handleImageUploadError: (error: string) => void;
  handleImageUploadSuccess: () => void;
  // Location handlers
  getCurrentLocation: () => Promise<void>;
  // Geocoding handlers
  handleGetAddressFromCoordinates: () => Promise<void>;
  handleGetCoordinatesFromAddress: () => Promise<void>;
  clearGeocodingError: () => void;
  // Submit handler
  onSubmit: (data: CreateReportInput) => Promise<void>;
}

const ReportFormActionsContext = createContext<
  ReportFormActionsContextType | undefined
>(undefined);

export function useReportFormActionsContext(): ReportFormActionsContextType {
  const context = useContext(ReportFormActionsContext);
  if (context === undefined) {
    throw new Error(
      "useReportFormActionsContext must be used within ReportFormProvider",
    );
  }
  return context;
}

export {
  ReportFormContext,
  ImageContext,
  LocationContext,
  ReportFormActionsContext,
};
export type {
  ReportFormContextType,
  ImageContextType,
  LocationContextType,
  ReportFormActionsContextType,
};
