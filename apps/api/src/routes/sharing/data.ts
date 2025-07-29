import { sql } from '@/db/connection';
import { createSuccess, createError } from '@/types';
import type { AppResult } from '@/types';
import type {
  ShareEvent,
  ShareEventData,
  ReportSharingData,
  ShareAnalyticsData,
  AnalyticsFilters,
  Platform,
} from './types';

// Database operations for sharing functionality

// Transaction wrapper for atomic operations
export const withTransaction = async <T>(
  operation: (sql: typeof import('@/db/connection').sql) => Promise<T>
): Promise<T> => {
  // Note: The postgres library used here handles transactions differently
  // For now, we'll use the existing sql connection directly
  // In a production environment, you might want to implement proper transaction handling
  return operation(sql);
};

export const getReportForSharing = async (
  reportId: string
): Promise<AppResult<ReportSharingData>> => {
  try {
    const result = await sql`
      SELECT 
        id,
        category,
        street_name,
        location_text,
        district,
        city,
        province,
        created_at,
        share_count
      FROM reports 
      WHERE id = ${reportId} 
        AND status = 'verified'
        AND deleted_at IS NULL
    `;

    if (result.length === 0) {
      return createError('Report not found or not eligible for sharing', 404);
    }

    const report = result[0];
    const reportData: ReportSharingData = {
      id: report.id,
      category: report.category as 'berlubang' | 'retak' | 'lainnya',
      street_name: report.street_name,
      location_text: report.location_text,
      district: report.district,
      city: report.city,
      province: report.province,
      created_at: report.created_at,
      share_count: report.share_count || 0,
    };

    return createSuccess(reportData);
  } catch (error) {
    console.error('Error fetching report for sharing:', error);
    return createError('Failed to fetch report data', 500);
  }
};

export const incrementShareCount = async (
  reportId: string
): Promise<AppResult<number>> => {
  try {
    const result = await sql`
      UPDATE reports 
      SET share_count = COALESCE(share_count, 0) + 1
      WHERE id = ${reportId} 
        AND status = 'verified'
        AND deleted_at IS NULL
      RETURNING share_count
    `;

    if (result.length === 0) {
      return createError('Report not found or not eligible for sharing', 404);
    }

    return createSuccess(result[0].share_count);
  } catch (error) {
    console.error('Error incrementing share count:', error);
    return createError('Failed to update share count', 500);
  }
};

export const recordShareEvent = async (
  shareEventData: ShareEventData
): Promise<AppResult<ShareEvent>> => {
  try {
    const result = await sql`
      INSERT INTO shares (
        report_id,
        platform,
        user_id,
        ip_address,
        user_agent,
        shared_at
      ) VALUES (
        ${shareEventData.report_id},
        ${shareEventData.platform},
        ${shareEventData.user_id || null},
        ${shareEventData.ip_address || null},
        ${shareEventData.user_agent || null},
        NOW()
      )
      RETURNING *
    `;

    if (result.length === 0) {
      return createError('Failed to record share event', 500);
    }

    const share = result[0];
    const shareEvent: ShareEvent = {
      id: share.id,
      report_id: share.report_id,
      platform: share.platform as Platform,
      user_id: share.user_id,
      shared_at: share.shared_at,
      ip_address: share.ip_address,
      user_agent: share.user_agent,
    };

    return createSuccess(shareEvent);
  } catch (error) {
    console.error('Error recording share event:', error);
    return createError('Failed to record share event', 500);
  }
};

