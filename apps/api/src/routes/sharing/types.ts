import { z } from 'zod';

// Zod Schemas for validation
export const TrackShareSchema = z.object({
  platform: z.enum([
    'whatsapp',
    'twitter',
    'facebook',
    'instagram',
    'telegram',
  ]),
});

export const GenerateCaptionSchema = z.object({
  tone: z.enum(['formal', 'urgent', 'community', 'informative']),
  platform: z.enum([
    'whatsapp',
    'twitter',
    'facebook',
    'instagram',
    'telegram',
  ]),
});

export const ShareAnalyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  platform: z
    .enum(['whatsapp', 'twitter', 'facebook', 'instagram', 'telegram'])
    .optional(),
});

export const SharingReportParamsSchema = z.object({
  id: z.string().uuid(),
});

// TypeScript Types (derived from Zod schemas)
export type TrackShareRequest = z.infer<typeof TrackShareSchema>;
export type GenerateCaptionRequest = z.infer<typeof GenerateCaptionSchema>;
export type ShareAnalyticsQuery = z.infer<typeof ShareAnalyticsQuerySchema>;
export type SharingReportParams = z.infer<typeof SharingReportParamsSchema>;

// Platform types
export type Platform =
  | 'whatsapp'
  | 'twitter'
  | 'facebook'
  | 'instagram'
  | 'telegram';
export type CaptionTone = 'formal' | 'urgent' | 'community' | 'informative';

// Database Entity Types
export interface ShareEvent {
  id: string;
  report_id: string;
  platform: Platform;
  user_id: string | null;
  shared_at: Date;
  ip_address: string | null;
  user_agent: string | null;
}

export interface ReportSharingData {
  id: string;
  category: 'berlubang' | 'retak' | 'lainnya';
  street_name: string;
  location_text: string;
  district: string;
  city: string;
  province: string;
  created_at: Date;
  share_count: number;
}

// API Response Types
export interface ShareTrackingResponse {
  success: boolean;
  newShareCount: number;
}

export interface CaptionResponse {
  caption: string;
  hashtags: string[];
  characterCount: number;
  platformOptimized: boolean;
}

export interface ShareAnalytics {
  totalShares: number;
  platformBreakdown: Record<Platform, number>;
  topReports: Array<{
    id: string;
    title: string;
    shareCount: number;
  }>;
  dateRange: {
    start: Date;
    end: Date;
  };
}

// Platform Configuration
export interface PlatformConfig {
  maxLength: number;
  hashtagLimit: number;
  urlHandling: 'included' | 'separate';
}

// Caption Template Types
export interface CaptionTemplate {
  formal: string;
  urgent: string;
  community: string;
  informative: string;
}

// Share Event Data for database operations
export interface ShareEventData {
  report_id: string;
  platform: Platform;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
}

// Analytics Filter Types
export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  platform?: Platform;
}

export interface ShareAnalyticsData {
  totalShares: number;
  platformBreakdown: Record<Platform, number>;
  topReports: Array<{
    id: string;
    street_name: string;
    location_text: string;
    shareCount: number;
  }>;
}
