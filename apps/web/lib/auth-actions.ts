"use server";
import { cookies } from "next/headers";
import { getAuthUser } from "./auth-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Server action for creating reports (uses Hono POST /api/reports)
export async function createReportAction(formData: FormData) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }
  const reportData = {
    image_url: formData.get("image_url") as string,
    category: formData.get("category") as string,
    street_name: formData.get("street_name") as string,
    location_text: formData.get("location_text") as string,
    lat: formData.get("lat")
      ? parseFloat(formData.get("lat") as string)
      : undefined,
    lon: formData.get("lon")
      ? parseFloat(formData.get("lon") as string)
      : undefined,
  };

  const cookieStore = await cookies();
  const token = cookieStore.get("firebase-token")?.value;
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Call Hono's POST /api/reports endpoint
  const response = await fetch(`${API_BASE_URL}/api/reports`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reportData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to create report");
  }

  const result = await response.json();

  // Revalidate relevant pages
  revalidatePath("/dashboard");
  revalidatePath("/laporan");

  return result; // Returns { id, message, success } from enhanced API
}

// Server action for logout (uses Hono POST /api/auth/logout)
export async function logoutAction() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }
  const cookieStore = await cookies();
  const token = cookieStore.get("firebase-token")?.value;
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    // Call Hono's POST /api/auth/logout endpoint
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Server logout failed:", error);
    // Continue with client logout even if server fails
  }

  // Clear auth cookie
  const { clearAuthCookie } = await import("./auth-cookies");
  await clearAuthCookie();

  // Redirect to home
  redirect("/");
}

// Server action for getting user reports (uses Hono GET /api/reports/me)
export async function getUserReportsAction(searchParams?: URLSearchParams) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("firebase-token")?.value;

  if (!token) {
    throw new Error("No authentication token found in cookies");
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const queryString = searchParams ? `?${searchParams.toString()}` : "";

  const response = await fetch(`${API_BASE_URL}/api/reports/me${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json(); // Returns PaginatedReportsResponseSchema
}

// Server action for getting public reports (no authentication required)
export async function getPublicReportsAction(searchParams?: URLSearchParams) {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const queryString = searchParams ? `?${searchParams.toString()}` : "";

  const response = await fetch(`${API_BASE_URL}/api/reports${queryString}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store", // Always fresh data for public content
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json(); // Returns PaginatedReportsResponseSchema
}

// Enhanced server action for getting public reports with stats calculation
export async function getPublicReportsWithStats(
  queryParams?: URLSearchParams,
  includeStats = false,
) {
  // Fetch paginated reports for display
  const displayReports = await getPublicReportsAction(queryParams);

  if (!includeStats) {
    return { reports: displayReports, stats: null };
  }

  // Fetch larger dataset for stats calculation (no pagination limits)
  const statsParams = new URLSearchParams();
  statsParams.set("limit", "1000"); // Get more data for accurate stats
  // Don't include search/filter params for stats - we want total counts

  try {
    const allReports = await getPublicReportsAction(statsParams);

    // Import stats calculation function
    const { calculateStatsFromReports, validateReportsData, getDefaultStats } =
      await import("../utils/stats-utils");

    // Validate and calculate stats
    if (validateReportsData(allReports?.items)) {
      const stats = calculateStatsFromReports(allReports.items);
      return { reports: displayReports, stats };
    } else {
      // Fallback to default stats if data is invalid
      return { reports: displayReports, stats: getDefaultStats() };
    }
  } catch {
    // If stats calculation fails, return reports with default stats
    const { getDefaultStats } = await import("../utils/stats-utils");
    return { reports: displayReports, stats: getDefaultStats() };
  }
}