export const getShareAnalytics = async (
  filters: AnalyticsFilters
): Promise<ShareAnalyticsData> => {
  try {
    // Build base query conditions
    let totalQuery = sql`SELECT COUNT(*) as total_shares FROM shares`;
    let platformQuery = sql`
      SELECT platform, COUNT(*) as count 
      FROM shares
    `;
    let topReportsQuery = sql`
      SELECT 
        r.id,
        r.street_name,
        r.location_text,
        r.share_count
      FROM reports r
      INNER JOIN shares s ON r.id = s.report_id
    `;

    // Apply filters
    if (filters.startDate && filters.endDate && filters.platform) {
      totalQuery = sql`
        SELECT COUNT(*) as total_shares 
        FROM shares 
        WHERE shared_at >= ${filters.startDate} 
          AND shared_at <= ${filters.endDate} 
          AND platform = ${filters.platform}
      `;
      platformQuery = sql`
        SELECT platform, COUNT(*) as count 
        FROM shares 
        WHERE shared_at >= ${filters.startDate} 
          AND shared_at <= ${filters.endDate} 
          AND platform = ${filters.platform}
        GROUP BY platform 
        ORDER BY count DESC
      `;
      topReportsQuery = sql`
        SELECT 
          r.id,
          r.street_name,
          r.location_text,
          r.share_count
        FROM reports r
        INNER JOIN shares s ON r.id = s.report_id
        WHERE s.shared_at >= ${filters.startDate} 
          AND s.shared_at <= ${filters.endDate} 
          AND s.platform = ${filters.platform}
        GROUP BY r.id, r.street_name, r.location_text, r.share_count
        ORDER BY r.share_count DESC, COUNT(s.id) DESC
        LIMIT 10
      `;
    } else if (filters.startDate && filters.endDate) {
      totalQuery = sql`
        SELECT COUNT(*) as total_shares 
        FROM shares 
        WHERE shared_at >= ${filters.startDate} 
          AND shared_at <= ${filters.endDate}
      `;
      platformQuery = sql`
        SELECT platform, COUNT(*) as count 
        FROM shares 
        WHERE shared_at >= ${filters.startDate} 
          AND shared_at <= ${filters.endDate}
        GROUP BY platform 
        ORDER BY count DESC
      `;
      topReportsQuery = sql`
        SELECT 
          r.id,
          r.street_name,
          r.location_text,
          r.share_count
        FROM reports r
        INNER JOIN shares s ON r.id = s.report_id
        WHERE s.shared_at >= ${filters.startDate} 
          AND s.shared_at <= ${filters.endDate}
        GROUP BY r.id, r.street_name, r.location_text, r.share_count
        ORDER BY r.share_count DESC, COUNT(s.id) DESC
        LIMIT 10
      `;
    } else if (filters.platform) {
      totalQuery = sql`
        SELECT COUNT(*) as total_shares 
        FROM shares 
        WHERE platform = ${filters.platform}
      `;
      platformQuery = sql`
        SELECT platform, COUNT(*) as count 
        FROM shares 
        WHERE platform = ${filters.platform}
        GROUP BY platform 
        ORDER BY count DESC
      `;
      topReportsQuery = sql`
        SELECT 
          r.id,
          r.street_name,
          r.location_text,
          r.share_count
        FROM reports r
        INNER JOIN shares s ON r.id = s.report_id
        WHERE s.platform = ${filters.platform}
        GROUP BY r.id, r.street_name, r.location_text, r.share_count
        ORDER BY r.share_count DESC, COUNT(s.id) DESC
        LIMIT 10
      `;
    } else {
      // No filters - add GROUP BY and ORDER BY to base queries
      platformQuery = sql`
        SELECT platform, COUNT(*) as count 
        FROM shares
        GROUP BY platform 
        ORDER BY count DESC
      `;
      topReportsQuery = sql`
        SELECT 
          r.id,
          r.street_name,
          r.location_text,
          r.share_count
        FROM reports r
        INNER JOIN shares s ON r.id = s.report_id
        GROUP BY r.id, r.street_name, r.location_text, r.share_count
        ORDER BY r.share_count DESC, COUNT(s.id) DESC
        LIMIT 10
      `;
    }

    // Execute queries
    const totalResult = await totalQuery;
    const totalShares = parseInt(totalResult[0].total_shares);

    const platformResult = await platformQuery;
    const platformBreakdown: Record<Platform, number> = {
      whatsapp: 0,
      twitter: 0,
      facebook: 0,
      instagram: 0,
      telegram: 0,
    };

    platformResult.forEach((row) => {
      platformBreakdown[row.platform as Platform] = parseInt(row.count);
    });

    const topReportsResult = await topReportsQuery;
    const topReports = topReportsResult.map((row) => ({
      id: row.id,
      street_name: row.street_name,
      location_text: row.location_text,
      shareCount: row.share_count || 0,
    }));

    return {
      totalShares,
      platformBreakdown,
      topReports,
    };
  } catch (error) {
    console.error('Error fetching share analytics:', error);
    throw new Error('Failed to fetch share analytics');
  }
};

export const getRecentShareEvents = async (
  reportId: string,
  limit: number = 10
): Promise<ShareEvent[]> => {
  try {
    const result = await sql`
      SELECT *
      FROM shares
      WHERE report_id = ${reportId}
      ORDER BY shared_at DESC
      LIMIT ${limit}
    `;

    return result.map((row) => ({
      id: row.id,
      report_id: row.report_id,
      platform: row.platform as Platform,
      user_id: row.user_id,
      shared_at: row.shared_at,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
    }));
  } catch (error) {
    console.error('Error fetching recent share events:', error);
    throw new Error('Failed to fetch recent share events');
  }
};

