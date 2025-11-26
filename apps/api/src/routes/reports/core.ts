import { createSuccess, createError } from "@/types";
import type {
  CreateReportInput,
  ReportWithUser,
  PaginatedReports,
  GeocodingMetadata,
  GeocodingResult,
} from "./types";
import type { AppResult } from "@/types";

// Pure business logic for reports (no database access, no side effects)

export const validateReportData = (
  data: CreateReportInput,
): AppResult<CreateReportInput> => {
  // Business rule: Coordinates must be both provided or both omitted
  const latValue = data.lat ?? null;
  const lonValue = data.lon ?? null;
  const hasLat = latValue !== null;
  const hasLon = lonValue !== null;

  if ((hasLat && !hasLon) || (hasLon && !hasLat)) {
    return createError(
      "Both latitude and longitude must be provided together",
      400,
    );
  }

  // Business rule: Validate coordinate ranges for Indonesia
  if (hasLat && hasLon && latValue !== null && lonValue !== null) {
    if (latValue < -11 || latValue > 6) {
      return createError(
        "Latitude must be within Indonesia bounds (-11 to 6)",
        400,
      );
    }
    if (lonValue < 95 || lonValue > 141) {
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

const defaultGeocodingMetadata = (): GeocodingMetadata => ({
  geocoding_source: null,
  geocoded_at: null,
});

const isMeaningful = (value?: string | null): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const mergeGeocodingIntoReport = (
  data: CreateReportInput,
  geocodingResult?: GeocodingResult,
): { report: CreateReportInput; metadata: GeocodingMetadata } => {
  if (!geocodingResult) {
    return { report: data, metadata: defaultGeocodingMetadata() };
  }

  const merged: CreateReportInput = {
    ...data,
    street_name: isMeaningful(data.street_name)
      ? data.street_name
      : (geocodingResult.street_name ?? data.street_name),
    district: isMeaningful(data.district)
      ? data.district
      : (geocodingResult.district ?? data.district),
    city: isMeaningful(data.city)
      ? data.city
      : (geocodingResult.city ?? data.city),
    province: isMeaningful(data.province)
      ? data.province
      : (geocodingResult.province ?? data.province),
    province_code:
      data.province_code ?? geocodingResult.province_code ?? undefined,
    regency_code:
      data.regency_code ?? geocodingResult.regency_code ?? undefined,
    district_code:
      data.district_code ?? geocodingResult.district_code ?? undefined,
    lat: data.lat ?? geocodingResult.lat ?? null,
    lon: data.lon ?? geocodingResult.lon ?? null,
  };

  const metadata: GeocodingMetadata = {
    geocoding_source: geocodingResult.geocoding_source,
    geocoded_at: geocodingResult.geocoded_at,
  };

  return { report: merged, metadata };
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
  userId: string, // Changed from number to string (UUID v7)
): boolean => {
  // Business rule: Only the report creator can edit their report
  return report.user_id === userId;
};

export const canUserDeleteReport = (
  report: ReportWithUser,
  userId: string, // Changed from number to string (UUID v7)
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
  userId: string, // Changed from number to string (UUID v7)
): AppResult<Partial<CreateReportInput>> => {
  // Business rule: Check user permissions
  if (!canUserEditReport(currentReport, userId)) {
    return createError("User not authorized to edit this report", 403);
  }

  // Business rule: Validate update data if provided
  const hasLatUpdate = updateData.lat !== undefined;
  const hasLonUpdate = updateData.lon !== undefined;

  if (hasLatUpdate || hasLonUpdate) {
    const lat = hasLatUpdate ? updateData.lat : currentReport.lat;
    const lon = hasLonUpdate ? updateData.lon : currentReport.lon;

    const latProvided = lat !== undefined && lat !== null;
    const lonProvided = lon !== undefined && lon !== null;

    if ((latProvided && !lonProvided) || (lonProvided && !latProvided)) {
      return createError(
        "Both latitude and longitude must be provided together",
        400,
      );
    }
  }

  // Validate coordinates if provided
  if (
    updateData.lat !== undefined &&
    updateData.lon !== undefined &&
    updateData.lat !== null &&
    updateData.lon !== null
  ) {
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
