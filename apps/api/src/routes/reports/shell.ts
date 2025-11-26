import { createSuccess, createError } from "@/types";
import type {
  CreateReportInput,
  ReportWithUser,
  ReportQuery,
  ReportParams,
  PaginatedReports,
  GeocodingMetadata,
  GeocodingResult,
  ReverseGeocodeRequest,
  ForwardGeocodeRequest,
} from "./types";
import type { AppResult } from "@/types";
import * as data from "./data";
import * as core from "./core";
import { reverseGeocode, forwardGeocode } from "./geocoding";

// Shell layer: Business logic orchestration (coordinates between core and data layers)

export const getReportsWithPagination = async (
  query: ReportQuery,
): Promise<AppResult<PaginatedReports>> => {
  try {
    // Validate pagination parameters using core business logic
    const paginationValidation = core.validatePaginationParams(
      query.page,
      query.limit,
    );
    if (!paginationValidation.success) {
      return paginationValidation;
    }

    // Fetch reports from data layer
    const result = await data.findReportsWithPagination(query);
    if (!result.success) {
      return result;
    }

    // Apply business logic formatting to each report
    const formattedReports = {
      ...result.data,
      items: result.data.items.map((report) =>
        core.formatReportForDisplay(report),
      ),
    };

    return createSuccess(formattedReports);
  } catch (error) {
    console.error("Error in getReportsWithPagination shell:", error);
    return createError("Failed to fetch reports", 500);
  }
};

export const getReportById = async (
  params: ReportParams,
): Promise<AppResult<ReportWithUser>> => {
  try {
    // Fetch report from data layer
    const result = await data.findReportById(params.id);
    if (!result.success) {
      return result;
    }

    // Apply business logic formatting
    const formattedReport = core.formatReportForDisplay(result.data);

    return createSuccess(formattedReport);
  } catch (error) {
    console.error("Error in getReportById shell:", error);
    return createError("Failed to fetch report", 500);
  }
};

export const createNewReport = async (
  userId: string, // Changed from number to string (UUID v7)
  reportInput: CreateReportInput,
): Promise<AppResult<{ id: string }>> => {
  // Changed return type to string
  try {
    // Sanitize input data using core business logic
    const sanitizedData = core.sanitizeReportData(reportInput);

    // Validate business rules using core logic
    const validation = core.validateReportData(sanitizedData);
    if (!validation.success) {
      return validation;
    }

    let geocodingResult: GeocodingResult | undefined;
    let metadata: GeocodingMetadata = {
      geocoding_source: "manual",
      geocoded_at: null,
    };

    const hasCoords =
      validation.data.lat !== undefined &&
      validation.data.lat !== null &&
      validation.data.lon !== undefined &&
      validation.data.lon !== null;

    if (hasCoords) {
      const reverseResult = await reverseGeocode({
        lat: validation.data.lat as number,
        lon: validation.data.lon as number,
      });

      if (reverseResult.success) {
        geocodingResult = reverseResult.data;
      }
    } else {
      const forwardResult = await forwardGeocode({
        street_name: validation.data.street_name,
        district: validation.data.district,
        city: validation.data.city,
        province: validation.data.province,
        province_code: validation.data.province_code ?? undefined,
        regency_code: validation.data.regency_code ?? undefined,
        district_code: validation.data.district_code ?? undefined,
      });

      if (forwardResult.success) {
        geocodingResult = forwardResult.data;
      }
    }

    if (geocodingResult) {
      const merged = core.mergeGeocodingIntoReport(
        validation.data,
        geocodingResult,
      );
      metadata = merged.metadata;
      validation.data = merged.report;
    }

    // Create report in data layer
    const result = await data.createReport(userId, validation.data, metadata);
    if (!result.success) {
      return result;
    }

    return createSuccess(result.data);
  } catch (error) {
    console.error("Error in createNewReport shell:", error);
    return createError("Failed to create report", 500);
  }
};

