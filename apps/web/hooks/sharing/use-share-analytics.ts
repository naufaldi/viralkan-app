import { useState, useEffect } from "react";
import { sharingApi } from "@/services/api-client";

interface UseShareAnalyticsOptions {
  token: string | undefined;
  filters?: {
    startDate?: string;
    endDate?: string;
    platform?: string;
  };
  enabled?: boolean;
}

interface UseShareAnalyticsReturn {
  // State
  analytics: {
    totalShares: number;
    platformBreakdown: Record<string, number>;
    topReports: Array<{
      id: string;
      title: string;
      shareCount: number;
    }>;
    dateRange: {
      start: Date;
      end: Date;
    };
  } | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  refetch: () => void;
}

export function useShareAnalytics({
  token,
  filters = {},
  enabled = true,
}: UseShareAnalyticsOptions): UseShareAnalyticsReturn {
  const [analytics, setAnalytics] =
    useState<UseShareAnalyticsReturn["analytics"]>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!enabled || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await sharingApi.getShareAnalytics(token, filters);
      setAnalytics(result);
    } catch (err) {
      console.error("Error fetching share analytics:", err);
      setError("Gagal memuat analitik pembagian");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token, filters.startDate, filters.endDate, filters.platform, enabled]);

  const refetch = () => {
    fetchAnalytics();
  };

  return {
    analytics,
    isLoading,
    error,
    refetch,
  };
}
