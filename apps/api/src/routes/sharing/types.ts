import { z } from "zod";

// Zod Schemas
export const TrackShareSchema = z.object({
  platform: z.enum(["whatsapp", "twitter", "facebook", "threads", "telegram"]),
});

export const GenerateCaptionSchema = z.object({
  tone: z.enum(["formal", "urgent", "community", "informative"]),
  platform: z.enum(["whatsapp", "twitter", "facebook", "threads", "telegram"]),
});

export const GenerateAICaptionSchema = z.object({
  tone: z.enum(["formal", "urgent", "community", "informative"]),
  platform: z.enum(["whatsapp", "twitter", "facebook", "threads", "telegram"]),
  usePaidModel: z.boolean().optional().default(false), // true = force paid, false = force free only, undefined = auto-retry (free first, then paid)
  customInstructions: z.string().optional(),
});

export const ShareAnalyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  platform: z
    .enum(["whatsapp", "twitter", "facebook", "threads", "telegram"])
    .optional(),
});

export const SharingReportParamsSchema = z.object({
  id: z.string().uuid(),
});

// Response Schemas
export const ShareTrackingResponseSchema = z.object({
  success: z.boolean(),
  newShareCount: z.number(),
});

export const CaptionResponseSchema = z.object({
  caption: z.string(),
  hashtags: z.array(z.string()),
  characterCount: z.number(),
  platformOptimized: z.boolean(),
});

export const AICaptionResponseSchema = z.object({
  caption: z.string(),
  hashtags: z.array(z.string()),
  characterCount: z.number(),
  platformOptimized: z.boolean(),
  aiGenerated: z.boolean(),
  modelUsed: z.string(),
  tokenUsage: z
    .object({
      prompt: z.number(),
      completion: z.number(),
      total: z.number(),
    })
    .optional(),
});

export const ShareAnalyticsResponseSchema = z.object({
  totalShares: z.number(),
  platformBreakdown: z.record(z.string(), z.number()),
  topReports: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      shareCount: z.number(),
    }),
  ),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
});

export const ReportShareDetailsResponseSchema = z.object({
  shareCount: z.number(),
  platformBreakdown: z.record(z.string(), z.number()),
  recentShares: z.array(
    z.object({
      platform: z.string(),
      sharedAt: z.string().datetime(),
      userId: z.string().optional(),
    }),
  ),
});

export const ShareValidationResponseSchema = z.object({
  eligible: z.boolean(),
  reason: z.string().optional(),
});

export const MostSharedReportsResponseSchema = z.object({
  reports: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      shareCount: z.number(),
      isHighEngagement: z.boolean(),
    }),
  ),
});

export const SharingErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    timestamp: z.string().datetime(),
  }),
});

// TypeScript Types
export type TrackShareRequest = z.infer<typeof TrackShareSchema>;
export type GenerateCaptionRequest = z.infer<typeof GenerateCaptionSchema>;
export type GenerateAICaptionRequest = z.infer<typeof GenerateAICaptionSchema>;
export type ShareAnalyticsQuery = z.infer<typeof ShareAnalyticsQuerySchema>;
export type SharingReportParams = z.infer<typeof SharingReportParamsSchema>;

// Platform and Tone Types
export type Platform =
  | "whatsapp"
  | "twitter"
  | "facebook"
  | "threads"
  | "telegram";

export type CaptionTone = "formal" | "urgent" | "community" | "informative";

// Tone configuration with metadata
export interface ToneConfig {
  value: CaptionTone;
  label: string;
  description: string;
  icon: string;
}

export const AVAILABLE_TONES: ToneConfig[] = [
  {
    value: "formal",
    label: "Formal",
    description: "Bahasa resmi untuk pemerintah",
    icon: "building",
  },
  {
    value: "urgent",
    label: "Urgent",
    description: "Mendesak untuk perbaikan cepat",
    icon: "alert-circle",
  },
  {
    value: "community",
    label: "Community",
    description: "Ramah untuk komunitas",
    icon: "users",
  },
  {
    value: "informative",
    label: "Informative",
    description: "Informatif dengan data",
    icon: "bar-chart",
  },
] as const;

// Database and API Types
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
  category: "berlubang" | "retak" | "lainnya";
  street_name: string;
  location_text: string;
  district: string;
  city: string;
  province: string;
  created_at: Date;
  share_count: number;
}

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

export interface AICaptionResponse {
  caption: string;
  hashtags: string[];
  characterCount: number;
  platformOptimized: boolean;
  aiGenerated: boolean;
  modelUsed: string;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
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

// Configuration Types
export interface PlatformConfig {
  maxLength: number;
  hashtagLimit: number;
  urlHandling: "included" | "separate";
}

export interface CaptionTemplate {
  formal: string;
  urgent: string;
  community: string;
  informative: string;
}

// Data Types
export interface ShareEventData {
  report_id: string;
  platform: Platform;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
}

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