export const updateExistingReport = async (
  reportId: string, // Changed from number to string (UUID v7)
  userId: string, // Changed from number to string (UUID v7)
  updateData: Partial<CreateReportInput>,
): Promise<AppResult<ReportWithUser>> => {
  try {
    // First get the existing report to validate permissions
    const existingReportResult = await data.findReportById(reportId);
    if (!existingReportResult.success) {
      return existingReportResult;
    }

    // Validate update using core business logic
    const updateValidation = core.validateReportUpdate(
      existingReportResult.data,
      updateData,
      userId,
    );
    if (!updateValidation.success) {
      return updateValidation;
    }

    // Sanitize update data if string fields are being updated
    const sanitizedUpdateData: Partial<CreateReportInput & GeocodingMetadata> =
      {};
    if (updateData.street_name !== undefined) {
      sanitizedUpdateData.street_name = updateData.street_name.trim();
    }
    if (updateData.location_text !== undefined) {
      sanitizedUpdateData.location_text = updateData.location_text.trim();
    }
    if (updateData.image_url !== undefined) {
      sanitizedUpdateData.image_url = updateData.image_url.trim();
    }
    if (updateData.category !== undefined) {
      sanitizedUpdateData.category = updateData.category;
    }
    const targetLat = updateData.lat ?? existingReportResult.data.lat;
    const targetLon = updateData.lon ?? existingReportResult.data.lon;

    const hasCoords =
      targetLat !== undefined &&
      targetLat !== null &&
      targetLon !== undefined &&
      targetLon !== null;

    const addressChanged =
      updateData.street_name !== undefined ||
      updateData.district !== undefined ||
      updateData.city !== undefined ||
      updateData.province !== undefined ||
      updateData.province_code !== undefined ||
      updateData.regency_code !== undefined ||
      updateData.district_code !== undefined;

    let geocodingResult: GeocodingResult | undefined;
    if (hasCoords) {
      const reverseResult = await reverseGeocode({
        lat: targetLat as number,
        lon: targetLon as number,
      });

      if (reverseResult.success) {
        geocodingResult = reverseResult.data;
      }
    } else if (addressChanged) {
      const forwardResult = await forwardGeocode({
        street_name:
          sanitizedUpdateData.street_name ??
          existingReportResult.data.street_name,
        district:
          sanitizedUpdateData.district ?? existingReportResult.data.district,
        city: sanitizedUpdateData.city ?? existingReportResult.data.city,
        province:
          sanitizedUpdateData.province ?? existingReportResult.data.province,
        province_code:
          sanitizedUpdateData.province_code ??
          existingReportResult.data.province_code ??
          undefined,
        regency_code:
          sanitizedUpdateData.regency_code ??
          existingReportResult.data.regency_code ??
          undefined,
        district_code:
          sanitizedUpdateData.district_code ??
          existingReportResult.data.district_code ??
          undefined,
      });

      if (forwardResult.success) {
        geocodingResult = forwardResult.data;
      }
    }

    if (geocodingResult) {
      sanitizedUpdateData.lat = sanitizedUpdateData.lat ?? geocodingResult.lat;
      sanitizedUpdateData.lon = sanitizedUpdateData.lon ?? geocodingResult.lon;
      sanitizedUpdateData.street_name =
        sanitizedUpdateData.street_name ??
        geocodingResult.street_name ??
        existingReportResult.data.street_name;
      sanitizedUpdateData.district =
        sanitizedUpdateData.district ??
        geocodingResult.district ??
        existingReportResult.data.district;
      sanitizedUpdateData.city =
        sanitizedUpdateData.city ??
        geocodingResult.city ??
        existingReportResult.data.city;
      sanitizedUpdateData.province =
        sanitizedUpdateData.province ??
        geocodingResult.province ??
        existingReportResult.data.province;
      sanitizedUpdateData.province_code =
        sanitizedUpdateData.province_code ??
        geocodingResult.province_code ??
        existingReportResult.data.province_code ??
        undefined;
      sanitizedUpdateData.regency_code =
        sanitizedUpdateData.regency_code ??
        geocodingResult.regency_code ??
        existingReportResult.data.regency_code ??
        undefined;
      sanitizedUpdateData.district_code =
        sanitizedUpdateData.district_code ??
        geocodingResult.district_code ??
        existingReportResult.data.district_code ??
        undefined;
      sanitizedUpdateData.geocoding_source = geocodingResult.geocoding_source;
      sanitizedUpdateData.geocoded_at = geocodingResult.geocoded_at;
    }

    // Update report in data layer
    const updateResult = await data.updateReport(
      reportId,
      userId,
      sanitizedUpdateData,
    );
    if (!updateResult.success) {
      return updateResult;
    }

    // Get the updated report to return
    const updatedReportResult = await data.findReportById(reportId);
    if (!updatedReportResult.success) {
      return updatedReportResult;
    }

    // Apply business logic formatting
    const formattedReport = core.formatReportForDisplay(
      updatedReportResult.data,
    );

    return createSuccess(formattedReport);
  } catch (error) {
    console.error("Error in updateExistingReport shell:", error);
    return createError("Failed to update report", 500);
  }
};

