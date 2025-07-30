import OpenAI from "openai";
import { createSuccess, createError } from "@/types";
import type { AppResult } from "@/types";
import type {
  Platform,
  CaptionTone,
  ReportSharingData,
} from "../routes/sharing/types";
import { AVAILABLE_TONES } from "../routes/sharing/types";
import { getAIConfig } from "../config/ai";

// AI Request/Response Types
export interface AICaptionRequest {
  reportData: ReportSharingData;
  tone: CaptionTone;
  platform: Platform;
  usePaidModel?: boolean;
  customInstructions?: string;
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

// Configuration and client management
let aiConfig: ReturnType<typeof getAIConfig> | null = null;
let openaiClient: OpenAI | null = null;

// In-memory cache for AI responses (1 hour TTL)
const responseCache = new Map<
  string,
  { data: AICaptionResponse; timestamp: number; ttl: number }
>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// Cache management
const getCacheKey = (request: AICaptionRequest): string => {
  const { reportData, tone, platform, usePaidModel } = request;
  return `${reportData.id}-${tone}-${platform}-${usePaidModel ? "paid" : "free"}`;
};

const getCachedResponse = (cacheKey: string): AICaptionResponse | null => {
  const cached = responseCache.get(cacheKey);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > cached.ttl) {
    responseCache.delete(cacheKey);
    return null;
  }

  return cached.data;
};

const setCachedResponse = (cacheKey: string, data: AICaptionResponse): void => {
  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl: CACHE_TTL,
  });

  // Clean up expired entries (simple cleanup strategy)
  if (responseCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of responseCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        responseCache.delete(key);
      }
    }
  }
};

const getConfig = () => {
  if (!aiConfig) {
    try {
      aiConfig = getAIConfig();
    } catch (error) {
      console.warn(
        "AI configuration failed:",
        error instanceof Error ? error.message : "Unknown error",
      );
      // Fallback config
      aiConfig = {
        apiKey: "",
        baseURL: "https://openrouter.ai/api/v1",
        modelFree: "deepseek/deepseek-chat-v3-0324:free",
        modelPaid: "deepseek/deepseek-chat-v3-0324",
        maxTokens: 500,
        temperature: 0.7,
      };
    }
  }
  return aiConfig;
};

const getClient = () => {
  if (!openaiClient) {
    const config = getConfig();
    openaiClient = new OpenAI({
      apiKey: config.apiKey || "dummy-key",
      baseURL: config.baseURL,
    });
  }
  return openaiClient;
};

// Platform configuration
const getPlatformConfig = (platform: Platform) => {
  const configs = {
    twitter: {
      maxLength: 280,
      hashtagLimit: 3,
      urlHandling: "included" as const,
    },
    facebook: {
      maxLength: 2000,
      hashtagLimit: 5,
      urlHandling: "separate" as const,
    },
    whatsapp: {
      maxLength: 1000,
      hashtagLimit: 3,
      urlHandling: "included" as const,
    },
    threads: {
      maxLength: 2200,
      hashtagLimit: 10,
      urlHandling: "separate" as const,
    },
    telegram: {
      maxLength: 4096,
      hashtagLimit: 5,
      urlHandling: "included" as const,
    },
  };

  const config = configs[platform];
  if (!config) {
    console.warn(
      `Unknown platform '${platform}', falling back to default config`,
    );
    return {
      maxLength: 1000,
      hashtagLimit: 3,
      urlHandling: "included" as const,
    };
  }

  return config;
};

// Optimized system prompt generation (reduced tokens for faster processing)
const generateSystemPrompt = (
  tone: CaptionTone,
  platform: Platform,
): string => {
  const platformConfig = getPlatformConfig(platform);

  // Get tone description from the single source of truth
  const toneConfig = AVAILABLE_TONES.find((t) => t.value === tone);
  const toneDescription =
    toneConfig?.description || "Generate appropriate Indonesian caption";

  const tonePrompts = {
    formal: `Generate professional Indonesian caption for road damage report. Requirements: formal tone, government focus, max ${platformConfig.maxLength} chars, 3-5 hashtags.`,

    urgent: `Generate urgent Indonesian caption for road damage report. Requirements: emergency tone, safety focus, max ${platformConfig.maxLength} chars, 3-5 hashtags.`,

    community: `Generate community Indonesian caption for road damage report. Requirements: collaborative tone, local focus, max ${platformConfig.maxLength} chars, 3-5 hashtags.`,

    informative: `Generate factual Indonesian caption for road damage report. Requirements: objective tone, data focus, max ${platformConfig.maxLength} chars, 3-5 hashtags.`,
  };

  return tonePrompts[tone] || tonePrompts.informative;
};