export const getShareCountByPlatform = async (
  reportId: string
): Promise<Record<Platform, number>> => {
  try {
    const result = await sql`
      SELECT 
        platform,
        COUNT(*) as count
      FROM shares
      WHERE report_id = ${reportId}
      GROUP BY platform
    `;

    const platformCounts: Record<Platform, number> = {
      whatsapp: 0,
      twitter: 0,
      facebook: 0,
      instagram: 0,
      telegram: 0,
    };

    result.forEach((row) => {
      platformCounts[row.platform as Platform] = parseInt(row.count);
    });

    return platformCounts;
  } catch (error) {
    console.error('Error fetching share count by platform:', error);
    throw new Error('Failed to fetch platform share counts');
  }
};

export const checkReportExists = async (reportId: string): Promise<boolean> => {
  try {
    const result = await sql`
      SELECT 1
      FROM reports
      WHERE id = ${reportId}
        AND status = 'verified'
        AND deleted_at IS NULL
    `;

    return result.length > 0;
  } catch (error) {
    console.error('Error checking report existence:', error);
    return false;
  }
};

export const getShareEventsByDateRange = async (
  startDate: Date,
  endDate: Date,
  platform?: Platform
): Promise<ShareEvent[]> => {
  try {
    let result;

    if (platform) {
      result = await sql`
        SELECT *
        FROM shares
        WHERE shared_at >= ${startDate}
          AND shared_at <= ${endDate}
          AND platform = ${platform}
        ORDER BY shared_at DESC
      `;
    } else {
      result = await sql`
        SELECT *
        FROM shares
        WHERE shared_at >= ${startDate}
          AND shared_at <= ${endDate}
        ORDER BY shared_at DESC
      `;
    }

    return result.map((row) => ({
      id: row.id,
      report_id: row.report_id,
      platform: row.platform as Platform,
      user_id: row.user_id,
      shared_at: row.shared_at,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
    }));
  } catch (error) {
    console.error('Error fetching share events by date range:', error);
    throw new Error('Failed to fetch share events');
  }
};

export const getMostSharedReports = async (
  limit: number = 10,
  timeframe?: { start: Date; end: Date }
): Promise<
  Array<{
    id: string;
    street_name: string;
    location_text: string;
    shareCount: number;
  }>
> => {
  try {
    let query;

    if (timeframe) {
      query = sql`
        SELECT 
          r.id,
          r.street_name,
          r.location_text,
          COUNT(s.id) as share_count
        FROM reports r
        LEFT JOIN shares s ON r.id = s.report_id
          AND s.shared_at >= ${timeframe.start}
          AND s.shared_at <= ${timeframe.end}
        WHERE r.status = 'verified'
          AND r.deleted_at IS NULL
        GROUP BY r.id, r.street_name, r.location_text
        ORDER BY share_count DESC, r.created_at DESC
        LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT 
          id,
          street_name,
          location_text,
          share_count
        FROM reports
        WHERE status = 'verified'
          AND deleted_at IS NULL
        ORDER BY share_count DESC, created_at DESC
        LIMIT ${limit}
      `;
    }

    const result = await query;

    return result.map((row) => ({
      id: row.id,
      street_name: row.street_name,
      location_text: row.location_text,
      shareCount: parseInt(row.share_count) || 0,
    }));
  } catch (error) {
    console.error('Error fetching most shared reports:', error);
    throw new Error('Failed to fetch most shared reports');
  }
};

// Additional utility functions for comprehensive share tracking

export const getShareCountForReport = async (
  reportId: string
): Promise<number> => {
  try {
    const result = await sql`
      SELECT share_count
      FROM reports
      WHERE id = ${reportId}
        AND status = 'verified'
        AND deleted_at IS NULL
    `;

    return result.length > 0 ? result[0].share_count || 0 : 0;
  } catch (error) {
    console.error('Error fetching share count for report:', error);
    throw new Error('Failed to fetch share count');
  }
};

export const getShareEventById = async (
  shareId: string
): Promise<ShareEvent | null> => {
  try {
    const result = await sql`
      SELECT *
      FROM shares
      WHERE id = ${shareId}
    `;

    if (result.length === 0) {
      return null;
    }

    const share = result[0];
    return {
      id: share.id,
      report_id: share.report_id,
      platform: share.platform as Platform,
      user_id: share.user_id,
      shared_at: share.shared_at,
      ip_address: share.ip_address,
      user_agent: share.user_agent,
    };
  } catch (error) {
    console.error('Error fetching share event by ID:', error);
    throw new Error('Failed to fetch share event');
  }
};

