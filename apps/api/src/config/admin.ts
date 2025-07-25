/**
 * Admin Configuration Utilities
 *
 * This module provides utilities for managing admin users based on environment configuration.
 * It ensures secure admin access control for open-source deployment.
 */

/**
 * Get admin emails from environment variables
 */
export function getAdminEmails(): string[] {
  const adminEmails = process.env.ADMIN_EMAILS;

  if (!adminEmails) {
    throw new Error("ADMIN_EMAILS environment variable is required");
  }

  return adminEmails
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
}

/**
 * Check if an email is in the admin list
 */
export function isAdminEmail(email: string): boolean {
  try {
    const adminEmails = getAdminEmails();
    return adminEmails.includes(email);
  } catch (error) {
    console.error("Error checking admin email:", error);
    return false;
  }
}

/**
 * Get admin session timeout from environment (default: 1 hour)
 */
export function getAdminSessionTimeout(): number {
  const timeout = process.env.ADMIN_SESSION_TIMEOUT;
  return timeout ? parseInt(timeout, 10) : 3600; // 1 hour default
}

/**
 * Get admin rate limit from environment (default: 100 requests per hour)
 */
export function getAdminRateLimit(): number {
  const rateLimit = process.env.ADMIN_RATE_LIMIT;
  return rateLimit ? parseInt(rateLimit, 10) : 100;
}

/**
 * Validate admin configuration
 */
export function validateAdminConfig(): void {
  try {
    const adminEmails = getAdminEmails();

    if (adminEmails.length === 0) {
      throw new Error("No admin emails configured");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = adminEmails.filter(
      (email) => !emailRegex.test(email),
    );

    if (invalidEmails.length > 0) {
      throw new Error(`Invalid email format: ${invalidEmails.join(", ")}`);
    }

    console.log(
      `✅ Admin configuration validated: ${adminEmails.length} admin(s) configured`,
    );
  } catch (error) {
    console.error("❌ Admin configuration validation failed:", error);
    throw error;
  }
}

/**
 * Admin configuration interface
 */
export interface AdminConfig {
  emails: string[];
  sessionTimeout: number;
  rateLimit: number;
}

/**
 * Get complete admin configuration
 */
export function getAdminConfig(): AdminConfig {
  return {
    emails: getAdminEmails(),
    sessionTimeout: getAdminSessionTimeout(),
    rateLimit: getAdminRateLimit(),
  };
}
