import { useState, useEffect } from "react";
import { sharingApi } from "@/services/api-client";

interface UseReportSharingOptions {
  reportId: string;
  enabled?: boolean;
}

interface UseReportSharingReturn {
  // State
  shareDetails: {
    shareCount: number;
    platformBreakdown: Record<string, number>;
    recentShares: Array<{
      platform: string;
      sharedAt: Date;
      userId?: string;
    }>;
  } | null;
  validation: {
    eligible: boolean;
    reason?: string;
  } | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  refetch: () => void;
}

export function useReportSharing({
  reportId,
  enabled = true,
}: UseReportSharingOptions): UseReportSharingReturn {
  const [shareDetails, setShareDetails] =
    useState<UseReportSharingReturn["shareDetails"]>(null);
  const [validation, setValidation] =
    useState<UseReportSharingReturn["validation"]>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!enabled || !reportId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch share details and validation in parallel
      const [detailsResult, validationResult] = await Promise.all([
        sharingApi.getReportShareDetails(reportId),
        sharingApi.validateReportForSharing(reportId),
      ]);

      setShareDetails(detailsResult);
      setValidation(validationResult);
    } catch (err) {
      console.error("Error fetching report sharing data:", err);
      setError("Gagal memuat data pembagian laporan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [reportId, enabled]);

  const refetch = () => {
    fetchData();
  };

  return {
    shareDetails,
    validation,
    isLoading,
    error,
    refetch,
  };
}
