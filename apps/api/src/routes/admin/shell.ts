/**
 * Admin Shell Layer
 * 
 * Interfaces between API layer and core layer for admin operations.
 * Handles error handling and response formatting.
 */

import { sql } from "../../db/connection";
import type { 
  AdminStatsResponse,
  AdminReportsResponse,
  AdminReportActionRequest,
  AdminReportActionResponse,
  ReportWithUser
} from "./types";

/**
 * Get admin statistics
 */
export async function getAdminStats(): Promise<{
  success: boolean;
  data?: AdminStatsResponse;
  error?: string;
  statusCode?: number;
}> {
  try {
    // Get total counts by status
    const statusCounts = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM reports 
      WHERE deleted_at IS NULL
      GROUP BY status
    `;

    // Calculate verification rate (reports verified in last 7 days)
    const verificationRate = await sql`
      SELECT COUNT(*) as count
      FROM reports 
      WHERE status = 'verified' 
      AND verified_at >= NOW() - INTERVAL '7 days'
    `;

    // Calculate average verification time
    const avgVerificationTime = await sql`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (verified_at - created_at)) / 3600) as avg_hours
      FROM reports 
      WHERE status = 'verified' 
      AND verified_at IS NOT NULL
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
      verificationRate: Math.round((verificationRate[0]?.count || 0) / 7), // per day
      averageVerificationTime: Math.round(avgVerificationTime[0]?.avg_hours || 0),
      recentActivity: recentActivity.map((activity: any) => ({
        action: activity.action,
        timestamp: activity.timestamp.toISOString(),
        adminUser: activity.admin_user,
      })),
    };

    // Populate status counts
    statusCounts.forEach((row: any) => {
      const count = parseInt(row.count as string);
      stats.totalReports += count;
      
      switch (row.status) {
        case 'pending':
          stats.pendingCount = count;
          break;
        case 'verified':
          stats.verifiedCount = count;
          break;
        case 'rejected':
          stats.rejectedCount = count;
          break;
        case 'deleted':
          stats.deletedCount = count;
          break;
      }
    });

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error getting admin stats:", error);
    return {
      success: false,
      error: "Failed to get admin statistics",
      statusCode: 500,
    };
  }
}

/**
 * Get reports for admin management
 */
export async function getAdminReports(options: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
} = {}): Promise<{
  success: boolean;
  data?: AdminReportsResponse;
  error?: string;
  statusCode?: number;
}> {
  try {
    const { page = 1, limit = 20, status, category, search } = options;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = "WHERE r.deleted_at IS NULL";
    const params: any[] = [];

    if (status && status !== 'all') {
      whereClause += " AND r.status = $1";
      params.push(status);
    }

    if (category && category !== 'all') {
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
    const items = reports.map((report: any) => ({
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
      user: report.user_id ? {
        id: report.user_id,
        name: report.user_name,
        email: report.user_email,
      } : undefined,
    }));

    return {
      success: true,
      data: {
        items,
        total,
        page,
        limit,
      },
    };
  } catch (error) {
    console.error("Error getting admin reports:", error);
    return {
      success: false,
      error: "Failed to get admin reports",
      statusCode: 500,
    };
  }
}

/**
 * Log admin action for audit trail
 */
async function logAdminAction(action: {
  admin_user_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  details?: Record<string, any>;
}): Promise<void> {
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
  adminUserId: string
): Promise<{
  success: boolean;
  data?: AdminReportActionResponse;
  error?: string;
  statusCode?: number;
}> {
  try {
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
      return {
        success: false,
        error: "Report not found",
        statusCode: 404,
      };
    }

    const report = result[0];

    // Log admin action
    await logAdminAction({
      admin_user_id: adminUserId,
      action_type: 'verify_report',
      target_type: 'report',
      target_id: reportId,
      details: { previous_status: 'pending' },
    });

    return {
      success: true,
      data: {
        success: true,
        message: "Report verified successfully",
        report: {
          id: report.id,
          status: report.status,
          verified_at: report.verified_at?.toISOString() || null,
          verified_by: report.verified_by,
          rejection_reason: report.rejection_reason,
          deleted_at: report.deleted_at?.toISOString() || null,
        },
      },
    };
  } catch (error) {
    console.error("Error verifying report:", error);
    return {
      success: false,
      error: "Failed to verify report",
      statusCode: 500,
    };
  }
}

/**
 * Reject a report
 */
