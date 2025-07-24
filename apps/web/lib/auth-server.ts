import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Types matching Hono API schemas
interface AuthUser {
  id: string; // Changed from number to string (UUID v7)
  firebase_uid: string;
  email: string;
  name: string;
  avatar_url: string | null;
  provider: string;
  role: 'user' | 'admin'; // Added role field for admin access control
  created_at: string;
}

interface AuthVerificationResponse {
  message: string;
  user_id: string; // Changed from number to string (UUID v7)
  user: AuthUser;
}

interface UserStatsResponse {
  total_reports: number;
  reports_this_month: number;
  last_report_date: string | null;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("firebase-token")?.value;

  if (!token) {
    return null;
  }

  try {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    // Use Hono's POST /api/auth/verify endpoint
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Always verify fresh
    });

    if (!response.ok) {
      return null;
    }

    const data: AuthVerificationResponse = await response.json();
    return data.user; // Extract user from Hono's response format
  } catch (error) {
    console.error("Server auth verification failed:", error);
    return null;
  }
}

export async function getUserProfile(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("firebase-token")?.value;

  if (!token) {
    return null;
  }

  try {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    // Use Hono's GET /api/auth/me endpoint
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json(); // Hono returns UserResponseSchema directly
  } catch (error) {
    console.error("Get user profile failed:", error);
    return null;
  }
}

export async function getUserStats(): Promise<UserStatsResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("firebase-token")?.value;

  if (!token) {
    return null;
  }

  try {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    // Use Hono's GET /api/auth/me/stats endpoint
    const response = await fetch(`${API_BASE_URL}/api/auth/me/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json(); // UserStatsResponseSchema
  } catch (error) {
    console.error("Get user stats failed:", error);
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

// Export types for use in other components
export type { AuthUser, AuthVerificationResponse, UserStatsResponse };
