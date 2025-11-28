/**
 * Admin Core Layer
 *
 * Contains business logic for admin operations including:
 * - Report verification and management
 * - Admin statistics calculation
 * - Audit logging
 */

import { sql } from "../../db/connection";
import type {
  AdminAction,
  ReportWithUser,
  AdminStatsResponse,
  AdminReportsResponse,
} from "./types";

/**
 * Get admin statistics
 */
export async function getAdminStats(
  sql: typeof import("../../db/connection").sql,
): Promise<AdminStatsResponse> {
  // Get total counts by status
  const statusCounts = await sql`
    SELECT
      status,
      COUNT(*) as count
    FROM reports
    WHERE deleted_at IS NULL
    GROUP BY status
  `;

  // Calculate average verification time
  const avgVerificationTime = await sql`
    SELECT
      AVG(EXTRACT(EPOCH FROM (verified_at - created_at)) / 3600) as avg_hours
    FROM reports
    WHERE status = 'verified'
    AND verified_at IS NOT NULL
  `;

  // Get user statistics
  const userStats = await sql`
    SELECT
      COUNT(*) as total_users,
      COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users
    FROM users
  `;

  // Get recent admin activity
  const recentActivity = await sql`
    SELECT
      aa.action_type as action,
      aa.created_at as timestamp,
      u.name as admin_user
    FROM admin_actions aa
    JOIN users u ON aa.admin_user_id = u.id
    ORDER BY aa.created_at DESC
    LIMIT 10
  `;

  // Build response
  const stats: AdminStatsResponse = {
    totalReports: 0,
    pendingCount: 0,
    verifiedCount: 0,
    rejectedCount: 0,
    deletedCount: 0,
    totalUsers: parseInt(userStats[0]?.total_users as string) || 0,
    adminUsers: parseInt(userStats[0]?.admin_users as string) || 0,
    verificationRate: 0, // Will be calculated after we have the counts
    averageVerificationTime: Math.round(avgVerificationTime[0]?.avg_hours || 0),
    recentActivity: recentActivity.map((activity) => ({
      action: activity.action,
      timestamp: activity.timestamp.toISOString(),
      adminUser: activity.admin_user,
    })),
  };

  // Populate status counts
  statusCounts.forEach((row) => {
    const count = parseInt(row.count as string);
    stats.totalReports += count;

    switch (row.status) {
      case "pending":
        stats.pendingCount = count;
        break;
      case "verified":
        stats.verifiedCount = count;
        break;
      case "rejected":
        stats.rejectedCount = count;
        break;
      case "deleted":
        stats.deletedCount = count;
        break;
    }
  });

  // Calculate verification rate as percentage of total reports that are verified
  stats.verificationRate =
    stats.totalReports > 0
      ? Math.round((stats.verifiedCount / stats.totalReports) * 100)
      : 0;

  return stats;
}

/**
 * Get reports for admin management
 */
export async function getAdminReports(
  options: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  } = {},
): Promise<AdminReportsResponse> {
  const { page = 1, limit = 20, status, category, search } = options;
  const offset = (page - 1) * limit;

  // Build WHERE clause
  let whereClause = "WHERE r.deleted_at IS NULL";
  const params: any[] = [];

  if (status && status !== "all") {
    whereClause += " AND r.status = $1";
    params.push(status);
  }

  if (category && category !== "all") {
    whereClause += ` AND r.category = $${params.length + 1}`;
    params.push(category);
  }

  if (search) {
    whereClause += ` AND (r.street_name ILIKE $${params.length + 1} OR r.location_text ILIKE $${params.length + 1})`;
    params.push(`%${search}%`);
  }

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM reports r
    ${whereClause}
  `;

  const totalResult = await sql.unsafe(countQuery, params);
  const total = parseInt(totalResult[0]?.total as string);

  // Get reports with user information
  const reportsQuery = `
    SELECT
      r.*,
      u.id as user_id,
      u.name as user_name,
      u.email as user_email
    FROM reports r
    LEFT JOIN users u ON r.user_id = u.id
    ${whereClause}
    ORDER BY r.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const reports = await sql.unsafe(reportsQuery, [...params, limit, offset]);

  // Transform to response format
  const items = reports.map((report) => ({
    id: report.id,
    user_id: report.user_id,
    image_url: report.image_url,
    category: report.category,
    street_name: report.street_name,
    location_text: report.location_text,
    lat: report.lat,
    lon: report.lon,
    status: report.status,
    verified_at: report.verified_at?.toISOString() || null,
    verified_by: report.verified_by,
    rejection_reason: report.rejection_reason,
    deleted_at: report.deleted_at?.toISOString() || null,
    created_at: report.created_at.toISOString(),
    user: report.user_id
      ? {
          id: report.user_id,
          name: report.user_name,
          email: report.user_email,
        }
      : undefined,
  }));

  return {
    items,
    total,
    page,
    limit,
  };
}

/**
 * Get a single admin report by ID
 */
