import { createSuccess, createError } from "@/types";
import type {
  CreateReportInput,
  ReportWithUser,
  ReportQuery,
  ReportParams,
  PaginatedReports,
} from "./types";
import type { AppResult } from "@/types";
import * as data from "./data";
import * as core from "./core";

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

    // Create report in data layer
    const result = await data.createReport(userId, validation.data);
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
    const sanitizedUpdateData: Partial<CreateReportInput> = {};
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
    if (updateData.lat !== undefined) {
      sanitizedUpdateData.lat = updateData.lat;
    }
    if (updateData.lon !== undefined) {
      sanitizedUpdateData.lon = updateData.lon;
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
