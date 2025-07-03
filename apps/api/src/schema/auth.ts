import { z } from 'zod'
import 'zod-openapi/extend'

// Zod Schemas for Validation with OpenAPI metadata (specific to auth)
export const FirebaseTokenSchema = z.object({
  uid: z.string().min(1).openapi({
    example: 'firebase_uid_1234567890',
    description: 'Unique Firebase user identifier'
  }),
  email: z.string().email().openapi({
    example: 'user@example.com',
    description: 'User email address'
  }),
  name: z.string().optional().openapi({
    example: 'John Doe',
    description: 'User display name'
  }),
  picture: z.string().url().optional().openapi({
    example: 'https://example.com/avatar.jpg',
    description: 'User profile picture URL'
  }),
  email_verified: z.boolean().optional().openapi({
    example: true,
    description: 'Whether the email has been verified'
  })
}).openapi({
  ref: 'FirebaseToken',
  description: 'Firebase token payload data'
})

export const CreateUserSchema = z.object({
  firebase_uid: z.string().min(1).openapi({
    example: 'firebase_uid_1234567890',
    description: 'Firebase user unique identifier'
  }),
  email: z.string().email().openapi({
    example: 'user@example.com',
    description: 'User email address'
  }),
  name: z.string().min(1).openapi({
    example: 'John Doe',
    description: 'User full name'
  }),
  avatar_url: z.string().url().optional().openapi({
    example: 'https://example.com/avatar.jpg',
    description: 'URL to user profile picture'
  }),
  provider: z.enum(['google', 'facebook', 'email']).default('google').openapi({
    example: 'google',
    description: 'Authentication provider used'
  })
}).openapi({
  ref: 'CreateUserRequest',
  description: 'Data required to create a new user account'
})

export const UserResponseSchema = z.object({
  id: z.number().openapi({
    example: 123,
    description: 'Unique user ID in our system'
  }),
  firebase_uid: z.string().openapi({
    example: 'firebase_uid_1234567890',
    description: 'Firebase user unique identifier'
  }),
  email: z.string().openapi({
    example: 'user@example.com',
    description: 'User email address'
  }),
  name: z.string().openapi({
    example: 'John Doe',
    description: 'User full name'
  }),
  avatar_url: z.string().nullable().openapi({
    example: 'https://example.com/avatar.jpg',
    description: 'URL to user profile picture'
  }),
  provider: z.string().openapi({
    example: 'google',
    description: 'Authentication provider used'
  }),
  created_at: z.string().openapi({
    example: '2024-01-15T10:30:00Z',
    description: 'Account creation timestamp'
  })
}).openapi({
  ref: 'UserResponse',
  description: 'User account information'
})

export const AuthVerificationResponseSchema = z.object({
  message: z.string().openapi({
    example: 'Authentication successful',
    description: 'Success message'
  }),
  user_id: z.number().openapi({
    example: 123,
    description: 'Unique user ID in our system'
  }),
  user: UserResponseSchema
}).openapi({
  ref: 'AuthVerificationResponse',
  description: 'Successful authentication response'
})

export const LogoutResponseSchema = z.object({
  message: z.string().openapi({
    example: 'Logout successful',
    description: 'Success message'
  }),
  note: z.string().openapi({
    example: 'Please clear Firebase token on client side',
    description: 'Additional information about logout process'
  })
}).openapi({
  ref: 'LogoutResponse',
  description: 'Successful logout response'
})

export const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    example: 'Authentication failed',
    description: 'Error message'
  }),
  statusCode: z.number().openapi({
    example: 401,
    description: 'HTTP status code'
  }),
  timestamp: z.string().openapi({
    example: '2024-01-15T10:30:00Z',
    description: 'Error timestamp'
  })
}).openapi({
  ref: 'AuthErrorResponse',
  description: 'Authentication error response'
})

// Request schemas for API endpoints
export const TokenVerificationRequestSchema = z.object({
  token: z.string().min(1).openapi({
    example: 'eyJhbGciOiJSUzI1NiIs...',
    description: 'Firebase ID token to verify'
  })
}).openapi({
  ref: 'TokenVerificationRequest',
  description: 'Request body for token verification'
})

export const UserStatsResponseSchema = z.object({
  total_reports: z.number().openapi({
    example: 15,
    description: 'Total number of reports created by user'
  }),
  reports_by_category: z.object({
    berlubang: z.number().openapi({ example: 8 }),
    retak: z.number().openapi({ example: 5 }),
    lainnya: z.number().openapi({ example: 2 })
  }).openapi({
    description: 'Report count breakdown by category'
  }),
  last_report_date: z.string().nullable().openapi({
    example: '2024-01-15T10:30:00Z',
    description: 'Date of most recent report submission'
  }),
  account_age_days: z.number().openapi({
    example: 45,
    description: 'Number of days since account creation'
  })
}).openapi({
  ref: 'UserStatsResponse',
  description: 'User statistics and activity summary'
})