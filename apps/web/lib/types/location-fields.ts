/**
 * Location Fields Types & Interfaces
 *
 * Consolidated types for location-related components to reduce prop drilling
 * and improve maintainability following DRY principles.
 */

import { UseFormReturn } from "react-hook-form";
import { CreateReportInput } from "./api";

// ============================================================================
// 1. ENUMS & CONSTANTS
// ============================================================================

/**
 * Location input modes for different user interaction patterns
 */
export enum LocationMode {
  AUTO = "auto",
  MANUAL = "manual",
}

/**
 * Geocoding operation sources for tracking data origin
 */
export enum GeocodingSource {
  COORDINATES = "coordinates",
  ADDRESS = "address",
  EXIF = "exif",
  MANUAL = "manual",
}

/**
 * Confidence levels for administrative data matching
 */
export enum ConfidenceLevel {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  NONE = "none",
}

// ============================================================================
// 2. CORE INTERFACES
// ============================================================================

/**
 * Geocoding state and error information
 */
export interface GeocodingState {
  /** Currently geocoding from coordinates */
  isGeocodingFromCoords: boolean;
  /** Currently geocoding from address */
  isGeocodingFromAddress: boolean;
  /** Source of last successful geocoding operation */
  lastGeocodingSource: GeocodingSource | null;
  /** Error message from failed geocoding operation */
  geocodingError: string | null;
}

/**
 * Location acquisition state
 */
export interface LocationState {
  /** Currently getting device location */
  isGettingLocation: boolean;
  /** Whether EXIF location data is available from image */
  hasExifData: boolean;
}

/**
 * Administrative synchronization state
 */
export interface AdministrativeSyncState {
  /** Current sync status object */
  syncStatus: unknown; // TODO: Import proper type from administrative-sync-analysis
  /** Whether valid administrative match was found */
  hasValidMatch: boolean;
  /** Confidence level of the administrative match */
  confidenceLevel: ConfidenceLevel;
  /** Whether auto-selection is available for the match */
  canAutoSelect: boolean;
  /** Currently processing administrative synchronization */
  isProcessingAdminSync: boolean;
}

/**
 * Form activation state for progressive disclosure
 */
export interface FormActivationState {
  /** Whether the form is activated for user interaction */
  isFormActivated: boolean;
  /** Whether form fields are disabled */
  disabled: boolean;
}

// ============================================================================
// 3. CONSOLIDATED INTERFACES
// ============================================================================

/**
 * Complete location fields configuration
 * Consolidates all location-related props to reduce prop drilling
 */
export interface LocationFieldsConfig {
  /** Form instance for field management */
  form: UseFormReturn<CreateReportInput>;
  /** Location input mode (auto/manual) */
  mode: LocationMode;
  /** Form activation and disabled state */
  formState: FormActivationState;
  /** Geocoding operation state */
  geocodingState: GeocodingState;
  /** Location acquisition state */
  locationState: LocationState;
  /** Administrative synchronization state */
  administrativeSyncState: AdministrativeSyncState;
}

/**
 * Location fields event handlers
 * Groups all callback functions for location operations
 */
export interface LocationFieldsHandlers {
  /** Clear geocoding error messages */
  onClearGeocodingError: () => void;
  /** Get address from current coordinates */
  onGetAddress: () => void;
  /** Get coordinates from current address */
  onGetCoordinates: () => void;
  /** Get current device location */
  onGetLocation: () => void;
}

/**
 * Complete location fields props interface
 * Replaces the 13 individual props in ReportLocationFields component
 */
export interface LocationFieldsProps
  extends LocationFieldsConfig,
    LocationFieldsHandlers {
  // All props are now consolidated into the above interfaces
}

// ============================================================================
// 4. LEGACY COMPATIBILITY INTERFACES
// ============================================================================

/**
 * Legacy ReportLocationFieldsProps for backward compatibility
 * @deprecated Use LocationFieldsProps instead
 */
export interface ReportLocationFieldsProps {
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

/**
 * Legacy ReportFormFieldsProps for backward compatibility
 * @deprecated Use new consolidated interface instead
 */
export interface ReportFormFieldsProps {
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
  syncStatus?: unknown;
  hasValidMatch?: boolean;
  confidenceLevel?: "high" | "medium" | "low" | "none";
  canAutoSelect?: boolean;
  isProcessingAdminSync?: boolean;
  mode?: "auto" | "manual";
}

// ============================================================================
// 5. UTILITY TYPES
// ============================================================================

/**
 * Helper type to convert legacy props to new interface
 */
export type LegacyToLocationFieldsProps = Omit<
  ReportLocationFieldsProps,
  | "mode"
  | "disabled"
  | "isFormActivated"
  | "isGeocodingFromCoords"
  | "isGeocodingFromAddress"
  | "lastGeocodingSource"
  | "geocodingError"
  | "hasExifData"
  | "isGettingLocation"
> & {
  mode: LocationMode;
  formState: FormActivationState;
  geocodingState: GeocodingState;
  locationState: LocationState;
  administrativeSyncState: AdministrativeSyncState;
};

/**
 * Type guard to check if props are using new interface
 */
export function isLocationFieldsProps(
  props: unknown,
): props is LocationFieldsProps {
  return (
    typeof props === "object" &&
    props !== null &&
    "formState" in props &&
    "geocodingState" in props &&
    "locationState" in props &&
    "administrativeSyncState" in props
  );
}

/**
 * Utility function to convert legacy props to new interface
 */
export function convertLegacyProps(
  legacy: ReportLocationFieldsProps,
): LocationFieldsProps {
  return {
    // Core form and mode
    form: legacy.form,
    mode: (legacy.mode as LocationMode) || LocationMode.AUTO,

    // Consolidated state interfaces
    formState: {
      isFormActivated: legacy.isFormActivated || false,
      disabled: legacy.disabled || false,
    },
    geocodingState: {
      isGeocodingFromCoords: legacy.isGeocodingFromCoords || false,
      isGeocodingFromAddress: legacy.isGeocodingFromAddress || false,
      lastGeocodingSource:
        (legacy.lastGeocodingSource as GeocodingSource) || null,
      geocodingError: legacy.geocodingError || null,
    },
    locationState: {
      isGettingLocation: legacy.isGettingLocation || false,
      hasExifData: legacy.hasExifData || false,
    },
    administrativeSyncState: {
      syncStatus: undefined, // Not available in legacy props
      hasValidMatch: false, // Not available in legacy props
      confidenceLevel: ConfidenceLevel.NONE,
      canAutoSelect: false,
      isProcessingAdminSync: false,
    },

    // Event handlers
    onClearGeocodingError: legacy.onClearGeocodingError || (() => {}),
    onGetAddress: legacy.onGetAddress || (() => {}),
    onGetCoordinates: legacy.onGetCoordinates || (() => {}),
    onGetLocation: legacy.onGetLocation || (() => {}),
  };
}

// ============================================================================
// 6. EXPORTS
// ============================================================================

export default {
  // Enums
  LocationMode,
  GeocodingSource,
  ConfidenceLevel,

  // Utilities
  isLocationFieldsProps,
  convertLegacyProps,
};
