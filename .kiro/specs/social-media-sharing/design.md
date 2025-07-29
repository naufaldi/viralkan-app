# Design Document

## Overview

This design document outlines the implementation of the social media sharing system API for the Viralkan application. The system provides backend support for tracking share counts, generating template-based captions, and basic analytics. The design follows the existing 4-layer clean architecture pattern used throughout the application and integrates seamlessly with the current report system.

The implementation is MVP-focused, prioritizing core functionality over advanced features. AI-powered caption generation using OpenAI API is planned for a future phase after the core system is stable and functional.

## Architecture

### System Context

The social media sharing system integrates with the existing Viralkan API architecture:

```
┌─────────────────────────────────────┐
│         Frontend (Next.js)          │  ← Existing UI components
├─────────────────────────────────────┤
│         API Layer (Hono)            │  ← New sharing endpoints
├─────────────────────────────────────┤
│        Shell Layer                  │  ← Business logic orchestration
├─────────────────────────────────────┤
│         Core Layer                  │  ← Caption templates & validation
├─────────────────────────────────────┤
│         Data Layer                  │  ← Database operations
├─────────────────────────────────────┤
│      Database (PostgreSQL)          │  ← Share tracking tables
└─────────────────────────────────────┘
```

### Feature Structure

Following the existing pattern in `apps/api/src/routes/`, the sharing feature will be organized as:

```
apps/api/src/routes/sharing/
├── index.ts              # Public exports
├── api.ts                # Hono route definitions
├── shell.ts              # Business logic orchestration
├── core.ts               # Caption templates & utilities
├── data.ts               # Database operations
└── types.ts              # TypeScript types and schemas
```

## Components and Interfaces

### 1. API Layer (`api.ts`)

The API layer provides RESTful endpoints for sharing functionality:

#### Endpoints

**POST `/api/reports/:id/share`**

- Purpose: Track a share event and increment share count
- Authentication: Optional (can track anonymous shares)
- Request Body: `{ platform: string }`
- Response: `{ success: boolean, newShareCount: number }`

**POST `/api/reports/:id/generate-caption`**

- Purpose: Generate a caption for sharing
- Authentication: None required
- Request Body: `{ tone: string, platform: string }`
- Response: `{ caption: string, hashtags: string[] }`

**GET `/api/admin/analytics/shares`**

- Purpose: Retrieve sharing analytics (admin only)
- Authentication: Required (admin role)
- Query Parameters: `{ startDate?, endDate?, platform? }`
- Response: `{ totalShares: number, platformBreakdown: object, topReports: array }`

#### Route Implementation Pattern

```typescript
// Following existing pattern from reports/api.ts
export const sharingRouter = new OpenAPIHono<Env>();

const trackShareRoute = createRoute({
  method: 'post',
  path: '/{id}/share',
  request: {
    params: ReportParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: TrackShareSchema,
        },
      },
    },
  },
  summary: 'Track report share',
  description: 'Increment share count for a report',
  tags: ['Sharing'],
  responses: {
    200: {
      description: 'Share tracked successfully',
      content: { 'application/json': { schema: ShareTrackingResponseSchema } },
    },
    404: {
      description: 'Report not found',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});
```

### 2. Shell Layer (`shell.ts`)

The shell layer orchestrates business logic and coordinates between core and data layers:

#### Key Functions

```typescript
export const trackReportShare = async (
  reportId: string,
  platform: string,
  userId?: string
): Promise<AppResult<ShareTrackingResponse>> => {
  // 1. Validate report exists
  // 2. Validate platform is supported
  // 3. Record share event in database
  // 4. Increment share count
  // 5. Return updated count
};

export const generateReportCaption = async (
  reportId: string,
  tone: string,
  platform: string
): Promise<AppResult<CaptionResponse>> => {
  // 1. Fetch report data
  // 2. Validate tone and platform
  // 3. Generate caption using templates
  // 4. Optimize for platform character limits
  // 5. Return caption with hashtags
};

export const getShareAnalytics = async (
  filters: AnalyticsFilters
): Promise<AppResult<ShareAnalytics>> => {
  // 1. Validate date ranges
  // 2. Query share events
  // 3. Aggregate statistics
  // 4. Format response
};
```

### 3. Core Layer (`core.ts`)

The core layer contains pure business logic and caption templates:

#### Caption Template System

```typescript
interface CaptionTemplate {
  formal: string;
  urgent: string;
  community: string;
  informative: string;
}

const CAPTION_TEMPLATES: CaptionTemplate = {
  formal:
    'Ditemukan kerusakan jalan {category} di {street}, {district}, {city}, {province}. Mohon perhatian pemerintah daerah untuk perbaikan. #ViralkanJalan #RoadDamage',
  urgent:
    '🚨 URGENT! Jalan rusak parah di {location} membahayakan pengendara! Kapan diperbaiki? #DamageAlert #FixOurRoads',
  community:
    'Warga {district} butuh bantuan! Jalan {street} rusak dan mengganggu aktivitas sehari-hari. Mari bersama-sama minta perbaikan 🙏 #CommunityAction',
  informative:
    'Data kerusakan jalan: {location} - Kategori: {category} - Dilaporkan: {date}. Butuh tindakan segera dari pihak berwenang. #DataTransparency',
};

export const generateCaptionFromTemplate = (
  template: string,
  reportData: ReportData,
  platform: string
): string => {
  // 1. Replace template variables with report data
  // 2. Optimize for platform character limits
  // 3. Add appropriate hashtags
  // 4. Return formatted caption
};
```