export const deleteExistingReport = async (
  reportId: string, // Changed from number to string (UUID v7)
  userId: string, // Changed from number to string (UUID v7)
): Promise<AppResult<boolean>> => {
  try {
    // First get the existing report to validate permissions
    const existingReportResult = await data.findReportById(reportId);
    if (!existingReportResult.success) {
      return existingReportResult;
    }

    // Check if user can delete using core business logic
    const canDelete = core.canUserDeleteReport(
      existingReportResult.data,
      userId,
    );
    if (!canDelete) {
      return createError("User not authorized to delete this report", 403);
    }

    // Delete report in data layer
    const result = await data.deleteReport(reportId, userId);
    if (!result.success) {
      return result;
    }

    return createSuccess(true);
  } catch (error) {
    console.error("Error in deleteExistingReport shell:", error);
    return createError("Failed to delete report", 500);
  }
};

export const getUserReports = async (
  userId: string, // Changed from number to string (UUID v7)
  query: Pick<ReportQuery, "page" | "limit" | "category">,
): Promise<AppResult<PaginatedReports>> => {
  try {
    // Validate pagination parameters using core business logic
    const paginationValidation = core.validatePaginationParams(
      query.page,
      query.limit,
    );
    if (!paginationValidation.success) {
      return paginationValidation;
    }

    // Fetch user reports from data layer
    const result = await data.findReportsByUserId(userId, query);
    if (!result.success) {
      return result;
    }

    // Apply business logic formatting to each report
    const formattedReports = {
      ...result.data,
      items: result.data.items.map((report) =>
        core.formatReportForDisplay(report),
      ),
    };

    return createSuccess(formattedReports);
  } catch (error) {
    console.error("Error in getUserReports shell:", error);
    return createError("Failed to fetch user reports", 500);
  }
};

export const getReportsWithEnrichedData = async (
  query: ReportQuery,
): Promise<
  AppResult<
    PaginatedReports & {
      items: Array<
        ReportWithUser & {
          priority: "high" | "medium" | "low";
          isStale: boolean;
          formattedAddress: string;
        }
      >;
    }
  >
> => {
  try {
    // Get reports using existing shell function
    const result = await getReportsWithPagination(query);
    if (!result.success) {
      return result as any;
    }

    // Enrich each report with additional business data
    const enrichedItems = result.data.items.map((report) =>
      core.enrichReportData(report),
    );

    // Sort by priority if needed
    const sortedItems = core.sortReportsByPriority(enrichedItems);

    const enrichedResult = {
      ...result.data,
      items: sortedItems,
    };

    return createSuccess(enrichedResult) as any;
  } catch (error) {
    console.error("Error in getReportsWithEnrichedData shell:", error);
    return createError("Failed to fetch enriched reports", 500);
  }
};

