import { createSuccess, createError } from '@/types';
import type { AppResult } from '@/types';
import * as core from './core';
import * as data from './data';
import type {
  TrackShareRequest,
  GenerateCaptionRequest,
  ShareTrackingResponse,
  CaptionResponse,
  ShareAnalytics,
  AnalyticsFilters,
  ShareEventData,
} from './types';

// Business logic orchestration for sharing functionality

export const trackReportShare = async (
  reportId: string,
  shareRequest: TrackShareRequest,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<AppResult<ShareTrackingResponse>> => {
  try {
    // Validate share request
    const validationResult = core.validateShareRequest(shareRequest);
    if (!validationResult.success) {
      return validationResult;
    }

    // Check if report exists and is eligible for sharing
    const reportExists = await data.checkReportExists(reportId);
    if (!reportExists) {
      return createError('Report not found or not eligible for sharing', 404);
    }

    // Record the share event in database
    const shareEventData: ShareEventData = {
      report_id: reportId,
      platform: shareRequest.platform,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
    };

    const shareEventResult = await data.recordShareEvent(shareEventData);
    if (!shareEventResult.success) {
      return shareEventResult;
    }

    // Increment share count atomically
    const shareCountResult = await data.incrementShareCount(reportId);
    if (!shareCountResult.success) {
      return shareCountResult;
    }

    const newShareCount = shareCountResult.data;

    // Validate the new share count
    const countValidation = core.validateShareCount(newShareCount);
    if (!countValidation.success) {
      return countValidation;
    }

    const response: ShareTrackingResponse = {
      success: true,
      newShareCount,
    };

    return createSuccess(response);
  } catch (error) {
    console.error('Error tracking report share:', error);
    return createError(
      `Failed to track share: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
};

export const generateReportCaption = async (
  reportId: string,
  captionRequest: GenerateCaptionRequest
): Promise<AppResult<CaptionResponse>> => {
  try {
    // Validate caption request
    const validationResult = core.validateCaptionRequest(captionRequest);
    if (!validationResult.success) {
      return validationResult;
    }

    // Fetch report data for caption generation
    const reportResult = await data.getReportForSharing(reportId);
    if (!reportResult.success) {
      return reportResult;
    }

    const reportData = reportResult.data;

    // Generate caption using templates
    const captionResult = core.generateCaptionFromTemplate(
      reportData,
      captionRequest.tone,
      captionRequest.platform
    );

    if (!captionResult.success) {
      // If template generation fails, return fallback caption
      console.warn(
        'Template generation failed, using fallback:',
        captionResult.error
      );
      const fallbackCaption = core.generateFallbackCaption(
        reportData,
        captionRequest.platform
      );
      return createSuccess(fallbackCaption);
    }

    // Sanitize caption content for security
    const sanitizedCaption = {
      ...captionResult.data,
      caption: core.sanitizeCaptionContent(captionResult.data.caption),
    };

    return createSuccess(sanitizedCaption);
  } catch (error) {
    console.error('Error generating report caption:', error);

    // Try to provide fallback caption even on error
    try {
      const reportResult = await data.getReportForSharing(reportId);
      if (reportResult.success) {
        const fallbackCaption = core.generateFallbackCaption(
          reportResult.data,
          captionRequest.platform
        );
        return createSuccess(fallbackCaption);
      }
    } catch (fallbackError) {
      console.error('Fallback caption generation also failed:', fallbackError);
    }

    return createError(
      `Failed to generate caption: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
};

export const getShareAnalytics = async (
  filters: AnalyticsFilters
): Promise<AppResult<ShareAnalytics>> => {
  try {
    // Validate date range if provided
    if (filters.startDate && filters.endDate) {
      if (filters.startDate > filters.endDate) {
        return createError('Start date cannot be after end date', 400);
      }

      // Limit date range to prevent performance issues
      const daysDiff = Math.ceil(
        (filters.endDate.getTime() - filters.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysDiff > 365) {
        return createError('Date range cannot exceed 365 days', 400);
      }
    }

    // Validate platform if provided
    if (filters.platform) {
      const platformValidation = core.validatePlatform(filters.platform);
      if (!platformValidation.success) {
        return platformValidation;
      }
    }

    // Set default date range if not provided (last 30 days)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const effectiveFilters: AnalyticsFilters = {
      startDate: filters.startDate || defaultStartDate,
      endDate: filters.endDate || defaultEndDate,
      platform: filters.platform,
    };

    // Fetch analytics data
    const analyticsData = await data.getShareAnalytics(effectiveFilters);

    // Sort platforms by popularity for better presentation
    const sortedPlatforms = core.sortPlatformsByPopularity(
      analyticsData.platformBreakdown
    );

    const response: ShareAnalytics = {
      totalShares: analyticsData.totalShares,
      platformBreakdown: analyticsData.platformBreakdown,
      topReports: analyticsData.topReports.map((report) => ({
        id: report.id,
        title: `${report.street_name}, ${report.location_text}`,
        shareCount: report.shareCount,
      })),
      dateRange: {
        start: effectiveFilters.startDate!,
        end: effectiveFilters.endDate!,
      },
    };

    return createSuccess(response);
  } catch (error) {
    console.error('Error fetching share analytics:', error);
    return createError(
      `Failed to fetch analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
};

export const getReportShareDetails = async (
  reportId: string
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
      return createError('Report not found', 404);
    }

    // Get platform breakdown
    const platformCounts = await data.getShareCountByPlatform(reportId);

    // Get recent share events
    const recentShareEvents = await data.getRecentShareEvents(reportId, 10);

    // Calculate total share count
    const totalShares = Object.values(platformCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    const response = {
      shareCount: totalShares,
      platformBreakdown: platformCounts,
      recentShares: recentShareEvents.map((event) => ({
        platform: core.getPlatformDisplayName(event.platform),
        sharedAt: event.shared_at,
        userId: event.user_id || undefined,
      })),
    };

    return createSuccess(response);
  } catch (error) {
    console.error('Error fetching report share details:', error);
    return createError(
      `Failed to fetch share details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
};

export const validateReportForSharing = async (
  reportId: string
): Promise<AppResult<{ eligible: boolean; reason?: string }>> => {
  try {
    // Check if report exists and is eligible
    const reportResult = await data.getReportForSharing(reportId);

    if (!reportResult.success) {
      return createSuccess({
        eligible: false,
        reason: 'Report not found, not verified, or has been deleted',
      });
    }

    const reportData = reportResult.data;

    // Additional business rules for sharing eligibility
    const isHighEngagement = core.isHighEngagementReport(
      reportData.share_count
    );

    return createSuccess({
      eligible: true,
      reason: isHighEngagement
        ? 'Report has high engagement and is eligible for sharing'
        : 'Report is eligible for sharing',
    });
  } catch (error) {
    console.error('Error validating report for sharing:', error);
    return createError(
      `Failed to validate report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
};

export const getMostSharedReports = async (
  limit: number = 10,
  timeframe?: { start: Date; end: Date }
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
      return createError('Limit must be between 1 and 100', 400);
    }

    // Validate timeframe if provided
    if (timeframe) {
      if (timeframe.start > timeframe.end) {
        return createError('Start date cannot be after end date', 400);
      }
    }

    const reports = await data.getMostSharedReports(limit, timeframe);

    const response = reports.map((report) => ({
      id: report.id,
      title: `${report.street_name}, ${report.location_text}`,
      shareCount: report.shareCount,
      isHighEngagement: core.isHighEngagementReport(report.shareCount),
    }));

    return createSuccess(response);
  } catch (error) {
    console.error('Error fetching most shared reports:', error);
    return createError(
      `Failed to fetch most shared reports: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
};