#### Platform Configuration

```typescript
interface PlatformConfig {
  maxLength: number;
  hashtagLimit: number;
  urlHandling: 'included' | 'separate';
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  twitter: { maxLength: 280, hashtagLimit: 3, urlHandling: 'included' },
  facebook: { maxLength: 2000, hashtagLimit: 5, urlHandling: 'separate' },
  whatsapp: { maxLength: 1000, hashtagLimit: 3, urlHandling: 'included' },
  instagram: { maxLength: 2200, hashtagLimit: 10, urlHandling: 'separate' },
  telegram: { maxLength: 4096, hashtagLimit: 5, urlHandling: 'included' },
};
```

### 4. Data Layer (`data.ts`)

The data layer handles database operations:

#### Key Functions

```typescript
export const incrementShareCount = async (
  db: Database,
  reportId: string
): Promise<number> => {
  // Update reports.share_count atomically
  // Return new count
};

export const recordShareEvent = async (
  db: Database,
  shareEvent: ShareEventData
): Promise<ShareEvent> => {
  // Insert into shares table
  // Return created record
};

export const getReportForSharing = async (
  db: Database,
  reportId: string
): Promise<ReportSharingData | null> => {
  // Fetch report with location hierarchy
  // Include only public data for sharing
};

export const getShareAnalytics = async (
  db: Database,
  filters: AnalyticsFilters
): Promise<ShareAnalyticsData> => {
  // Query aggregated share statistics
  // Group by platform, date, etc.
};
```

## Data Models

### Database Schema Changes

#### 1. Add share_count to reports table

```sql
-- Migration: Add share count to existing reports table
ALTER TABLE reports ADD COLUMN share_count INTEGER DEFAULT 0;

-- Index for performance
CREATE INDEX IF NOT EXISTS reports_share_count_idx ON reports(share_count DESC);
```

#### 2. Create shares tracking table

```sql
-- New table for tracking individual share events
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'twitter', 'facebook', 'instagram', 'telegram')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Optional for anonymous shares
  shared_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET, -- For rate limiting and analytics
  user_agent TEXT -- For analytics
);

-- Indexes for performance and analytics
CREATE INDEX IF NOT EXISTS shares_report_id_idx ON shares(report_id);
CREATE INDEX IF NOT EXISTS shares_platform_idx ON shares(platform);
CREATE INDEX IF NOT EXISTS shares_shared_at_idx ON shares(shared_at DESC);
CREATE INDEX IF NOT EXISTS shares_user_id_idx ON shares(user_id);
```

### TypeScript Types

```typescript
// Core data types
export interface ShareEvent {
  id: string;
  report_id: string;
  platform: 'whatsapp' | 'twitter' | 'facebook' | 'instagram' | 'telegram';
  user_id?: string;
  shared_at: Date;
  ip_address?: string;
  user_agent?: string;
}

export interface ReportSharingData {
  id: string;
  category: string;
  street_name: string;
  location_text: string;
  province?: string;
  city?: string;
  district?: string;
  created_at: Date;
  share_count: number;
}

// API request/response types
export interface TrackShareRequest {
  platform: string;
}

export interface ShareTrackingResponse {
  success: boolean;
  newShareCount: number;
}

export interface GenerateCaptionRequest {
  tone: 'formal' | 'urgent' | 'community' | 'informative';
  platform: 'whatsapp' | 'twitter' | 'facebook' | 'instagram' | 'telegram';
}

export interface CaptionResponse {
  caption: string;
  hashtags: string[];
  characterCount: number;
  platformOptimized: boolean;
}

export interface ShareAnalytics {
  totalShares: number;
  platformBreakdown: Record<string, number>;
  topReports: Array<{
    id: string;
    title: string;
    shareCount: number;
  }>;
  dateRange: {
    start: Date;
    end: Date;
  };
}
```

## Error Handling

### Error Types

Following the existing error handling pattern:

```typescript
// Specific error types for sharing functionality
export class ShareNotFoundError extends Error {
  constructor(reportId: string) {
    super(`Report ${reportId} not found for sharing`);
    this.name = 'ShareNotFoundError';
  }
}

export class InvalidPlatformError extends Error {
  constructor(platform: string) {
    super(`Platform ${platform} is not supported`);
    this.name = 'InvalidPlatformError';
  }
}

export class CaptionGenerationError extends Error {
  constructor(message: string) {
    super(`Caption generation failed: ${message}`);
    this.name = 'CaptionGenerationError';
  }
}
```

### Error Response Format