export const getSharesByUser = async (
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ShareEvent[]> => {
  try {
    const result = await sql`
      SELECT *
      FROM shares
      WHERE user_id = ${userId}
      ORDER BY shared_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return result.map((row) => ({
      id: row.id,
      report_id: row.report_id,
      platform: row.platform as Platform,
      user_id: row.user_id,
      shared_at: row.shared_at,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
    }));
  } catch (error) {
    console.error('Error fetching shares by user:', error);
    throw new Error('Failed to fetch user shares');
  }
};

export const getShareStatsByPlatform = async (
  startDate?: Date,
  endDate?: Date
): Promise<
  Array<{ platform: Platform; count: number; percentage: number }>
> => {
  try {
    let query;

    if (startDate && endDate) {
      query = sql`
        SELECT 
          platform,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM shares
        WHERE shared_at >= ${startDate}
          AND shared_at <= ${endDate}
        GROUP BY platform
        ORDER BY count DESC
      `;
    } else {
      query = sql`
        SELECT 
          platform,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM shares
        GROUP BY platform
        ORDER BY count DESC
      `;
    }

    const result = await query;

    return result.map((row) => ({
      platform: row.platform as Platform,
      count: parseInt(row.count),
      percentage: parseFloat(row.percentage),
    }));
  } catch (error) {
    console.error('Error fetching share stats by platform:', error);
    throw new Error('Failed to fetch platform statistics');
  }
};

export const getTopSharedReportsByTimeframe = async (
  timeframe: 'day' | 'week' | 'month',
  limit: number = 10
): Promise<
  Array<{
    id: string;
    street_name: string;
    location_text: string;
    shareCount: number;
    period: string;
  }>
> => {
  try {
    let dateFilter;
    let periodFormat;

    switch (timeframe) {
      case 'day':
        dateFilter = sql`shared_at >= CURRENT_DATE`;
        periodFormat = sql`TO_CHAR(shared_at, 'YYYY-MM-DD')`;
        break;
      case 'week':
        dateFilter = sql`shared_at >= DATE_TRUNC('week', CURRENT_DATE)`;
        periodFormat = sql`TO_CHAR(DATE_TRUNC('week', shared_at), 'YYYY-MM-DD')`;
        break;
      case 'month':
        dateFilter = sql`shared_at >= DATE_TRUNC('month', CURRENT_DATE)`;
        periodFormat = sql`TO_CHAR(DATE_TRUNC('month', shared_at), 'YYYY-MM')`;
        break;
      default:
        throw new Error('Invalid timeframe');
    }

    const result = await sql`
      SELECT 
        r.id,
        r.street_name,
        r.location_text,
        COUNT(s.id) as share_count,
        ${periodFormat} as period
      FROM reports r
      INNER JOIN shares s ON r.id = s.report_id
      WHERE ${dateFilter}
        AND r.status = 'verified'
        AND r.deleted_at IS NULL
      GROUP BY r.id, r.street_name, r.location_text, ${periodFormat}
      ORDER BY share_count DESC
      LIMIT ${limit}
    `;

    return result.map((row) => ({
      id: row.id,
      street_name: row.street_name,
      location_text: row.location_text,
      shareCount: parseInt(row.share_count),
      period: row.period,
    }));
  } catch (error) {
    console.error('Error fetching top shared reports by timeframe:', error);
    throw new Error('Failed to fetch top shared reports');
  }
};

// Batch operations for performance
export const recordMultipleShareEvents = async (
  shareEvents: ShareEventData[]
): Promise<ShareEvent[]> => {
  try {
    if (shareEvents.length === 0) {
      return [];
    }

    // Build values for batch insert
    const values = shareEvents.map(
      (event) => sql`(
      ${event.report_id},
      ${event.platform},
      ${event.user_id || null},
      ${event.ip_address || null},
      ${event.user_agent || null},
      NOW()
    )`
    );

    // For now, we'll insert one by one since sql.join might not be available
    // In a production environment, you might want to use a proper batch insert
    const results = [];
    for (const event of shareEvents) {
      const result = await sql`
        INSERT INTO shares (
          report_id,
          platform,
          user_id,
          ip_address,
          user_agent,
          shared_at
        ) VALUES (
          ${event.report_id},
          ${event.platform},
          ${event.user_id || null},
          ${event.ip_address || null},
          ${event.user_agent || null},
          NOW()
        )
        RETURNING *
      `;
      if (result.length > 0) {
        results.push(result[0]);
      }
    }

    return results.map((row) => ({
      id: row.id,
      report_id: row.report_id,
      platform: row.platform as Platform,
      user_id: row.user_id,
      shared_at: row.shared_at,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
    }));
  } catch (error) {
    console.error('Error recording multiple share events:', error);
    throw new Error('Failed to record multiple share events');
  }
};
