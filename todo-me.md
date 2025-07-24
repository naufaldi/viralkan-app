# TODO: Fix UUID Validation Error in `/api/reports/me` Endpoint

## Current Error
```
{
    "success": false,
    "error": {
        "name": "ZodError",
        "message": "[\n  {\n    \"origin\": \"string\",\n    \"code\": \"invalid_format\",\n    \"format\": \"regex\",\n    \"pattern\": \"/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i\",\n    \"path\": [\n      \"id\"\n    ],\n    \"message\": \"Invalid UUID format\"\n  }\n]"
    }
}
```

## Error Analysis

### What the Error Means
- **ZodError**: Schema validation is failing
- **Invalid UUID format**: An "id" field doesn't match the UUID regex pattern
- **Path: ["id"]**: The error is in the "id" field of some object

### Possible Causes

#### 1. **Authentication Failure (Most Likely)**
- JWT token is expired/invalid
- When auth fails, error response might have an "id" field that's not a UUID
- The error response is being validated against the success schema

#### 2. **Request Validation Issue**
- Query parameters might contain an "id" field that's not a UUID
- URL parameters might be malformed

#### 3. **Response Data Transformation**
- Database returns valid UUIDs, but transformation layer corrupts them
- Some middleware is modifying the response data

#### 4. **Schema Mismatch**
- Response schema expects UUID but gets different format
- Database schema vs API schema mismatch

## Debugging Steps

### Step 1: Check Authentication
```bash
# Test with a fresh JWT token
curl 'http://localhost:3000/api/reports/me?limit=6' \
  -H 'Authorization: Bearer FRESH_JWT_TOKEN_HERE'
```

### Step 2: Check Request Validation
```bash
# Test with minimal query parameters
curl 'http://localhost:3000/api/reports/me' \
  -H 'Authorization: Bearer VALID_TOKEN'
```

### Step 3: Add Debug Logging
Add console.log statements in the route handler to see:
- What userId is extracted from JWT
- What queryData is received
- What result is returned from shell.getUserReports

### Step 4: Check Authentication Middleware
The error might be happening in `firebaseAuthMiddleware` before reaching the route handler.

### Step 5: Test Without Authentication
Create a test endpoint that bypasses authentication to isolate the issue.

## Potential Solutions

### Solution 1: Fix JWT Token (Most Likely)
- Get a fresh JWT token from Firebase
- Ensure token is not expired
- Verify token signature

### Solution 2: Improve Error Handling
- Add better error handling in authentication middleware
- Ensure error responses don't trigger schema validation
- Add try-catch blocks around validation

### Solution 3: Debug Authentication Flow
- Add logging to `firebaseAuthMiddleware`
- Check if user_id is being extracted correctly
- Verify the user exists in database

### Solution 4: Schema Validation Fix
- Make UUID validation more lenient for error cases
- Add conditional validation based on response type
- Separate error response schema from success response schema

## Testing Strategy

### Test 1: Valid Token
```bash
# Get fresh token and test
curl 'http://localhost:3000/api/reports/me?limit=6' \
  -H 'Authorization: Bearer FRESH_TOKEN'
```

### Test 2: Invalid Token
```bash
# Test with expired/invalid token
curl 'http://localhost:3000/api/reports/me?limit=6' \
  -H 'Authorization: Bearer INVALID_TOKEN'
```

### Test 3: No Token
```bash
# Test without authorization header
curl 'http://localhost:3000/api/reports/me?limit=6'
```

### Test 4: Database Direct Query
```bash
# Test database query directly
bun run src/db/debug-data.ts
```

## Current Status
- ✅ Database schema is correct
- ✅ Data layer returns valid UUIDs
- ✅ Response schema matches database structure
- ❌ OpenAPI response validation issue causing UUID error
- ❌ TypeScript linter error in route handler (minor)

## Updated Analysis (Latest Findings)

### Root Cause Identified
The error is happening during **OpenAPI response validation**, not authentication. The debug logs don't appear, which means the error occurs before the route handler executes.

### Key Evidence
1. **Authentication works** - you can access `/dashboard` successfully
2. **Database returns valid UUIDs** - confirmed by our test endpoint
3. **Error happens before route handler** - debug logs don't appear
4. **Error specifically mentions "id" field** - suggests response validation issue

### Most Likely Scenarios
1. **Data transformation issue** - UUIDs are being corrupted somewhere in the response pipeline
2. **Schema mismatch** - Response data structure doesn't match `PaginatedReportsResponseSchema`
3. **OpenAPI validation bug** - Framework is incorrectly validating the response

## Next Steps
1. **Test with fresh JWT token** from Firebase authentication
2. **Debug OpenAPI response validation** - the error happens during response schema validation
3. **Check if data transformation** is corrupting UUIDs before response
4. **Review the actual response data** structure vs schema expectations
5. **Fix TypeScript linter error** in route handler

## Files to Check
- `apps/api/src/routes/reports/api.ts` - Route handler
- `apps/api/src/routes/auth/middleware.ts` - Authentication middleware
- `apps/api/src/routes/reports/shell.ts` - Business logic
- `apps/api/src/routes/reports/data.ts` - Database queries
- `apps/api/src/schema/reports.ts` - Schema definitions 