export async function rejectReport(
  reportId: string,
  adminUserId: string,
  reason: string
): Promise<{
  success: boolean;
  data?: AdminReportActionResponse;
  error?: string;
  statusCode?: number;
}> {
  try {
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
      return {
        success: false,
        error: "Report not found",
        statusCode: 404,
      };
    }

    const report = result[0];

    // Log admin action
    await logAdminAction({
      admin_user_id: adminUserId,
      action_type: 'reject_report',
      target_type: 'report',
      target_id: reportId,
      details: { reason, previous_status: 'pending' },
    });

    return {
      success: true,
      data: {
        success: true,
        message: "Report rejected successfully",
        report: {
          id: report.id,
          status: report.status,
          verified_at: report.verified_at?.toISOString() || null,
          verified_by: report.verified_by,
          rejection_reason: report.rejection_reason,
          deleted_at: report.deleted_at?.toISOString() || null,
        },
      },
    };
  } catch (error) {
    console.error("Error rejecting report:", error);
    return {
      success: false,
      error: "Failed to reject report",
      statusCode: 500,
    };
  }
}

/**
 * Toggle report status
 */
export async function toggleReportStatus(
  reportId: string,
  adminUserId: string,
  newStatus: 'pending' | 'verified' | 'rejected'
): Promise<{
  success: boolean;
  data?: AdminReportActionResponse;
  error?: string;
  statusCode?: number;
}> {
  try {
    // Get current report
    const currentReport = await sql`
      SELECT status, rejection_reason
      FROM reports 
      WHERE id = ${reportId}
    `;

    if (currentReport.length === 0) {
      return {
        success: false,
        error: "Report not found",
        statusCode: 404,
      };
    }

    const previousStatus = currentReport[0].status;

    // Update report status
    let updateQuery;
    if (newStatus === 'verified') {
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
    } else if (newStatus === 'rejected') {
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
      return {
        success: false,
        error: "Failed to update report",
        statusCode: 500,
      };
    }

    const report = result[0];

    // Log admin action
    await logAdminAction({
      admin_user_id: adminUserId,
      action_type: 'toggle_report_status',
      target_type: 'report',
      target_id: reportId,
      details: { 
        previous_status: previousStatus,
        new_status: newStatus,
      },
    });

    return {
      success: true,
      data: {
        success: true,
        message: `Report status changed to ${newStatus}`,
        report: {
          id: report.id,
          status: report.status,
          verified_at: report.verified_at?.toISOString() || null,
          verified_by: report.verified_by,
          rejection_reason: report.rejection_reason,
          deleted_at: report.deleted_at?.toISOString() || null,
        },
      },
    };
  } catch (error) {
    console.error("Error toggling report status:", error);
    return {
      success: false,
      error: "Failed to toggle report status",
      statusCode: 500,
    };
  }
}

/**
 * Soft delete a report
 */
export async function softDeleteReport(
  reportId: string,
  adminUserId: string
): Promise<{
  success: boolean;
  data?: AdminReportActionResponse;
  error?: string;
  statusCode?: number;
}> {
  try {
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
      return {
        success: false,
        error: "Report not found",
        statusCode: 404,
      };
    }

    const report = result[0];

    // Log admin action
    await logAdminAction({
      admin_user_id: adminUserId,
      action_type: 'delete_report',
      target_type: 'report',
      target_id: reportId,
      details: { previous_status: report.status },
    });

    return {
      success: true,
      data: {
        success: true,
        message: "Report deleted successfully",
        report: {
          id: report.id,
          status: report.status,
          verified_at: report.verified_at?.toISOString() || null,
          verified_by: report.verified_by,
          rejection_reason: report.rejection_reason,
          deleted_at: report.deleted_at?.toISOString() || null,
        },
      },
    };
  } catch (error) {
    console.error("Error deleting report:", error);
    return {
      success: false,
      error: "Failed to delete report",
      statusCode: 500,
    };
  }
}

/**
 * Restore a deleted report
 */
export async function restoreReport(
  reportId: string,
  adminUserId: string
): Promise<{
  success: boolean;
  data?: AdminReportActionResponse;
  error?: string;
  statusCode?: number;
}> {
  try {
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
      return {
        success: false,
        error: "Report not found",
        statusCode: 404,
      };
    }

    const report = result[0];

    // Log admin action
    await logAdminAction({
      admin_user_id: adminUserId,
      action_type: 'restore_report',
      target_type: 'report',
      target_id: reportId,
      details: { new_status: 'pending' },
    });

    return {
      success: true,
      data: {
        success: true,
        message: "Report restored successfully",
        report: {
          id: report.id,
          status: report.status,
          verified_at: report.verified_at?.toISOString() || null,
          verified_by: report.verified_by,
          rejection_reason: report.rejection_reason,
          deleted_at: report.deleted_at?.toISOString() || null,
        },
      },
    };
  } catch (error) {
    console.error("Error restoring report:", error);
    return {
      success: false,
      error: "Failed to restore report",
      statusCode: 500,
    };
  }
} 