// Public exports for the sharing feature
// Following the 4-layer clean architecture pattern

// API Layer exports
export { sharingRouter } from "./api";

// Type exports
export type {
  TrackShareRequest,
  GenerateCaptionRequest,
  ShareTrackingResponse,
  CaptionResponse,
  ShareAnalytics,
  Platform,
  CaptionTone,
  ShareEventData,
  ReportSharingData,
  AnalyticsFilters,
  ShareAnalyticsData,
  ShareEvent,
  PlatformConfig,
  CaptionTemplate,
} from "./types";

// Shell layer exports (for use by other features)
export * as sharingShell from "./shell";

// Core layer exports (for use by other features)
export * as sharingCore from "./core";

// Key business logic functions that might be needed elsewhere
export {
  validateShareRequest,
  validateCaptionRequest,
  validatePlatform,
  validateShareCount,
  generateCaptionFromTemplate,
  generateFallbackCaption,
  sanitizeCaptionContent,
  getPlatformDisplayName,
  sortPlatformsByPopularity,
  isHighEngagementReport,
} from "./core";