export async function getAdminReportById(
  id: string,
): Promise<AdminReportsResponse["items"][number] | null> {
  const query = `
    SELECT
      r.*,
      u.id as user_id,
      u.name as user_name,
      u.email as user_email
    FROM reports r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.id = $1
    LIMIT 1
  `;

  const rows = await sql.unsafe(query, [id]);
  const report = rows[0];

  if (!report) return null;

  return {
    id: report.id,
    user_id: report.user_id,
    image_url: report.image_url,
    category: report.category,
    street_name: report.street_name,
    location_text: report.location_text,
    lat: report.lat,
    lon: report.lon,
    status: report.status,
    verified_at: report.verified_at?.toISOString() || null,
    verified_by: report.verified_by,
    rejection_reason: report.rejection_reason,
    deleted_at: report.deleted_at?.toISOString() || null,
    created_at: report.created_at.toISOString(),
    user: report.user_id
      ? {
          id: report.user_id,
          name: report.user_name,
          email: report.user_email,
        }
      : undefined,
  };
}

/**
 * Log admin action for audit trail
 */
export async function logAdminAction(
  action: Omit<AdminAction, "id" | "created_at">,
): Promise<void> {
  await sql`
    INSERT INTO admin_actions (
      admin_user_id,
      action_type,
      target_type,
      target_id,
      details
    ) VALUES (
      ${action.admin_user_id},
      ${action.action_type},
      ${action.target_type},
      ${action.target_id},
      ${JSON.stringify(action.details)}
    )
  `;
}

/**
 * Verify a report
 */
export async function verifyReport(
  reportId: string,
  adminUserId: string,
): Promise<ReportWithUser> {
  // Update report status
  const result = await sql`
    UPDATE reports
    SET
      status = 'verified',
      verified_at = NOW(),
      verified_by = ${adminUserId},
      rejection_reason = NULL
    WHERE id = ${reportId}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error("Report not found");
  }

  const report = result[0];

  // Log admin action
  await logAdminAction({
    admin_user_id: adminUserId,
    action_type: "verify_report",
    target_type: "report",
    target_id: reportId,
    details: { previous_status: "pending" },
  });

  return report as ReportWithUser;
}

/**
 * Reject a report
 */
export async function rejectReport(
  reportId: string,
  adminUserId: string,
  reason: string,
): Promise<ReportWithUser> {
  // Update report status
  const result = await sql`
    UPDATE reports
    SET
      status = 'rejected',
      verified_at = NULL,
      verified_by = NULL,
      rejection_reason = ${reason}
    WHERE id = ${reportId}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error("Report not found");
  }

  const report = result[0];

  // Log admin action
  await logAdminAction({
    admin_user_id: adminUserId,
    action_type: "reject_report",
    target_type: "report",
    target_id: reportId,
    details: { reason, previous_status: "pending" },
  });

  return report as ReportWithUser;
}

/**
 * Toggle report status
 */
export async function toggleReportStatus(
  reportId: string,
  adminUserId: string,
  newStatus: "pending" | "verified" | "rejected",
): Promise<ReportWithUser> {
  // Get current report
  const currentReport = await sql`
    SELECT status, rejection_reason
    FROM reports
    WHERE id = ${reportId}
  `;

  if (currentReport.length === 0) {
    throw new Error("Report not found");
  }

  const previousStatus = currentReport[0].status;

  // Update report status
  let updateQuery;
  if (newStatus === "verified") {
    updateQuery = sql`
      UPDATE reports
      SET
        status = 'verified',
        verified_at = NOW(),
        verified_by = ${adminUserId},
        rejection_reason = NULL
      WHERE id = ${reportId}
      RETURNING *
    `;
  } else if (newStatus === "rejected") {
    updateQuery = sql`
      UPDATE reports
      SET
        status = 'rejected',
        verified_at = NULL,
        verified_by = NULL,
        rejection_reason = 'Status changed by admin'
      WHERE id = ${reportId}
      RETURNING *
    `;
  } else {
    updateQuery = sql`
      UPDATE reports
      SET
        status = 'pending',
        verified_at = NULL,
        verified_by = NULL,
        rejection_reason = NULL
      WHERE id = ${reportId}
      RETURNING *
    `;
  }

  const result = await updateQuery;

  if (result.length === 0) {
    throw new Error("Failed to update report");
  }

  const report = result[0];

  // Log admin action
  await logAdminAction({
    admin_user_id: adminUserId,
    action_type: "toggle_report_status",
    target_type: "report",
    target_id: reportId,
    details: {
      previous_status: previousStatus,
      new_status: newStatus,
    },
  });

  return report as ReportWithUser;
}

/**
 * Soft delete a report
 */
export async function softDeleteReport(
  reportId: string,
  adminUserId: string,
): Promise<ReportWithUser> {
  // Update report status
  const result = await sql`
    UPDATE reports
    SET
      status = 'deleted',
      deleted_at = NOW()
    WHERE id = ${reportId}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error("Report not found");
  }

  const report = result[0];

  // Log admin action
  await logAdminAction({
    admin_user_id: adminUserId,
    action_type: "delete_report",
    target_type: "report",
    target_id: reportId,
    details: { previous_status: report.status },
  });

  return report as ReportWithUser;
}

/**
 * Restore a deleted report
 */
export async function restoreReport(
  reportId: string,
  adminUserId: string,
): Promise<ReportWithUser> {
  // Update report status
  const result = await sql`
    UPDATE reports
    SET
      status = 'pending',
      deleted_at = NULL
    WHERE id = ${reportId}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error("Report not found");
  }

  const report = result[0];

  // Log admin action
  await logAdminAction({
    admin_user_id: adminUserId,
    action_type: "restore_report",
    target_type: "report",
    target_id: reportId,
    details: { new_status: "pending" },
  });

  return report as ReportWithUser;
}
