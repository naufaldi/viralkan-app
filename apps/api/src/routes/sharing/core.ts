import { createSuccess, createError } from "@/types";
import type { AppResult } from "@/types";
import type {
  Platform,
  CaptionTone,
  PlatformConfig,
  CaptionTemplate,
  ReportSharingData,
  CaptionResponse,
  TrackShareRequest,
  GenerateCaptionRequest,
} from "./types";
import {
  generateAICaption as generateAICaptionFromService,
  type AICaptionResponse,
} from "@/services/ai-service";

// Pure business logic for sharing (no database access, no side effects)

// Platform configurations for character limits and optimization
const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  twitter: { maxLength: 280, hashtagLimit: 3, urlHandling: "included" },
  facebook: { maxLength: 2000, hashtagLimit: 5, urlHandling: "separate" },
  whatsapp: { maxLength: 1000, hashtagLimit: 3, urlHandling: "included" },
  threads: { maxLength: 2200, hashtagLimit: 10, urlHandling: "separate" },
  telegram: { maxLength: 4096, hashtagLimit: 5, urlHandling: "included" },
};

// Caption templates for different tones
const CAPTION_TEMPLATES: CaptionTemplate = {
  formal:
    "Ditemukan kerusakan jalan {category} di {street}, {district}, {city}, {province}. Mohon perhatian pemerintah daerah untuk perbaikan. #ViralkanJalan #RoadDamage",
  urgent:
    "🚨 URGENT! Jalan rusak parah di {location} membahayakan pengendara! Kapan diperbaiki? #DamageAlert #FixOurRoads",
  community:
    "Warga {district} butuh bantuan! Jalan {street} rusak dan mengganggu aktivitas sehari-hari. Mari bersama-sama minta perbaikan 🙏 #CommunityAction",
  informative:
    "Data kerusakan jalan: {location} - Kategori: {category} - Dilaporkan: {date}. Butuh tindakan segera dari pihak berwenang. #DataTransparency",
};

// Base hashtags for different categories
const CATEGORY_HASHTAGS: Record<string, string[]> = {
  berlubang: ["#JalanBerlubang", "#Pothole", "#RoadSafety"],
  retak: ["#JalanRetak", "#RoadCrack", "#Infrastructure"],
  lainnya: ["#KerusakanJalan", "#RoadDamage", "#PublicWorks"],
};

// Common hashtags
const COMMON_HASHTAGS = [
  "#ViralkanJalan",
  "#FixOurRoads",
  "#InfrastrukturJalan",
  "#RoadMaintenance",
  "#PublicService",
];

export const validatePlatform = (platform: string): AppResult<Platform> => {
  const validPlatforms: Platform[] = [
    "whatsapp",
    "twitter",
    "facebook",
    "threads",
    "telegram",
  ];

  if (!validPlatforms.includes(platform as Platform)) {
    return createError(
      `Platform ${platform} is not supported. Valid platforms: ${validPlatforms.join(", ")}`,
      400,
    );
  }

  return createSuccess(platform as Platform);
};

export const validateCaptionTone = (tone: string): AppResult<CaptionTone> => {
  const validTones: CaptionTone[] = [
    "formal",
    "urgent",
    "community",
    "informative",
  ];

  if (!validTones.includes(tone as CaptionTone)) {
    return createError(
      `Tone ${tone} is not supported. Valid tones: ${validTones.join(", ")}`,
      400,
    );
  }

  return createSuccess(tone as CaptionTone);
};

export const validateShareRequest = (
  data: TrackShareRequest,
): AppResult<TrackShareRequest> => {
  const platformValidation = validatePlatform(data.platform);
  if (!platformValidation.success) {
    return platformValidation;
  }

  return createSuccess(data);
};

export const validateCaptionRequest = (
  data: GenerateCaptionRequest,
): AppResult<GenerateCaptionRequest> => {
  const platformValidation = validatePlatform(data.platform);
  if (!platformValidation.success) {
    return platformValidation;
  }

  const toneValidation = validateCaptionTone(data.tone);
  if (!toneValidation.success) {
    return toneValidation;
  }

  return createSuccess(data);
};

