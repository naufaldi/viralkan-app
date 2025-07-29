import { z } from '@hono/zod-openapi';
import { createUuidValidator } from '@/utils/uuid';

const uuidValidator = createUuidValidator('UUID');

// Request Schemas
export const TrackShareSchema = z.object({
  platform: z
    .enum(['whatsapp', 'twitter', 'facebook', 'instagram', 'telegram'])
    .openapi({
      example: 'twitter',
      description: 'Social media platform where the report was shared',
    }),
});

export const GenerateCaptionSchema = z.object({
  tone: z.enum(['formal', 'urgent', 'community', 'informative']).openapi({
    example: 'formal',
    description: 'Tone of the caption to generate',
  }),
  platform: z
    .enum(['whatsapp', 'twitter', 'facebook', 'instagram', 'telegram'])
    .openapi({
      example: 'twitter',
      description: 'Target social media platform for caption optimization',
    }),
});

export const ShareAnalyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional().openapi({
    example: '2024-01-01T00:00:00Z',
    description: 'Start date for analytics data (ISO 8601 format)',
  }),
  endDate: z.string().datetime().optional().openapi({
    example: '2024-01-31T23:59:59Z',
    description: 'End date for analytics data (ISO 8601 format)',
  }),
  platform: z
    .enum(['whatsapp', 'twitter', 'facebook', 'instagram', 'telegram'])
    .optional()
    .openapi({
      example: 'twitter',
      description: 'Filter analytics by specific platform',
    }),
});

export const SharingReportParamsSchema = z.object({
  id: uuidValidator.openapi({
    example: '01890dd5-ea3f-7746-b3a5-e8c5e0b0f4a1',
    description: 'Unique identifier of the report (UUID v7)',
    format: 'uuid',
    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
    param: {
      name: 'id',
      in: 'path',
      required: true,
    },
  }),
});

// Response Schemas
export const ShareTrackingResponseSchema = z.object({
  success: z.boolean().openapi({
    example: true,
    description: 'Indicates if the share was tracked successfully',
  }),
  newShareCount: z.number().openapi({
    example: 15,
    description: 'Updated total share count for the report',
  }),
});

export const CaptionResponseSchema = z.object({
  caption: z.string().openapi({
    example:
      'Ditemukan kerusakan jalan berlubang di Jl. Sudirman, Menteng, Jakarta Pusat, DKI Jakarta. Mohon perhatian pemerintah daerah untuk perbaikan.',
    description: 'Generated caption text optimized for the target platform',
  }),
  hashtags: z.array(z.string()).openapi({
    example: ['#ViralkanJalan', '#RoadDamage', '#JalanBerlubang'],
    description: 'Relevant hashtags for the caption',
  }),
  characterCount: z.number().openapi({
    example: 156,
    description: 'Total character count including hashtags',
  }),
  platformOptimized: z.boolean().openapi({
    example: true,
    description: 'Indicates if the caption was optimized for platform limits',
  }),
});

export const ShareAnalyticsResponseSchema = z.object({
  totalShares: z.number().openapi({
    example: 1250,
    description: 'Total number of shares in the specified period',
  }),
  platformBreakdown: z.record(z.string(), z.number()).openapi({
    example: {
      whatsapp: 450,
      twitter: 320,
      facebook: 280,
      instagram: 150,
      telegram: 50,
    },
    description: 'Share count breakdown by platform',
  }),
  topReports: z
    .array(
      z.object({
        id: uuidValidator.openapi({
          example: '01890dd5-ea3f-7746-b3a5-e8c5e0b0f4a1',
          description: 'Report ID',
        }),
        title: z.string().openapi({
          example: 'Jl. Sudirman, Menteng, Jakarta Pusat',
          description: 'Report title (street and location)',
        }),
        shareCount: z.number().openapi({
          example: 45,
          description: 'Total share count for this report',
        }),
      })
    )
    .openapi({
      description: 'Top 10 most shared reports in the period',
    }),
  dateRange: z
    .object({
      start: z.string().datetime().openapi({
        example: '2024-01-01T00:00:00Z',
        description: 'Start date of the analytics period',
      }),
      end: z.string().datetime().openapi({
        example: '2024-01-31T23:59:59Z',
        description: 'End date of the analytics period',
      }),
    })
    .openapi({
      description: 'Date range for the analytics data',
    }),
});

export const ReportShareDetailsResponseSchema = z.object({
  shareCount: z.number().openapi({
    example: 25,
    description: 'Total share count for the report',
  }),
  platformBreakdown: z.record(z.string(), z.number()).openapi({
    example: {
      whatsapp: 10,
      twitter: 8,
      facebook: 5,
      instagram: 2,
      telegram: 0,
    },
    description: 'Share count breakdown by platform for this report',
  }),
  recentShares: z
    .array(
      z.object({
        platform: z.string().openapi({
          example: 'Twitter/X',
          description: 'Platform display name',
        }),
        sharedAt: z.string().datetime().openapi({
          example: '2024-01-15T10:30:00Z',
          description: 'When the share occurred',
        }),
        userId: uuidValidator.optional().openapi({
          example: '01890dd5-1234-7746-b3a5-e8c5e0b0f4a1',
          description: 'User ID if the share was by an authenticated user',
        }),
      })
    )
    .openapi({
      description: 'Recent share events for this report (last 10)',
    }),
});

export const ShareValidationResponseSchema = z.object({
  eligible: z.boolean().openapi({
    example: true,
    description: 'Whether the report is eligible for sharing',
  }),
  reason: z.string().optional().openapi({
    example: 'Report is eligible for sharing',
    description: 'Explanation of eligibility status',
  }),
});

export const MostSharedReportsResponseSchema = z.array(
  z.object({
    id: uuidValidator.openapi({
      example: '01890dd5-ea3f-7746-b3a5-e8c5e0b0f4a1',
      description: 'Report ID',
    }),
    title: z.string().openapi({
      example: 'Jl. Sudirman, Menteng, Jakarta Pusat',
      description: 'Report title (street and location)',
    }),
    shareCount: z.number().openapi({
      example: 45,
      description: 'Total share count for this report',
    }),
    isHighEngagement: z.boolean().openapi({
      example: true,
      description: 'Whether this report has high engagement (10+ shares)',
    }),
  })
);

// Error Response Schema
export const SharingErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().openapi({ example: 'VALIDATION_ERROR' }),
    message: z.string().openapi({ example: 'Invalid request data' }),
    details: z.any().optional(),
    timestamp: z
      .string()
      .datetime()
      .openapi({ example: '2024-01-15T10:30:00Z' }),
  }),
});
