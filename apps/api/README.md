# Viralkan API

Hono-based API server for the Viralkan road damage reporting platform.

## Setup

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Set up PostgreSQL with PostGIS**:

   ```bash
   # Using Docker
   docker run --name postgres-viralkan \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=viralkan \
     -p 5432:5432 \
     -d postgis/postgis:15
   ```

4. **Run database migrations**:

   ```bash
   bun run db:migrate
   ```

5. **Start development server**:
   ```bash
   bun run dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

- `GET /` - Health check
- `GET /api/reports` - List all reports (paginated)
- `GET /api/reports/:id` - Get specific report
- `POST /api/reports` - Create new report
- `GET /api/me/reports` - Get current user's reports
- `GET /api/me/profile` - Get current user profile
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/logout` - Logout

## Database Commands

- `bun run db:migrate` - Run database migrations
- `bun run db:reset` - Reset database (drops all tables and recreates)
- `bun run db:seed` - Seed database with sample data

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL + PostGIS
- **Validation**: Zod
- **Authentication**: Google OAuth + JWT
