
# FIX: UUID Error in `/api/reports/me` Endpoint

## Problem Analysis
The error shows: `PostgresError: invalid input syntax for type uuid: "me"`

**Root Cause**: Route order issue - the `/me` route is being matched by the `/:id` route instead of the specific `/me` route.

**Evidence**:
- Error shows "Relaxed UUID Check for UUID:" with `value: "me"`, `length: 2`, `type: "string"`
- Database tries to convert "me" to UUID, which fails
- The string "me" from URL path is being passed as a report ID parameter

## Current Route Definitions
```typescript
// Line 480: getReportByIdRoute - path: "/:id"
// Line 684: getMyReportsRoute - path: "/me"
```

## Issue
In Hono/OpenAPI routing, the order of route registration matters. The `/:id` route is catching the `/me` request before it reaches the `/me` route.

## Solution Plan

### Step 1: Reorder Route Definitions
**File**: `apps/api/src/routes/reports/api.ts`

Move the `getMyReportsRoute` definition **before** the `getReportByIdRoute` definition.

**Current Order**:
```typescript
// 1. getReportByIdRoute (path: "/:id")
// 2. getMyReportsRoute (path: "/me") - This never gets reached
```

**Fixed Order**:
```typescript
// 1. getMyReportsRoute (path: "/me") - Specific route first
// 2. getReportByIdRoute (path: "/:id") - Generic route second
```

### Step 2: Verify Route Registration Order
Ensure the route handlers are registered in the same order:

**Current Order**:
```typescript
// Line 480: reportsRouter.openapi(getReportByIdRoute, ...)
// Line 684: reportsRouter.openapi(getMyReportsRoute, ...)
```

**Fixed Order**:
```typescript
// Move this BEFORE getReportByIdRoute
reportsRouter.openapi(getMyReportsRoute, async (c) => { ... });

// Then this
reportsRouter.openapi(getReportByIdRoute, async (c) => { ... });
```

### Step 3: Test the Fix
1. Test `/api/reports/me` endpoint
2. Verify it returns user's reports instead of UUID error
3. Test `/api/reports/{actual-uuid}` still works for specific reports

## Expected Result
- `/api/reports/me` should return user's reports with pagination
- `/api/reports/01890dd5-ea3f-7746-b3a5-e8c5e0b0f4a1` should return specific report
- No more UUID validation errors

## Files to Modify
- `apps/api/src/routes/reports/api.ts` - Reorder route definitions and registrations

## Testing
```bash
# Test /me endpoint
curl 'http://localhost:3000/api/reports/me?page=1&limit=20' \
  -H 'Authorization: Bearer VALID_TOKEN'

# Test specific report endpoint
curl 'http://localhost:3000/api/reports/01890dd5-ea3f-7746-b3a5-e8c5e0b0f4a1' \
  -H 'Authorization: Bearer VALID_TOKEN'
``` 