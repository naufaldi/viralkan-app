/**
 * Administrative Sync Hook
 *
 * Custom hook for managing administrative data synchronization
 * between geocoding responses and administrative select components.
 *
 * Following Viralkan Design System 2.0 & Frontend Development Guidelines
 */

import { useState, useEffect, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { useAdministrative } from "./use-administrative";
import type {
  Province,
  Regency,
  District,
} from "../../services/administrative";
import {
  processGeocodingResponse,
  getAdministrativeSyncStatus,
  applyEnhancedGeocodingToForm,
  type EnhancedGeocodingResponse,
  type AdministrativeSyncStatus,
} from "../../lib/utils/enhanced-geocoding-handler";
import type { CurrentGeocodingResponse } from "../../lib/types/administrative-sync-analysis";
import type { CreateReportInput } from "../../lib/types/api";

/**
 * Administrative sync hook return type
 */
interface UseAdministrativeSyncReturn {
  // State
  enhancedGeocoding: EnhancedGeocodingResponse | null;
  syncStatus: AdministrativeSyncStatus | null;
  isProcessing: boolean;
  lastProcessedAt: Date | null;

  // Actions
  processGeocoding: (
    geocodingResponse: CurrentGeocodingResponse,
  ) => Promise<void>;
  applyToForm: () => Promise<{
    applied: boolean;
    appliedFields: string[];
    skippedFields: string[];
  }>;
  clearSync: () => void;

  // Utilities
  hasValidMatch: boolean;
  canAutoSelect: boolean;
  confidenceLevel: "high" | "medium" | "low" | "none";
}

/**
 * Administrative sync hook configuration
 */
interface UseAdministrativeSyncConfig {
  form: UseFormReturn<CreateReportInput>;
  autoApply?: boolean;
  confidenceThreshold?: number;
  enableValidation?: boolean;
}

/**
 * Custom hook for administrative data synchronization
 */
export function useAdministrativeSync({
  form,
  autoApply = false,
  confidenceThreshold = 0.7,
  enableValidation = true,
}: UseAdministrativeSyncConfig): UseAdministrativeSyncReturn {
  // State
  const [enhancedGeocoding, setEnhancedGeocoding] =
    useState<EnhancedGeocodingResponse | null>(null);
  const [syncStatus, setSyncStatus] = useState<AdministrativeSyncStatus | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessedAt, setLastProcessedAt] = useState<Date | null>(null);

  // Get administrative data
  const { data: administrativeData, loading: administrativeLoading } =
    useAdministrative();

  /**
   * Process geocoding response and find administrative matches
   */
  const processGeocoding = useCallback(
    async (geocodingResponse: CurrentGeocodingResponse) => {
      if (administrativeLoading || !administrativeData) {
        console.warn("Administrative data not ready for processing");
        return;
      }

      setIsProcessing(true);

      try {
        // Process geocoding response with fuzzy matching
        const enhanced = processGeocodingResponse(geocodingResponse, {
          provinces: administrativeData.provinces,
          regencies: administrativeData.regencies,
          districts: administrativeData.districts,
        });

        // Get sync status for UI feedback
        const status = getAdministrativeSyncStatus(enhanced);

        // Update state
        setEnhancedGeocoding(enhanced);
        setSyncStatus(status);
        setLastProcessedAt(new Date());

        // Auto-apply if enabled and confidence is high enough
        if (
          autoApply &&
          status.canAutoSelect &&
          status.confidence >= confidenceThreshold
        ) {
          await applyToForm();
        }
      } catch (error) {
        console.error("Error processing geocoding response:", error);
        setEnhancedGeocoding(null);
        setSyncStatus(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [administrativeData, administrativeLoading, autoApply, confidenceThreshold],
  );

  /**
   * Apply enhanced geocoding to form
   */
  const applyToForm = useCallback(async (): Promise<{
    applied: boolean;
    appliedFields: string[];
    skippedFields: string[];
  }> => {
    if (!enhancedGeocoding || !syncStatus) {
      return {
        applied: false,
        appliedFields: [],
        skippedFields: [],
      };
    }

    const result = applyEnhancedGeocodingToForm(
      enhancedGeocoding,
      form,
      syncStatus,
    );

    // Trigger form validation after applying values
    if (result.applied) {
      await form.trigger(["province", "city", "district"]);
    }

    return result;
  }, [enhancedGeocoding, syncStatus, form]);

  /**
   * Clear sync state
   */
  const clearSync = useCallback(() => {
    setEnhancedGeocoding(null);
    setSyncStatus(null);
    setLastProcessedAt(null);
  }, []);

  /**
   * Computed values
   */
  const hasValidMatch = syncStatus?.isSynced ?? false;
  const canAutoSelect = syncStatus?.canAutoSelect ?? false;
  const confidenceLevel = syncStatus?.confidence
    ? syncStatus.confidence >= 0.9
      ? "high"
      : syncStatus.confidence >= 0.7
        ? "medium"
        : "low"
    : "none";

  /**
   * Effect: Clear sync when form is reset
   */
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Clear sync when user manually changes administrative fields
      if (name && ["province", "city", "district"].includes(name)) {
        if (lastProcessedAt) {
          const timeSinceLastSync = Date.now() - lastProcessedAt.getTime();
          // Clear if more than 5 seconds have passed (user likely made manual changes)
          if (timeSinceLastSync > 5000) {
            clearSync();
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, lastProcessedAt, clearSync]);

  return {
    // State
    enhancedGeocoding,
    syncStatus,
    isProcessing,
    lastProcessedAt,

    // Actions
    processGeocoding,
    applyToForm,
    clearSync,

    // Utilities
    hasValidMatch,
    canAutoSelect,
    confidenceLevel,
  };
}

/**
 * Hook for manual administrative sync (without auto-apply)
 */
export function useManualAdministrativeSync(
  form: UseFormReturn<CreateReportInput>,
) {
  return useAdministrativeSync({
    form,
    autoApply: false,
    confidenceThreshold: 0.9,
    enableValidation: true,
  });
}

/**
 * Hook for automatic administrative sync (with auto-apply)
 */
export function useAutoAdministrativeSync(
  form: UseFormReturn<CreateReportInput>,
) {
  return useAdministrativeSync({
    form,
    autoApply: true,
    confidenceThreshold: 0.7,
    enableValidation: true,
  });
}

export default {
  useAdministrativeSync,
  useManualAdministrativeSync,
  useAutoAdministrativeSync,
};
