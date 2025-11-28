// Sharing Service
// Pure async functions for fetching report sharing data

import { sharingApi } from "./api-client";

export interface ReportShareDetails {
  shareCount: number;
  platformBreakdown: Record<string, number>;
  recentShares: Array<{
    platform: string;
    sharedAt: Date;
    userId?: string;
  }>;
}

export interface ReportSharingValidation {
  eligible: boolean;
  reason?: string;
}

export interface ReportSharingData {
  shareDetails: ReportShareDetails;
  validation: ReportSharingValidation;
}

export const sharingService = {
  /**
   * Get combined report sharing data (details + validation)
   * Fetches both endpoints in parallel for efficiency
   */
  getReportSharingData: async (
    reportId: string,
  ): Promise<ReportSharingData> => {
    const [shareDetails, validation] = await Promise.all([
      sharingApi.getReportShareDetails(reportId),
      sharingApi.validateReportForSharing(reportId),
    ]);

    return {
      shareDetails,
      validation,
    };
  },
};

