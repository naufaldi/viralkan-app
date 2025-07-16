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

// Server action for getting user reports (uses Hono GET /api/me/reports)
export async function getUserReportsAction(searchParams?: URLSearchParams) {
  const user = await getAuthUser();
  
  if (!user) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("firebase-token")?.value;
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const queryString = searchParams ? `?${searchParams.toString()}` : "";

  const response = await fetch(
    `${API_BASE_URL}/api/me/reports${queryString}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user reports");
  }

  return response.json(); // Returns PaginatedReportsResponseSchema
}
