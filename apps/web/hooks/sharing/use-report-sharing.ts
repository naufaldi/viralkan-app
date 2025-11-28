import { useQuery } from "@tanstack/react-query";
import { sharingService } from "@/services/sharing";

interface UseReportSharingOptions {
  reportId: string;
  enabled?: boolean;
}

interface UseReportSharingReturn {
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
  refetch: () => void;
}

export function useReportSharing({
  reportId,
  enabled = true,
}: UseReportSharingOptions): UseReportSharingReturn {
  const query = useQuery({
    queryKey: ["report-sharing", reportId],
    queryFn: () => sharingService.getReportSharingData(reportId),
    enabled: enabled && !!reportId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("HTTP 4")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    shareDetails: query.data?.shareDetails ?? null,
    validation: query.data?.validation ?? null,
    isLoading: query.isLoading,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Gagal memuat data pembagian laporan"
      : null,
    refetch: () => {
      query.refetch();
    },
  };
}