// AI Caption Generation
export const generateAICaption = async (
  reportData: ReportSharingData,
  tone: CaptionTone,
  platform: Platform,
  usePaidModel: boolean = false,
): Promise<AppResult<AICaptionResponse>> => {
  try {
    // Call AI service with retry logic (free first, then paid if needed)
    const aiResponse = await generateAICaptionFromService({
      reportData,
      tone,
      platform,
      usePaidModel,
    });

    if (!aiResponse.success) {
      // Only fallback to template if AI completely fails
      const fallbackResult = await generateCaptionFromTemplate(
        reportData,
        tone,
        platform,
      );
      if (!fallbackResult.success) {
        return fallbackResult;
      }

      // Convert CaptionResponse to AICaptionResponse
      return createSuccess({
        ...fallbackResult.data,
        aiGenerated: false,
        modelUsed: "template-fallback",
      });
    }

    // Process AI response
    const { caption, hashtags } = aiResponse.data;

    // Optimize for platform constraints
    const optimized = optimizeForPlatform(caption, hashtags, platform);

    return createSuccess({
      caption: optimized.caption,
      hashtags: optimized.hashtags,
      characterCount: `${optimized.caption} ${optimized.hashtags.join(" ")}`
        .length,
      platformOptimized: optimized.optimized,
      aiGenerated: true,
      modelUsed: aiResponse.data.modelUsed,
      tokenUsage: aiResponse.data.tokenUsage,
    });
  } catch (error) {
    // Only fallback to template if AI completely fails
    const fallbackResult = await generateCaptionFromTemplate(
      reportData,
      tone,
      platform,
    );
    if (!fallbackResult.success) {
      return fallbackResult;
    }

    // Convert CaptionResponse to AICaptionResponse
    return createSuccess({
      ...fallbackResult.data,
      aiGenerated: false,
      modelUsed: "template-fallback",
    });
  }
};

// AI Caption Request Validation
export const validateAICaptionRequest = (
  data: GenerateCaptionRequest & { usePaidModel?: boolean },
): AppResult<GenerateCaptionRequest & { usePaidModel?: boolean }> => {
  const platformValidation = validatePlatform(data.platform);
  if (!platformValidation.success) {
    return platformValidation;
  }

  const toneValidation = validateCaptionTone(data.tone);
  if (!toneValidation.success) {
    return toneValidation;
  }

  // Validate usePaidModel is boolean if provided
  if (
    data.usePaidModel !== undefined &&
    typeof data.usePaidModel !== "boolean"
  ) {
    return createError("usePaidModel must be a boolean", 400);
  }

  return createSuccess(data);
};

export const getCategoryDisplayName = (category: string): string => {
  const categoryNames: Record<string, string> = {
    berlubang: "berlubang",
    retak: "retak",
    lainnya: "kerusakan lainnya",
  };

  return categoryNames[category] || category;
};

