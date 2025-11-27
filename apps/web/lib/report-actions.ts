"use server";

export async function getReportByIdAction(reportId: string) {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Report not found");
      }
      throw new Error(`Failed to fetch report: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching report:", error);
    throw error;
  }
}
