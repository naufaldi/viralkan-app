import { createSuccess, createError } from "@/types";
import type {
  CreateReportInput,
  ReportWithUser,
  PaginatedReports,
} from "./types";
import type { AppResult } from "@/types";

// Pure business logic for reports (no database access, no side effects)

export const validateReportData = (
  data: CreateReportInput,
): AppResult<CreateReportInput> => {
  // Business rule: Coordinates must be both provided or both omitted
  if (
    (data.lat !== undefined && data.lon === undefined) ||
    (data.lat === undefined && data.lon !== undefined)
  ) {
    return createError(
      "Both latitude and longitude must be provided together",
      400,
    );
  }

  // Business rule: Validate coordinate ranges for Indonesia
  if (data.lat !== undefined && data.lon !== undefined) {
    if (data.lat < -11 || data.lat > 6) {
      return createError(
        "Latitude must be within Indonesia bounds (-11 to 6)",
        400,
      );
    }
    if (data.lon < 95 || data.lon > 141) {
      return createError(
        "Longitude must be within Indonesia bounds (95 to 141)",
        400,
      );
    }
  }

  // Business rule: Street name cannot contain special characters that might indicate injection
  const invalidChars = /[<>;"'\\]/;
  if (invalidChars.test(data.street_name)) {
    return createError("Street name contains invalid characters", 400);
  }

  if (invalidChars.test(data.location_text)) {
    return createError("Location text contains invalid characters", 400);
  }

  // Business rule: Image URL must be HTTPS for security
  if (!data.image_url.startsWith("https://")) {
    return createError("Image URL must use HTTPS protocol", 400);
  }

  return createSuccess(data);
};

export const sanitizeReportData = (
  data: CreateReportInput,
): CreateReportInput => {
  return {
    ...data,
    street_name: data.street_name.trim(),
    location_text: data.location_text.trim(),
    image_url: data.image_url.trim(),
  };
};

export const calculateReportPriority = (
  report: ReportWithUser,
): "high" | "medium" | "low" => {
  // Business rule: Priority based on category
  switch (report.category) {
    case "berlubang":
      return "high"; // Potholes are high priority for safety
    case "retak":
      return "medium"; // Cracks are medium priority
    case "lainnya":
      return "low"; // Other issues are low priority
    default:
      return "low";
  }
};

export const canUserEditReport = (
  report: ReportWithUser,
  userId: number,
): boolean => {
  // Business rule: Only the report creator can edit their report
  return report.user_id === userId;
};

export const canUserDeleteReport = (
  report: ReportWithUser,
  userId: number,
): boolean => {
  // Business rule: Only the report creator can delete their report
  return report.user_id === userId;
};

export const isReportStale = (
  report: ReportWithUser,
  daysThreshold: number = 30,
): boolean => {
  // Business rule: Reports older than threshold are considered stale
  const createdDate = new Date(report.created_at);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - daysThreshold);

  return createdDate < threshold;
};

export const formatReportForDisplay = (
  report: ReportWithUser,
): ReportWithUser => {
  // Business rule: Format data for consistent display
  return {
    ...report,
    street_name: report.street_name.replace(/\s+/g, " ").trim(),
    location_text: report.location_text.replace(/\s+/g, " ").trim(),
    user_name: report.user_name || "Anonymous User",
  };
};

export const validatePaginationParams = (
  page: number,
  limit: number,
): AppResult<{ page: number; limit: number }> => {
  // Business rule: Pagination constraints
  if (page < 1) {
    return createError("Page must be greater than 0", 400);
  }

  if (limit < 1 || limit > 100) {
    return createError("Limit must be between 1 and 100", 400);
  }

  return createSuccess({ page, limit });
};

export const enrichReportData = (
  report: ReportWithUser,
): ReportWithUser & {
  priority: "high" | "medium" | "low";
  isStale: boolean;
  formattedAddress: string;
} => {
  const priority = calculateReportPriority(report);
  const isStale = isReportStale(report);
  const formattedAddress = `${report.street_name}, ${report.location_text}`;

  return {
    ...formatReportForDisplay(report),
    priority,
    isStale,
    formattedAddress,
  };
};

export const filterReportsByCategory = (
  reports: ReportWithUser[],
  category?: "berlubang" | "retak" | "lainnya",
): ReportWithUser[] => {
  if (!category) {
    return reports;
  }

  return reports.filter((report) => report.category === category);
};

export const sortReportsByPriority = (
  reports: ReportWithUser[],
): ReportWithUser[] => {
  const priorityOrder = { high: 3, medium: 2, low: 1 };

  return [...reports].sort((a, b) => {
    const aPriority = calculateReportPriority(a);
    const bPriority = calculateReportPriority(b);

    // Sort by priority first, then by creation date (newest first)
    if (priorityOrder[aPriority] !== priorityOrder[bPriority]) {
      return priorityOrder[bPriority] - priorityOrder[aPriority];
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

export const validateReportUpdate = (
  currentReport: ReportWithUser,
  updateData: Partial<CreateReportInput>,
  userId: number,
): AppResult<Partial<CreateReportInput>> => {
  // Business rule: Check user permissions
  if (!canUserEditReport(currentReport, userId)) {
    return createError("User not authorized to edit this report", 403);
  }

  // Business rule: Validate update data if provided
  if (updateData.lat !== undefined || updateData.lon !== undefined) {
    const lat = updateData.lat ?? currentReport.lat;
    const lon = updateData.lon ?? currentReport.lon;

    if ((lat !== null && lon === null) || (lat === null && lon !== null)) {
      return createError(
        "Both latitude and longitude must be provided together",
        400,
      );
    }
  }

  // Validate coordinates if provided
  if (updateData.lat !== undefined && updateData.lon !== undefined) {
    if (updateData.lat < -11 || updateData.lat > 6) {
      return createError(
        "Latitude must be within Indonesia bounds (-11 to 6)",
        400,
      );
    }
    if (updateData.lon < 95 || updateData.lon > 141) {
      return createError(
        "Longitude must be within Indonesia bounds (95 to 141)",
        400,
      );
    }
  }

  return createSuccess(updateData);
};