// User prompt generation
const generateUserPrompt = (
  reportData: ReportSharingData,
  tone: CaptionTone,
  platform: Platform,
): string => {
  const getCategoryDisplay = (category: string): string => {
    const categoryNames: Record<string, string> = {
      berlubang: "berlubang",
      retak: "retak",
      lainnya: "kerusakan lainnya",
    };
    return categoryNames[category] || category;
  };

  return `Generate Indonesian caption for road damage report:
Category: ${getCategoryDisplay(reportData.category)}
Location: ${reportData.street_name}, ${reportData.district}, ${reportData.city}
Platform: ${platform}, Tone: ${tone}

Return JSON:
{
  "caption": "Indonesian caption text",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
}`;
};

// AI response parsing
const parseAIResponse = (
  content: string,
): AppResult<{ caption: string; hashtags: string[] }> => {
  try {
    const parsed = JSON.parse(content);

    if (!parsed.caption || !Array.isArray(parsed.hashtags)) {
      return createError("Invalid AI response format", 500);
    }

    return createSuccess({
      caption: parsed.caption.trim(),
      hashtags: parsed.hashtags.map((tag: string) => tag.trim()),
    });
  } catch {
    return createError("Failed to parse AI response", 500);
  }
};

// Main AI caption generation function with retry mechanism
export const generateAICaption = async (
  request: AICaptionRequest,
): Promise<AppResult<AICaptionResponse>> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const startTime = Date.now();

      // Check cache first (only on first attempt)
      if (attempt === 1) {
        const cacheKey = getCacheKey(request);
        const cachedResponse = getCachedResponse(cacheKey);
        if (cachedResponse) {
          console.log(`Cache hit for ${cacheKey}, returning cached response`);
          return createSuccess(cachedResponse);
        }
      }

      const config = getConfig();
      const client = getClient();

      // Determine which models to try based on user preference
      let modelsToTry;

      if (request.usePaidModel === false) {
        // User explicitly wants free model only (with timeout)
        modelsToTry = [
          { model: config.modelFree, isPaid: false, timeout: 30000 },
        ];
      } else {
        // Default: try paid first, OpenRouter will auto-fallback between providers (Targon->Chutes->DeepInfra->Lambda)
        modelsToTry = [
          { model: config.modelPaid, isPaid: true, timeout: 45000 },
          { model: config.modelFree, isPaid: false, timeout: 30000 },
        ];
      }

      let lastError: Error | null = null;

      for (const { model, isPaid, timeout } of modelsToTry) {
        try {
          // Generate optimized prompts
          const systemPrompt = generateSystemPrompt(
            request.tone,
            request.platform,
          );
          const userPrompt = generateUserPrompt(
            request.reportData,
            request.tone,
            request.platform,
          );

          // Call AI API with timeout and provider preferences
          const aiPromise = client.chat.completions.create(
            {
              model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              max_tokens: config.maxTokens,
              temperature: config.temperature,
              response_format: { type: "json_object" },
            },
            {
              headers: {
                "HTTP-Referer": "https://viralkan.com",
                "X-Title": "Viralkan Road Damage AI Caption",
                // Specify provider preference order: Targon -> DeepInfra -> Lambda
                "OpenRouter-Provider-Order": "Targon,DeepInfra,Lambda",
              },
            },
          );

          // Add timeout wrapper
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(
              () => reject(new Error(`Request timeout after ${timeout}ms`)),
              timeout,
            );
          });

          const completion = await Promise.race([aiPromise, timeoutPromise]);

          const content = completion.choices[0]?.message?.content;

          if (!content) {
            throw new Error("AI response is empty");
          }

          // Parse AI response
          const parsedResponse = parseAIResponse(content);
          if (!parsedResponse.success) {
            throw new Error(parsedResponse.error);
          }

          // Calculate character count
          const fullText = `${parsedResponse.data.caption} ${parsedResponse.data.hashtags.join(" ")}`;
          const characterCount = fullText.length;

          // Check if platform optimization is needed
          const platformConfig = getPlatformConfig(request.platform);
          const platformOptimized = characterCount <= platformConfig.maxLength;

          const response: AICaptionResponse = {
            caption: parsedResponse.data.caption,
            hashtags: parsedResponse.data.hashtags,
            characterCount,
            platformOptimized,
            aiGenerated: true,
            modelUsed: model,
            tokenUsage: completion.usage
              ? {
                  prompt: completion.usage.prompt_tokens,
                  completion: completion.usage.completion_tokens,
                  total: completion.usage.total_tokens,
                }
              : undefined,
          };

          // Cache successful response (only on first attempt)
          if (attempt === 1) {
            const cacheKey = getCacheKey(request);
            setCachedResponse(cacheKey, response);
          }

          console.log(
            `Generated AI response for attempt ${attempt} in ${Date.now() - startTime}ms`,
          );
          return createSuccess(response);
        } catch (error) {
          lastError =
            error instanceof Error ? error : new Error("Unknown error");

          // Check if this is a retryable error (rate limit, quota exceeded, etc.)
          const isRetryableError = isRetryableAIError(error);

          if (isRetryableError && !isPaid) {
            console.warn(
              `Free model failed with retryable error: ${lastError.message}. Retrying with paid model...`,
            );
            continue; // Try next model (paid)
          } else if (isRetryableError && isPaid) {
            console.error(
              `Both free and paid models failed with retryable errors. Last error: ${lastError.message}`,
            );
            break; // Both models failed, don't retry further
          } else {
            // Non-retryable error, don't retry
            console.error(
              `AI service error (non-retryable): ${lastError.message}`,
            );
            break;
          }
        }
      }

      // If we get here, all models failed for this attempt
      console.error(
        `All AI models failed on attempt ${attempt}:`,
        lastError?.message,
      );

      // If this is not the last attempt, wait and retry
      if (attempt < MAX_RETRIES) {
        console.log(
          `Retrying AI service call... (attempt ${attempt + 1}/${MAX_RETRIES})`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY * attempt),
        );
        continue;
      }

      return createError(
        `AI service error (${attempt} attempts): ${lastError?.message || "All models failed"}`,
        500,
      );
    } catch (error) {
      console.error(
        `AI caption generation failed on attempt ${attempt}:`,
        error,
      );

      // If this is not the last attempt, wait and retry
      if (attempt < MAX_RETRIES) {
        console.log(
          `Retrying AI service call after error... (attempt ${attempt + 1}/${MAX_RETRIES})`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY * attempt),
        );
        continue;
      }

      return createError(
        `AI service error (${attempt} attempts): ${error instanceof Error ? error.message : "Unknown error"}`,
        500,
      );
    }
  }

  // This should never be reached, but TypeScript requires it
  return createError("AI service error: Maximum retries exceeded", 500);
};

