const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getOptionalEnv = (key: string, defaultValue: string = ""): string => {
  return process.env[key] || defaultValue;
};

const getRequiredNumber = (key: string): number => {
  const value = getRequiredEnv(key);
  const parsed = Number(value);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return parsed;
};

const getOptionalNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = Number(value);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return parsed;
};

export const env = {
  // Database - Required for security
  DATABASE_URL: getRequiredEnv("DATABASE_URL"),

  // Server
  PORT: getOptionalNumber("PORT", 3000),
  NODE_ENV: getOptionalEnv("NODE_ENV", "development"),

  // Firebase - Required for auth
  FIREBASE_SERVICE_ACCOUNT_JSON: getRequiredEnv(
    "FIREBASE_SERVICE_ACCOUNT_JSON",
  ),

  // Google OAuth - Optional for development
  GOOGLE_CLIENT_ID: getOptionalEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getOptionalEnv("GOOGLE_CLIENT_SECRET"),

  // Cloudflare R2 - Optional for development
  R2_ACCESS_KEY_ID: getOptionalEnv("R2_ACCESS_KEY_ID"),
  R2_SECRET_ACCESS_KEY: getOptionalEnv("R2_SECRET_ACCESS_KEY"),
  R2_BUCKET_NAME: getOptionalEnv("R2_BUCKET_NAME"),
  R2_ENDPOINT: getOptionalEnv("R2_ENDPOINT"),
  R2_PUBLIC_URL: getOptionalEnv("R2_PUBLIC_URL"),

  // JWT - Required for security
  JWT_SECRET: getRequiredEnv("JWT_SECRET"),

  // AI Configuration - Required for AI features
  OPENROUTER_API_KEY: getRequiredEnv("OPENROUTER_API_KEY"),
  OPENROUTER_BASE_URL: getOptionalEnv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
};

export const validateEnv = (): void => {
  try {
    // Test that all required environment variables are loaded
    Object.entries(env);
    console.log("✅ All environment variables validated");

    // Warn about missing optional variables in development
    if (env.NODE_ENV === "development") {
      const optionalWarnings: string[] = [];

      if (!env.GOOGLE_CLIENT_ID) optionalWarnings.push("GOOGLE_CLIENT_ID");
      if (!env.GOOGLE_CLIENT_SECRET)
        optionalWarnings.push("GOOGLE_CLIENT_SECRET");
      if (!env.R2_ACCESS_KEY_ID) optionalWarnings.push("R2_ACCESS_KEY_ID");
      if (!env.R2_SECRET_ACCESS_KEY)
        optionalWarnings.push("R2_SECRET_ACCESS_KEY");
      if (!env.R2_BUCKET_NAME) optionalWarnings.push("R2_BUCKET_NAME");
      if (!env.R2_ENDPOINT) optionalWarnings.push("R2_ENDPOINT");
      if (!env.R2_PUBLIC_URL) optionalWarnings.push("R2_PUBLIC_URL");

      // AI Configuration warnings
      if (!env.OPENROUTER_API_KEY) optionalWarnings.push("OPENROUTER_API_KEY");

      if (optionalWarnings.length > 0) {
        console.warn(
          `⚠️ Optional environment variables not set (features may be limited): ${optionalWarnings.join(", ")}`,
        );
      }
    }
  } catch (error) {
    console.error("❌ Environment validation failed:", error);
    if (env.NODE_ENV === "production") {
      process.exit(1);
    }
    throw error;
  }
};
