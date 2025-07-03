# Firebase Authentication Testing Guide

## Setup Instructions

### 1. Firebase Service Account Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project or create a new one
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate new private key**
5. Download the JSON file
6. Copy the entire JSON content to your `.env.local` file as `FIREBASE_SERVICE_ACCOUNT_JSON` (ensure it's on one line)

### 2. Environment Configuration

Create `apps/api/.env.local` with **REQUIRED** variables:

```bash
# REQUIRED - Database connection
DATABASE_URL=postgres://postgres:password@localhost:5432/viralkan-app

# REQUIRED - Firebase service account (get from Firebase Console)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project-id",...}

# REQUIRED - Strong JWT secret
JWT_SECRET=your-strong-random-secret-here

# OPTIONAL - Server configuration (has defaults)
PORT=3000
NODE_ENV=development
```

⚠️ **Security Note**: All sensitive credentials are now required - no fallback values for production security!

### 3. Database Setup

```bash
# Start PostgreSQL and create database
createdb viralkan-app

# Run migrations
bun run db:migrate
```

## Testing the API

### 1. Start the Server

```bash
cd apps/api
bun run dev
```

### 2. Get Firebase ID Token

From your frontend application or Firebase Auth client:

```javascript
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

const auth = getAuth()
const provider = new GoogleAuthProvider()

signInWithPopup(auth, provider).then(async (result) => {
  const idToken = await result.user.getIdToken()
  console.log('ID Token:', idToken)
  // Use this token for API calls
})
```

### 3. Test Authentication Endpoints

#### Health Check
```bash
curl http://localhost:3000/api/auth/health
```

#### Verify Authentication
```bash
curl -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
     http://localhost:3000/api/auth/verify
```

### 4. Test Report Creation

```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -d '{
    "image_url": "https://example.com/pothole.jpg",
    "category": "berlubang",
    "street_name": "Jalan Sudirman",
    "location_text": "Depan mall senayan city",
    "lat": -6.200000,
    "lon": 106.816666
  }'
```

### 5. Verify Database Records

```bash
# Connect to database
PGPASSWORD=password psql -h localhost -U postgres -d viralkan-app

# Check users table
SELECT * FROM users;

# Check reports table
SELECT r.*, u.email, u.name 
FROM reports r 
JOIN users u ON r.user_id = u.id;
```

## Expected Responses

### Successful Authentication
```json
{
  "message": "Authentication verified",
  "user_id": 1
}
```

### Successful Report Creation
```json
{
  "id": 1
}
```

### Authentication Errors
```json
{
  "error": "Missing or invalid Authorization header"
}
```

## Database Schema Verification

The middleware will automatically:

1. **Verify Firebase ID token**
2. **Extract user data** (firebase_uid, email, name)
3. **Upsert user record** with conflict resolution on firebase_uid
4. **Store user_id** in request context
5. **Insert report** with authenticated user_id

## Troubleshooting

### Common Issues

1. **Firebase Service Account Error**
   - Ensure JSON is properly escaped and on one line
   - Verify the service account has proper permissions

2. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL is correct

3. **Token Verification Failed**
   - Ensure token is fresh (Firebase tokens expire)
   - Check Firebase project configuration

### Debug Logs

Enable detailed logging in development:
```bash
DEBUG=* bun run dev
``` 