export const formatDateForCaption = (date: Date): string => {
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const replaceTemplateVariables = (
  template: string,
  reportData: ReportSharingData,
): string => {
  const categoryDisplay = getCategoryDisplayName(reportData.category);
  const formattedDate = formatDateForCaption(reportData.created_at);
  const fullLocation = `${reportData.street_name}, ${reportData.district}, ${reportData.city}`;

  return template
    .replace(/{category}/g, categoryDisplay)
    .replace(/{street}/g, reportData.street_name)
    .replace(/{district}/g, reportData.district)
    .replace(/{city}/g, reportData.city)
    .replace(/{province}/g, reportData.province)
    .replace(/{location}/g, fullLocation)
    .replace(/{date}/g, formattedDate);
};

export const generateHashtags = (
  reportData: ReportSharingData,
  platform: Platform,
  maxHashtags?: number,
): string[] => {
  const config = PLATFORM_CONFIGS[platform];
  const limit = maxHashtags || config.hashtagLimit;

  // Start with category-specific hashtags
  const categoryTags = CATEGORY_HASHTAGS[reportData.category] || [];

  // Add common hashtags
  const allTags = [...categoryTags, ...COMMON_HASHTAGS];

  // Remove duplicates and limit to platform constraints
  const uniqueTags = Array.from(new Set(allTags));

  return uniqueTags.slice(0, limit);
};

export const optimizeForPlatform = (
  caption: string,
  hashtags: string[],
  platform: Platform,
): { caption: string; hashtags: string[]; optimized: boolean } => {
  const config = PLATFORM_CONFIGS[platform];
  const hashtagString = hashtags.join(" ");
  const fullText = `${caption} ${hashtagString}`;

  // If within limits, return as-is
  if (fullText.length <= config.maxLength) {
    return { caption, hashtags, optimized: false };
  }

  // Try to optimize by reducing hashtags first
  const optimizedHashtags = [...hashtags];
  let optimizedCaption = caption;

  while (optimizedHashtags.length > 1) {
    optimizedHashtags.pop();
    const testText = `${optimizedCaption} ${optimizedHashtags.join(" ")}`;

    if (testText.length <= config.maxLength) {
      return {
        caption: optimizedCaption,
        hashtags: optimizedHashtags,
        optimized: true,
      };
    }
  }

  // If still too long, truncate caption
  const availableLength = config.maxLength - hashtagString.length - 1; // -1 for space
  if (availableLength > 50) {
    // Ensure minimum caption length
    optimizedCaption = caption.substring(0, availableLength - 3) + "...";
    return {
      caption: optimizedCaption,
      hashtags: optimizedHashtags,
      optimized: true,
    };
  }

  // Last resort: just caption with minimal hashtags
  const minimalHashtags = hashtags.slice(0, 1);
  const minimalHashtagString = minimalHashtags.join(" ");
  const minimalAvailableLength =
    config.maxLength - minimalHashtagString.length - 1;

  optimizedCaption = caption.substring(0, minimalAvailableLength - 3) + "...";

  return {
    caption: optimizedCaption,
    hashtags: minimalHashtags,
    optimized: true,
  };
};

export const generateCaptionFromTemplate = (
  reportData: ReportSharingData,
  tone: CaptionTone,
  platform: Platform,
): AppResult<CaptionResponse> => {
  try {
    // Get the template for the specified tone
    const template = CAPTION_TEMPLATES[tone];
    if (!template) {
      return createError(`Template not found for tone: ${tone}`, 500);
    }

    // Replace template variables with report data
    const rawCaption = replaceTemplateVariables(template, reportData);

    // Generate appropriate hashtags
    const hashtags = generateHashtags(reportData, platform);

    // Optimize for platform constraints
    const {
      caption,
      hashtags: optimizedHashtags,
      optimized,
    } = optimizeForPlatform(rawCaption, hashtags, platform);

    const response: CaptionResponse = {
      caption,
      hashtags: optimizedHashtags,
      characterCount: `${caption} ${optimizedHashtags.join(" ")}`.length,
      platformOptimized: optimized,
    };

    return createSuccess(response);
  } catch (error) {
    return createError(
      `Failed to generate caption: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
};

export const generateFallbackCaption = (
  reportData: ReportSharingData,
  platform: Platform,
): CaptionResponse => {
  const fallbackText = `Kerusakan jalan dilaporkan di ${reportData.street_name}, ${reportData.district}. #ViralkanJalan`;
  const hashtags = ["#ViralkanJalan"];

  const { caption, hashtags: optimizedHashtags } = optimizeForPlatform(
    fallbackText,
    hashtags,
    platform,
  );

  return {
    caption,
    hashtags: optimizedHashtags,
    characterCount: `${caption} ${optimizedHashtags.join(" ")}`.length,
    platformOptimized: true,
  };
};

export const sanitizeCaptionContent = (caption: string): string => {
  // Remove potentially harmful content
  return caption
    .replace(/[<>]/g, "") // Remove HTML-like brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
};

export const validateShareCount = (count: number): AppResult<number> => {
  if (count < 0) {
    return createError("Share count cannot be negative", 400);
  }

  if (count > 1000000) {
    return createError("Share count exceeds maximum allowed value", 400);
  }

  return createSuccess(count);
};

export const calculateShareGrowth = (
  currentCount: number,
  previousCount: number,
): number => {
  if (previousCount === 0) {
    return currentCount > 0 ? 100 : 0; // 100% growth from 0
  }

  return Math.round(((currentCount - previousCount) / previousCount) * 100);
};

export const isHighEngagementReport = (shareCount: number): boolean => {
  // Business rule: Reports with 10+ shares are considered high engagement
  return shareCount >= 10;
};

export const getPlatformDisplayName = (platform: Platform): string => {
  const displayNames: Record<Platform, string> = {
    whatsapp: "WhatsApp",
    twitter: "Twitter/X",
    facebook: "Facebook",
    threads: "Threads",
    telegram: "Telegram",
  };

  return displayNames[platform] || platform;
};

export const sortPlatformsByPopularity = (
  platformBreakdown: Record<Platform, number>,
): Array<{ platform: Platform; count: number; displayName: string }> => {
  return Object.entries(platformBreakdown)
    .map(([platform, count]) => ({
      platform: platform as Platform,
      count,
      displayName: getPlatformDisplayName(platform as Platform),
    }))
    .sort((a, b) => b.count - a.count);
};
