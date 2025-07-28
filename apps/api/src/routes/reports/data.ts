import { sql } from "@/db/connection";
import { createSuccess, createError } from "@/types";
import { debugUuidData } from "@/utils/uuid";
import type {
  Report,
  ReportWithUser,
  CreateReportInput,
  ReportQuery,
  PaginatedReports,
} from "./types";
import type { AppResult } from "@/types";
import { uuidv7 } from "uuidv7";

// Database operations for reports

export const findReportsWithPagination = async (
  query: ReportQuery,
): Promise<AppResult<PaginatedReports>> => {
  try {
    const { page, limit, category, user_id } = query;
    const offset = (page - 1) * limit;

    const whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Only return verified reports for public API (when no user_id is specified)
    if (!user_id) {
      whereConditions.push(`r.status = 'verified'`);
    }

    if (category) {
      whereConditions.push(`r.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (user_id) {
      whereConditions.push(`r.user_id = $${paramIndex}`);
      params.push(user_id); // Now expects UUID string, no parseInt needed
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    // Get reports with user information including administrative fields
    const reportsQuery = `
      SELECT 
        r.id,
        r.user_id,
        r.image_url,
        r.category,
        r.street_name,
        r.location_text,
        r.lat,
        r.lon,
        r.district,
        r.city,
        r.province,
        r.province_code,
        r.regency_code,
        r.district_code,
        r.status,
        r.verified_at,
        r.verified_by,
        r.rejection_reason,
        r.deleted_at,
        r.created_at,
        u.name as user_name,
        u.avatar_url as user_avatar
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Count total reports for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM reports r
      ${whereClause}
    `;

    params.push(limit, offset);

    const [reports, countResult] = await Promise.all([
      sql.unsafe(reportsQuery, params),
      sql.unsafe(countQuery, params.slice(0, -2)), // Remove limit and offset for count
    ]);

    const total = Number((countResult as any)[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    // Debug: Log the first report to see the data structure
    if ((reports as any).length > 0) {
      const firstReport = (reports as any)[0];
      debugUuidData(firstReport, "First report from database");
    }

    const paginatedResult: PaginatedReports = {
      items: reports as unknown as ReportWithUser[],
      total,
      page,
      limit,
      pages,
    };

    return createSuccess(paginatedResult);
  } catch (error) {
    console.error("Database error in findReportsWithPagination:", error);
    return createError("Failed to fetch reports from database", 500);
  }
};

export const findReportById = async (
  id: string, // Changed from number to string (UUID v7)
): Promise<AppResult<ReportWithUser>> => {
  try {
    const query = `
      SELECT 
        r.id,
        r.user_id,
        r.image_url,
        r.category,
        r.street_name,
        r.location_text,
        r.lat,
        r.lon,
        r.district,
        r.city,
        r.province,
        r.province_code,
        r.regency_code,
        r.district_code,
        r.status,
        r.verified_at,
        r.verified_by,
        r.rejection_reason,
        r.deleted_at,
        r.created_at,
        u.name as user_name,
        u.avatar_url as user_avatar
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = $1 AND r.status != 'deleted'
    `;

    const result = await sql.unsafe(query, [id]);

    if (result.length === 0) {
      return createError("Report not found", 404);
    }

    return createSuccess(result[0] as unknown as ReportWithUser);
  } catch (error) {
    console.error("Database error in findReportById:", error);
    return createError("Failed to fetch report from database", 500);
  }
};

export const createReport = async (
  userId: string, // Changed from number to string (UUID v7)
  reportData: CreateReportInput,
): Promise<AppResult<{ id: string }>> => {
  // Changed return type to string
  try {
    const reportId = uuidv7(); // Generate UUID v7 for new report
    const query = `
      INSERT INTO reports (
        id,
        user_id, 
        image_url, 
        category, 
        street_name, 
        location_text, 
        lat, 
        lon,
        district,
        city,
        province,
        province_code,
        regency_code,
        district_code,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id
    `;

    const params = [
      reportId,
      userId,
      reportData.image_url,
      reportData.category,
      reportData.street_name,
      reportData.location_text,
      reportData.lat || null,
      reportData.lon || null,
      reportData.district,
      reportData.city,
      reportData.province,
      reportData.province_code || null,
      reportData.regency_code || null,
      reportData.district_code || null,
      "pending", // Default status for new reports
    ];

    const result = await sql.unsafe(query, params);

    if (result.length === 0) {
      return createError("Failed to create report", 500);
    }

    return createSuccess({ id: result[0].id });
  } catch (error) {
    console.error("Database error in createReport:", error);
    return createError("Failed to create report in database", 500);
  }
};

export const updateReport = async (
  id: string, // Changed from number to string (UUID v7)
  userId: string, // Changed from number to string (UUID v7)
  reportData: Partial<CreateReportInput>,
): Promise<AppResult<boolean>> => {
  try {
    // First check if report exists and belongs to user
    const existsQuery = `
      SELECT id FROM reports 
      WHERE id = $1 AND user_id = $2
    `;

    const existsResult = await sql.unsafe(existsQuery, [id, userId]);

    if (existsResult.length === 0) {
      return createError("Report not found or access denied", 404);
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (reportData.image_url !== undefined) {
      updateFields.push(`image_url = $${paramIndex}`);
      params.push(reportData.image_url);
      paramIndex++;
    }

    if (reportData.category !== undefined) {
      updateFields.push(`category = $${paramIndex}`);
      params.push(reportData.category);
      paramIndex++;
    }

    if (reportData.street_name !== undefined) {
      updateFields.push(`street_name = $${paramIndex}`);
      params.push(reportData.street_name);
      paramIndex++;
    }

    if (reportData.location_text !== undefined) {
      updateFields.push(`location_text = $${paramIndex}`);
      params.push(reportData.location_text);
      paramIndex++;
    }

    if (reportData.lat !== undefined) {
      updateFields.push(`lat = $${paramIndex}`);
      params.push(reportData.lat);
      paramIndex++;
    }

    if (reportData.lon !== undefined) {
      updateFields.push(`lon = $${paramIndex}`);
      params.push(reportData.lon);
      paramIndex++;
    }

    // Administrative fields
    if (reportData.district !== undefined) {
      updateFields.push(`district = $${paramIndex}`);
      params.push(reportData.district);
      paramIndex++;
    }

    if (reportData.city !== undefined) {
      updateFields.push(`city = $${paramIndex}`);
      params.push(reportData.city);
      paramIndex++;
    }

    if (reportData.province !== undefined) {
      updateFields.push(`province = $${paramIndex}`);
      params.push(reportData.province);
      paramIndex++;
    }

    if (reportData.province_code !== undefined) {
      updateFields.push(`province_code = $${paramIndex}`);
      params.push(reportData.province_code);
      paramIndex++;
    }

    if (reportData.regency_code !== undefined) {
      updateFields.push(`regency_code = $${paramIndex}`);
      params.push(reportData.regency_code);
      paramIndex++;
    }

    if (reportData.district_code !== undefined) {
      updateFields.push(`district_code = $${paramIndex}`);
      params.push(reportData.district_code);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return createError("No fields to update", 400);
    }

    const updateQuery = `
      UPDATE reports 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
    `;

    params.push(id, userId);

    const result = await sql.unsafe(updateQuery, params);

    return createSuccess(true);
  } catch (error) {
    console.error("Database error in updateReport:", error);
    return createError("Failed to update report in database", 500);
  }
};

export const deleteReport = async (
  id: string, // Changed from number to string (UUID v7)
  userId: string, // Changed from number to string (UUID v7)
): Promise<AppResult<boolean>> => {
  try {
    const query = `
      DELETE FROM reports 
      WHERE id = $1 AND user_id = $2
    `;

    const result = await sql.unsafe(query, [id, userId]);

    if ((result as any).rowCount === 0) {
      return createError("Report not found or access denied", 404);
    }

    return createSuccess(true);
  } catch (error) {
    console.error("Database error in deleteReport:", error);
    return createError("Failed to delete report from database", 500);
  }
};

export const findReportsByUserId = async (
  userId: string, // Changed from number to string (UUID v7)
  query: Pick<ReportQuery, "page" | "limit" | "category">,
): Promise<AppResult<PaginatedReports>> => {
  const extendedQuery: ReportQuery = {
    ...query,
    user_id: userId, // userId is already a string (UUID)
  };

  return findReportsWithPagination(extendedQuery);
};
