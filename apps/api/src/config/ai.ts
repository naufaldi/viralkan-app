// AI Configuration for OpenRouter API with automatic provider fallback

export interface AIConfig {
  apiKey: string;
  baseURL: string;
  modelFree: string;
  modelPaid: string;
  maxTokens: number;
  temperature: number;
}

import { env } from "./env";

export const getAIConfig = (): AIConfig => {
  return {
    apiKey: env.OPENROUTER_API_KEY,
    baseURL: env.OPENROUTER_BASE_URL,
    modelFree:
      process.env.AI_MODEL_FREE || "deepseek/deepseek-chat-v3-0324:free",
    modelPaid: process.env.AI_MODEL_PAID || "deepseek/deepseek-chat-v3-0324",
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || "500"),
    temperature: parseFloat(process.env.AI_TEMPERATURE || "0.7"),
  };
};

export const validateAIConfig = (): void => {
  try {
    getAIConfig();
  } catch (error) {
    console.warn(
      "AI configuration validation failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    console.warn(
      "AI features will be disabled. Set OPENROUTER_API_KEY to enable AI caption generation.",
    );
  }
};

// Rate limiting configuration
export const AI_RATE_LIMITS = {
  freeModel: {
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 1000,
  },
  paidModel: {
    requestsPerMinute: 30,
    requestsPerHour: 500,
    requestsPerDay: 5000,
  },
} as const;

// AI model information
export const AI_MODELS = {
  free: {
    name: "deepseek/deepseek-chat-v3-0324:free",
    description: "Free DeepSeek model for basic caption generation",
    maxTokens: 500,
    costPerToken: 0.0000001, // Example cost
  },
  paid: {
    name: "deepseek/deepseek-chat-v3-0324",
    description:
      "Official paid DeepSeek V3 model with enhanced performance and faster response",
    maxTokens: 1000,
    costPerToken: 0.0000002, // Example cost
  },
} as const;