// Helper function to determine if an error is retryable
const isRetryableAIError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;

  const errorMessage = error.message.toLowerCase();
  const retryablePatterns = [
    "rate limit",
    "quota exceeded",
    "too many requests",
    "service unavailable",
    "temporary",
    "timeout",
    "network",
    "connection",
    "undefined is not an object",
    "platformconfig",
    "429", // HTTP rate limit status
    "503", // Service unavailable
  ];

  return retryablePatterns.some((pattern) => errorMessage.includes(pattern));
};

// Health check function
export const checkAIHealth = async (): Promise<
  AppResult<{ status: string; model: string }>
> => {
  try {
    const config = getConfig();
    const client = getClient();

    await client.chat.completions.create(
      {
        model: config.modelFree,
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 10,
      },
      {
        headers: {
          "HTTP-Referer": "https://viralkan.com",
          "X-Title": "Viralkan Health Check",
          // Use same provider order for health checks
          "OpenRouter-Provider-Order": "Targon,DeepInfra,Lambda",
        },
      },
    );

    return createSuccess({
      status: "healthy",
      model: config.modelFree,
    });
  } catch (error) {
    return createError(
      `AI service health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      500,
    );
  }
};

// Get available models with performance info
export const getAvailableModels = (): {
  free: { model: string; estimatedTime: string; description: string };
  paid: { model: string; estimatedTime: string; description: string };
} => {
  const config = getConfig();
  return {
    free: {
      model: config.modelFree,
      estimatedTime: "15-30 seconds",
      description: "Free model with rate limiting. Slower but no cost.",
    },
    paid: {
      model: config.modelPaid,
      estimatedTime: "1-5 seconds",
      description:
        "DeepSeek V3 with optimized provider fallback (Targon→DeepInfra→Lambda) for best performance.",
    },
  };
};

// Reset configuration (useful for testing)
export const resetAIConfig = (): void => {
  aiConfig = null;
  openaiClient = null;
};

// Test function to verify retry logic (for development/testing)
export const testRetryLogic = async (): Promise<void> => {
  console.log("Testing AI retry logic...");

  const testRequest: AICaptionRequest = {
    reportData: {
      id: "test-id",
      category: "berlubang",
      street_name: "Jl. Test",
      location_text: "Test Location",
      district: "Test District",
      city: "Test City",
      province: "Test Province",
      created_at: new Date(),
      share_count: 0,
    },
    tone: "formal",
    platform: "twitter",
    usePaidModel: undefined, // Test auto-retry
  };

  try {
    const result = await generateAICaption(testRequest);
    console.log("Test result:", result);
  } catch (error) {
    console.error("Test failed:", error);
  }
};

// Export for backward compatibility (if needed)
export const aiService = {
  generateCaption: generateAICaption,
  healthCheck: checkAIHealth,
  getAvailableModels,
  resetConfig: resetAIConfig,
  testRetryLogic,
};