Following existing API error response format:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    timestamp: string;
  };
}
```

## Testing Strategy

### Unit Tests

```typescript
// core.test.ts - Test caption generation logic
describe('Caption Generation', () => {
  it('should generate formal tone caption', () => {
    const reportData = {
      category: 'berlubang',
      street_name: 'Jl. Sudirman',
      district: 'Menteng',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
    };

    const caption = generateCaptionFromTemplate(
      CAPTION_TEMPLATES.formal,
      reportData,
      'twitter'
    );

    expect(caption).toContain('berlubang');
    expect(caption).toContain('Jl. Sudirman');
    expect(caption.length).toBeLessThanOrEqual(280);
  });
});

// shell.test.ts - Test business logic
describe('Share Tracking', () => {
  it('should increment share count', async () => {
    const mockDb = createMockDatabase();
    const result = await trackReportShare('report-id', 'twitter');

    expect(result.success).toBe(true);
    expect(result.data.newShareCount).toBe(1);
  });
});
```

### Integration Tests

```typescript
// api.test.ts - Test API endpoints
describe('Sharing API', () => {
  it('should track share successfully', async () => {
    const response = await app.request('/api/reports/test-id/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'twitter' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.newShareCount).toBeGreaterThan(0);
  });
});
```

## Performance Considerations

### Database Optimization

1. **Atomic Updates**: Use database transactions for share count increments
2. **Indexing**: Proper indexes on frequently queried columns
3. **Partitioning**: Consider partitioning shares table by date for large datasets

### Caching Strategy

```typescript
// Cache frequently accessed report data for caption generation
const REPORT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getCachedReportData = async (
  reportId: string
): Promise<ReportSharingData | null> => {
  // Check cache first
  // Fallback to database
  // Update cache
};
```

### Rate Limiting

```typescript
// Prevent spam sharing
const SHARE_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxShares: 10, // Max 10 shares per minute per IP
};
```

## Security Considerations

### Input Validation

```typescript
// Validate all inputs using Zod schemas
export const TrackShareSchema = z.object({
  platform: z.enum([
    'whatsapp',
    'twitter',
    'facebook',
    'instagram',
    'telegram',
  ]),
});

export const GenerateCaptionSchema = z.object({
  tone: z.enum(['formal', 'urgent', 'community', 'informative']),
  platform: z.enum([
    'whatsapp',
    'twitter',
    'facebook',
    'instagram',
    'telegram',
  ]),
});
```

### Data Privacy

1. **Anonymous Sharing**: Support sharing without user authentication
2. **IP Anonymization**: Hash IP addresses for analytics
3. **Data Retention**: Implement retention policies for share events

### Content Security

```typescript
// Sanitize generated captions
export const sanitizeCaption = (caption: string): string => {
  // Remove potentially harmful content
  // Escape special characters
  // Validate length limits
  return caption;
};
```

## Integration Points

### Frontend Integration

The API will integrate with existing frontend components:

```typescript
// Frontend usage example
const shareReport = async (reportId: string, platform: string) => {
  // 1. Generate caption
  const captionResponse = await fetch(
    `/api/reports/${reportId}/generate-caption`,
    {
      method: 'POST',
      body: JSON.stringify({ tone: 'formal', platform }),
    }
  );

  // 2. Track share
  const shareResponse = await fetch(`/api/reports/${reportId}/share`, {
    method: 'POST',
    body: JSON.stringify({ platform }),
  });

  // 3. Update UI with new share count
  updateShareCount(shareResponse.newShareCount);
};
```

### Existing System Integration

1. **Authentication**: Use existing `firebaseAuthMiddleware` for admin endpoints
2. **Database**: Use existing database connection patterns
3. **Error Handling**: Follow existing error response formats
4. **Logging**: Use existing logging infrastructure

## Future Enhancements

### Phase 2: AI Caption Generation

After MVP is stable, integrate OpenAI API:

```typescript
// Future AI integration
export const generateAICaption = async (
  reportData: ReportSharingData,
  tone: string,
  platform: string
): Promise<string> => {
  const prompt = `Generate a ${tone} social media caption for ${platform} about road damage: ${JSON.stringify(reportData)}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 100,
  });

  return response.choices[0].message.content;
};
```

### Phase 3: Advanced Analytics

1. **Engagement Tracking**: Track clicks, conversions from shares
2. **A/B Testing**: Test different caption styles
3. **Viral Metrics**: Identify high-performing content patterns

## Deployment Considerations

### Environment Variables

```bash
# Add to .env
OPENAI_API_KEY=sk-... # For future AI integration
SHARE_RATE_LIMIT_ENABLED=true
SHARE_ANALYTICS_ENABLED=true
```

### Database Migrations

```sql
-- Migration script for production deployment
BEGIN;

-- Add share_count column
ALTER TABLE reports ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- Create shares table
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'twitter', 'facebook', 'instagram', 'telegram')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  shared_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS reports_share_count_idx ON reports(share_count DESC);
CREATE INDEX IF NOT EXISTS shares_report_id_idx ON shares(report_id);
CREATE INDEX IF NOT EXISTS shares_platform_idx ON shares(platform);
CREATE INDEX IF NOT EXISTS shares_shared_at_idx ON shares(shared_at DESC);

COMMIT;
```

This design provides a solid foundation for the MVP social media sharing system while maintaining compatibility with the existing architecture and allowing for future enhancements.
