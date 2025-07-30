import { createSuccess, createError } from "@/types";
import type { AppResult } from "@/types";
import type {
  TrackShareRequest,
  GenerateCaptionRequest,
  GenerateAICaptionRequest,
  ShareEventData,
  ReportSharingData,
  CaptionResponse,
  AICaptionResponse,
  AnalyticsFilters,
  ShareAnalyticsData,
  ShareAnalytics,
} from "./types";
import * as core from "./core";
import * as data from "./data";

// Business logic orchestration for sharing functionality

export const trackReportShare = async (
  reportId: string,
  shareRequest: TrackShareRequest,
  userId?: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<AppResult<{ success: boolean; newShareCount: number }>> => {
  try {
    // Validate request
    const validation = core.validateShareRequest(shareRequest);
    if (!validation.success) {
      return validation;
    }

    // Check if report exists and is eligible for sharing
    const reportExists = await data.checkReportExists(reportId);
    if (!reportExists) {
      return createError("Report not found or not eligible for sharing", 404);
    }

    // Use transaction to ensure data consistency
    return await data.withTransaction(async (sql) => {
      // Increment share count
      const shareCountResult = await data.incrementShareCount(reportId);
      if (!shareCountResult.success) {
        return shareCountResult;
      }

      // Record share event
      const shareEventData: ShareEventData = {
        report_id: reportId,
        platform: shareRequest.platform,
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
      };

      const shareEventResult = await data.recordShareEvent(shareEventData);
      if (!shareEventResult.success) {
        // Log error but don't fail the entire operation
        console.error("Failed to record share event:", shareEventResult.error);
      }

      return createSuccess({
        success: true,
        newShareCount: shareCountResult.data,
      });
    });
  } catch (error) {
    return createError(
      `Failed to track share: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
};

export const generateReportCaption = async (
  reportId: string,
  captionRequest: GenerateCaptionRequest,
): Promise<AppResult<CaptionResponse>> => {
  try {
    // DEPRECATED: This endpoint is kept for backward compatibility
    // All caption generation should now use AI by default

    // Validate request
    const validation = core.validateCaptionRequest(captionRequest);
    if (!validation.success) {
      return validation;
    }

    // Get report data
    const reportResult = await data.getReportForSharing(reportId);
    if (!reportResult.success) {
      return reportResult;
    }

    // Use AI generation instead of template (with fallback)
    const aiResult = await core.generateAICaption(
      reportResult.data,
      captionRequest.tone,
      captionRequest.platform,
      false, // Use free model by default
    );

    if (!aiResult.success) {
      return aiResult;
    }

    // Convert AICaptionResponse to CaptionResponse for backward compatibility
    return createSuccess({
      caption: aiResult.data.caption,
      hashtags: aiResult.data.hashtags,
      characterCount: aiResult.data.characterCount,
      platformOptimized: aiResult.data.platformOptimized,
    });
  } catch (error) {
    return createError(
      `Failed to generate caption: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
};

// New AI-powered caption generation endpoint
export const generateAIReportCaption = async (
  reportId: string,
  captionRequest: GenerateAICaptionRequest,
): Promise<AppResult<AICaptionResponse>> => {
  try {
    // Validate request
    const validation = core.validateAICaptionRequest(captionRequest);
    if (!validation.success) {
      return validation;
    }

    // Get report data
    const reportResult = await data.getReportForSharing(reportId);
    if (!reportResult.success) {
      return reportResult;
    }

    // Generate AI caption
    const aiResult = await core.generateAICaption(
      reportResult.data,
      captionRequest.tone,
      captionRequest.platform,
      captionRequest.usePaidModel,
    );

    return aiResult;
  } catch (error) {
    return createError(
      `Failed to generate AI caption: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
};

export const getShareAnalytics = async (
  filters: AnalyticsFilters,
): Promise<AppResult<ShareAnalytics>> => {
  try {
    // Validate date range if provided
    if (filters.startDate && filters.endDate) {
      if (filters.startDate > filters.endDate) {
        return createError("Start date must be before end date", 400);
      }
    }

    // Get analytics data
    const analyticsData = await data.getShareAnalytics(filters);

    // Transform data for response
    const topReports = analyticsData.topReports.map((report) => ({
      id: report.id,
      title: `${report.street_name}, ${report.location_text}`,
      shareCount: report.shareCount,
    }));

    // Calculate date range
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dateRange = {
      start: filters.startDate || thirtyDaysAgo,
      end: filters.endDate || now,
    };

    const response: ShareAnalytics = {
      totalShares: analyticsData.totalShares,
      platformBreakdown: analyticsData.platformBreakdown,
      topReports,
      dateRange,
    };

    return createSuccess(response);
  } catch (error) {
    return createError(
      `Failed to fetch analytics: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
};

export const getReportShareDetails = async (
  reportId: string,
): Promise<
  AppResult<{
    shareCount: number;
    platformBreakdown: Record<string, number>;
    recentShares: Array<{
      platform: string;
      sharedAt: Date;
      userId?: string;
    }>;
  }>
> => {
  try {
    // Check if report exists
    const reportExists = await data.checkReportExists(reportId);
    if (!reportExists) {
      return createError("Report not found", 404);
    }

    // Get share count
    const shareCount = await data.getShareCountForReport(reportId);

    // Get platform breakdown
    const platformBreakdown = await data.getShareCountByPlatform(reportId);

    // Get recent share events
    const recentShareEvents = await data.getRecentShareEvents(reportId, 10);

    // Transform recent shares
    const recentShares = recentShareEvents.map((event) => ({
      platform: event.platform,
      sharedAt: event.shared_at,
      userId: event.user_id || undefined,
    }));

    return createSuccess({
      shareCount,
      platformBreakdown,
      recentShares,
    });
  } catch (error) {
    return createError(
      `Failed to fetch share details: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
};

export const validateReportForSharing = async (
  reportId: string,
): Promise<AppResult<{ eligible: boolean; reason?: string }>> => {
  try {
    // Check if report exists
    const reportExists = await data.checkReportExists(reportId);
    if (!reportExists) {
      return createSuccess({
        eligible: false,
        reason: "Report not found or has been deleted",
      });
    }

    // Get report data to check status
    const reportResult = await data.getReportForSharing(reportId);
    if (!reportResult.success) {
      return createSuccess({
        eligible: false,
        reason: "Report not accessible",
      });
    }

    // Additional validation logic can be added here
    // For example, check if report is verified, not too old, etc.

    return createSuccess({
      eligible: true,
    });
  } catch (error) {
    return createError(
      `Failed to validate report: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
};

export const getMostSharedReports = async (
  limit: number = 10,
  timeframe?: { start: Date; end: Date },
): Promise<
  AppResult<
    Array<{
      id: string;
      title: string;
      shareCount: number;
      isHighEngagement: boolean;
    }>
  >
> => {
  try {
    // Validate limit
    if (limit < 1 || limit > 100) {
      return createError("Limit must be between 1 and 100", 400);
    }

    // Get most shared reports
    const reports = await data.getMostSharedReports(limit, timeframe);

    // Transform data
    const transformedReports = reports.map((report) => ({
      id: report.id,
      title: `${report.street_name}, ${report.location_text}`,
      shareCount: report.shareCount,
      isHighEngagement: core.isHighEngagementReport(report.shareCount),
    }));

    return createSuccess(transformedReports);
  } catch (error) {
    return createError(
      `Failed to fetch most shared reports: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
};