export const validateReportOwnership = async (
  reportId: string, // Changed from number to string (UUID v7)
  userId: string, // Changed from number to string (UUID v7)
): Promise<AppResult<ReportWithUser>> => {
  try {
    // Get the report from data layer
    const result = await data.findReportById(reportId);
    if (!result.success) {
      return result;
    }

    // Check ownership using core business logic
    const canEdit = core.canUserEditReport(result.data, userId);
    if (!canEdit) {
      return createError("User not authorized to access this report", 403);
    }

    return createSuccess(result.data);
  } catch (error) {
    console.error("Error in validateReportOwnership shell:", error);
    return createError("Failed to validate report ownership", 500);
  }
};

export const reverseGeocodeLocation = async (
  payload: ReverseGeocodeRequest,
): Promise<AppResult<GeocodingResult>> => {
  return reverseGeocode(payload);
};

export const forwardGeocodeLocation = async (
  payload: ForwardGeocodeRequest,
): Promise<AppResult<GeocodingResult>> => {
  return forwardGeocode(payload);
};

export const adminUpdateReportLocation = async (
  reportId: string,
  updateData: Partial<CreateReportInput & GeocodingMetadata>,
): Promise<AppResult<boolean>> => {
  try {
    const latProvided = updateData.lat !== undefined && updateData.lat !== null;
    const lonProvided = updateData.lon !== undefined && updateData.lon !== null;

    if ((latProvided && !lonProvided) || (lonProvided && !latProvided)) {
      return createError(
        "Both latitude and longitude must be provided together",
        400,
      );
    }

    if (
      latProvided &&
      updateData.lat !== null &&
      ((updateData.lat as number) < -11 || (updateData.lat as number) > 6)
    ) {
      return createError(
        "Latitude must be within Indonesia bounds (-11 to 6)",
        400,
      );
    }

    if (
      lonProvided &&
      updateData.lon !== null &&
      ((updateData.lon as number) < 95 || (updateData.lon as number) > 141)
    ) {
      return createError(
        "Longitude must be within Indonesia bounds (95 to 141)",
        400,
      );
    }

    const sanitized: Partial<CreateReportInput & GeocodingMetadata> = {
      ...updateData,
    };

    if (updateData.street_name !== undefined) {
      sanitized.street_name = updateData.street_name.trim();
    }

    if (updateData.location_text !== undefined) {
      sanitized.location_text = updateData.location_text.trim();
    }

    if (updateData.city !== undefined) {
      sanitized.city = updateData.city.trim();
    }

    if (updateData.district !== undefined) {
      sanitized.district = updateData.district.trim();
    }

    if (updateData.province !== undefined) {
      sanitized.province = updateData.province.trim();
    }

    // Attempt geocoding if coordinates supplied
    if (
      latProvided &&
      lonProvided &&
      updateData.lat !== null &&
      updateData.lon !== null
    ) {
      const lat = updateData.lat as number;
      const lon = updateData.lon as number;

      const reverseResult = await reverseGeocode({
        lat,
        lon,
      });

      if (reverseResult.success) {
        sanitized.geocoding_source = reverseResult.data.geocoding_source;
        sanitized.geocoded_at = reverseResult.data.geocoded_at;
        sanitized.street_name =
          sanitized.street_name ?? reverseResult.data.street_name;
        sanitized.district = sanitized.district ?? reverseResult.data.district;
        sanitized.city = sanitized.city ?? reverseResult.data.city;
        sanitized.province = sanitized.province ?? reverseResult.data.province;
      }
    }

    const updateResult = await data.adminUpdateReportLocation(
      reportId,
      sanitized,
    );
    if (!updateResult.success) {
      return updateResult;
    }

    return createSuccess(true);
  } catch (error) {
    console.error("Error in adminUpdateReportLocation shell:", error);
    return createError("Failed to update report location as admin", 500);
  }
};
