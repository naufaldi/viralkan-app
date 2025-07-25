import { z } from "@hono/zod-openapi";

/**
 * UUID v7 validation utility with enhanced debugging
 */
export const createUuidValidator = (fieldName: string = "UUID") => {
  return z.string().refine(
    (val) => {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValid = uuidRegex.test(val);

      if (!isValid) {
        console.log(`🔍 UUID Validation Failed for ${fieldName}:`, {
          value: val,
          length: val?.length || 0,
          type: typeof val,
          isNull: val === null,
          isUndefined: val === undefined,
          pattern: uuidRegex.source,
        });
      } else {
        console.log(`✅ UUID Validation Passed for ${fieldName}:`, val);
      }

      return isValid;
    },
    {
      message: `Invalid ${fieldName} format - must be a valid UUID v7 string`,
    },
  );
};

/**
 * Relaxed UUID validator that accepts any string (for debugging)
 */
export const createRelaxedUuidValidator = (fieldName: string = "UUID") => {
  return z.string().refine(
    (val) => {
      console.log(`🔍 Relaxed UUID Check for ${fieldName}:`, {
        value: val,
        length: val?.length || 0,
        type: typeof val,
      });
      return true; // Accept any string for debugging
    },
    {
      message: `Invalid ${fieldName} format`,
    },
  );
};

/**
 * UUID validation regex pattern
 */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Check if a string is a valid UUID
 */
export const isValidUuid = (uuid: string): boolean => {
  return UUID_REGEX.test(uuid);
};

/**
 * Format UUID for consistent display
 */
export const formatUuid = (uuid: string): string => {
  if (!uuid) return uuid;
  return uuid.toLowerCase().trim();
};

/**
 * Debug utility to log UUID-related data
 */
export const debugUuidData = (data: any, context: string = "UUID Data") => {
  console.log(`🔍 ${context}:`, {
    data,
    type: typeof data,
    isArray: Array.isArray(data),
    keys: data && typeof data === "object" ? Object.keys(data) : null,
  });

  if (data && typeof data === "object" && data.id) {
    console.log(`🔍 ${context} - ID field:`, {
      id: data.id,
      idType: typeof data.id,
      idLength: data.id?.length || 0,
      isValid: isValidUuid(data.id),
    });
  }
};
