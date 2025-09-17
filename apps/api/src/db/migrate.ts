import { sql, testConnection } from "./connection";
import { readFileSync } from "fs";
import { join } from "path";

const runMigrations = async () => {
  console.log("🔄 Running database migrations...");

  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error("❌ Cannot connect to database");
      process.exit(1);
    }

    // Ensure uploads metadata schema exists before other dependent steps run
    await ensureUploadsInfrastructure();

    // Run admin system migration
    console.log("📋 Applying admin system migration...");

    // Step 1: Add role field to users table
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))`;
    console.log("✅ Added role column to users table");

    // Step 2: Add verification fields to reports table
    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'deleted'))`;
    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ`;
    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id) ON DELETE SET NULL`;
    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS rejection_reason TEXT`;
    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`;
    console.log("✅ Added verification fields to reports table");

    // Step 3: Update existing reports to pending status if status is NULL
    await sql`UPDATE reports SET status = 'pending' WHERE status IS NULL`;
    console.log("✅ Updated existing reports to pending status");

    // Step 4: Create admin actions logging table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_actions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        action_type TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id UUID NOT NULL,
        details JSONB,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;
    console.log("✅ Created admin_actions table");

    // Step 5: Add indexes
    await sql`CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status)`;
    await sql`CREATE INDEX IF NOT EXISTS reports_verified_by_idx ON reports(verified_by)`;
    await sql`CREATE INDEX IF NOT EXISTS users_role_idx ON users(role)`;
    await sql`CREATE INDEX IF NOT EXISTS admin_actions_admin_user_idx ON admin_actions(admin_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS admin_actions_action_type_idx ON admin_actions(action_type)`;
    await sql`CREATE INDEX IF NOT EXISTS admin_actions_target_idx ON admin_actions(target_type, target_id)`;
    await sql`CREATE INDEX IF NOT EXISTS admin_actions_created_at_idx ON admin_actions(created_at DESC)`;
    console.log("✅ Added admin system indexes");

    // Step 6: Ensure English administrative columns exist and legacy data migrates
    console.log("📋 Ensuring English administrative columns exist...");

    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS district TEXT`;
    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS city TEXT`;
    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS province TEXT`;

    // Copy data from legacy Indonesian columns if they still exist
    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'reports' AND column_name = 'kecamatan'
        ) THEN
          EXECUTE 'UPDATE reports SET district = kecamatan WHERE (district IS NULL OR district = '''') AND kecamatan IS NOT NULL';
          EXECUTE 'ALTER TABLE reports DROP COLUMN IF EXISTS kecamatan';
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'reports' AND column_name = 'kota'
        ) THEN
          EXECUTE 'UPDATE reports SET city = kota WHERE (city IS NULL OR city = '''') AND kota IS NOT NULL';
          EXECUTE 'ALTER TABLE reports DROP COLUMN IF EXISTS kota';
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'reports' AND column_name = 'provinsi'
        ) THEN
          EXECUTE 'UPDATE reports SET province = provinsi WHERE (province IS NULL OR province = '''') AND provinsi IS NOT NULL';
          EXECUTE 'ALTER TABLE reports DROP COLUMN IF EXISTS provinsi';
        END IF;
      END
      $$;
    `;

    // Recreate indexes on the new English columns
    await sql`DROP INDEX IF EXISTS reports_kecamatan_idx`;
    await sql`DROP INDEX IF EXISTS reports_kota_idx`;
    await sql`DROP INDEX IF EXISTS reports_provinsi_idx`;
    await sql`DROP INDEX IF EXISTS reports_location_filter_idx`;
    await sql`DROP INDEX IF EXISTS reports_gis_status_idx`;

    await sql`CREATE INDEX IF NOT EXISTS reports_district_idx ON reports(district)`;
    await sql`CREATE INDEX IF NOT EXISTS reports_city_idx ON reports(city)`;
    await sql`CREATE INDEX IF NOT EXISTS reports_province_idx ON reports(province)`;
    await sql`CREATE INDEX IF NOT EXISTS reports_location_filter_idx ON reports(province, city, district)`;
    await sql`
      CREATE INDEX IF NOT EXISTS reports_gis_status_idx ON reports(status, province, city, district)
      WHERE status IN ('pending', 'verified')
    `;

    console.log("✅ English administrative columns ensured");

    // Step 7: Create administrative tables
    console.log("📋 Creating administrative tables...");

    // Provinces table (38 provinces)
    await sql`
      CREATE TABLE IF NOT EXISTS provinces (
        code VARCHAR(2) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    // Regencies table (500+ regencies/cities)
    await sql`
      CREATE TABLE IF NOT EXISTS regencies (
        code VARCHAR(4) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        province_code VARCHAR(2) NOT NULL REFERENCES provinces(code) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    // Districts table (7000+ districts)
    await sql`
      CREATE TABLE IF NOT EXISTS districts (
        code VARCHAR(6) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        regency_code VARCHAR(4) NOT NULL REFERENCES regencies(code) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    // Add code columns to reports table (nullable for backward compatibility)
    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS province_code VARCHAR(2) REFERENCES provinces(code)`;
    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS regency_code VARCHAR(4) REFERENCES regencies(code)`;
    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS district_code VARCHAR(6) REFERENCES districts(code)`;

    // Performance indexes for administrative hierarchy queries
    await sql`CREATE INDEX IF NOT EXISTS idx_regencies_province_code ON regencies(province_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_districts_regency_code ON districts(regency_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reports_province_code ON reports(province_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reports_regency_code ON reports(regency_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reports_district_code ON reports(district_code)`;

    // Name indexes for search performance
    await sql`CREATE INDEX IF NOT EXISTS idx_provinces_name ON provinces(name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_regencies_name ON regencies(name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_districts_name ON districts(name)`;

    // Partial indexes for non-null values in reports
    await sql`CREATE INDEX IF NOT EXISTS idx_reports_province_code_nn ON reports(province_code) WHERE province_code IS NOT NULL`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reports_regency_code_nn ON reports(regency_code) WHERE regency_code IS NOT NULL`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reports_district_code_nn ON reports(district_code) WHERE district_code IS NOT NULL`;

    // Composite index for administrative hierarchy filtering
    await sql`CREATE INDEX IF NOT EXISTS idx_reports_admin_hierarchy ON reports(province_code, regency_code, district_code) WHERE province_code IS NOT NULL`;

    console.log("✅ Created administrative tables and indexes");

    // Step 8: Add social media sharing functionality
    console.log("📋 Adding social media sharing functionality...");

    // Add share_count column to existing reports table
    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0`;
    console.log("✅ Added share_count column to reports table");

    // Create shares table for tracking individual share events
    await sql`
      CREATE TABLE IF NOT EXISTS shares (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
        platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'twitter', 'facebook', 'threads', 'telegram')),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        shared_at TIMESTAMPTZ DEFAULT now(),
        ip_address INET,
        user_agent TEXT
      )
    `;
    console.log("✅ Created shares table");

    // Performance indexes for share_count queries
    await sql`CREATE INDEX IF NOT EXISTS reports_share_count_idx ON reports(share_count DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS reports_status_share_count_idx ON reports(status, share_count DESC) WHERE status = 'verified'`;
    console.log("✅ Added share count indexes");

    // Analytics and performance indexes for shares table
    await sql`CREATE INDEX IF NOT EXISTS shares_report_id_idx ON shares(report_id)`;
    await sql`CREATE INDEX IF NOT EXISTS shares_platform_idx ON shares(platform)`;
    await sql`CREATE INDEX IF NOT EXISTS shares_shared_at_idx ON shares(shared_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS shares_user_id_idx ON shares(user_id) WHERE user_id IS NOT NULL`;
    await sql`CREATE INDEX IF NOT EXISTS shares_platform_time_idx ON shares(platform, shared_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS shares_report_platform_idx ON shares(report_id, platform)`;
    await sql`CREATE INDEX IF NOT EXISTS shares_ip_time_idx ON shares(ip_address, shared_at DESC) WHERE ip_address IS NOT NULL`;
    // Note: Removed recent shares index due to PostgreSQL IMMUTABLE function requirement
    // Can be added later with a different approach if needed for performance
    console.log("✅ Added shares table indexes");

    console.log("✅ Social media sharing functionality added successfully");

    console.log("✅ Database migrations completed successfully");

    // Create a test user if none exists
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;
    const userCount = Number(existingUsers[0]?.count || 0);

    if (userCount === 0) {
      await sql`
        INSERT INTO users (firebase_uid, email, name, avatar_url)
        VALUES ('test-google-id', 'test@viralkan.app', 'Test User', 'https://via.placeholder.com/150')
      `;
      console.log("👤 Created test user");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
};

// Run migrations if this file is executed directly
if (import.meta.main) {
  runMigrations();
}

export { runMigrations };

async function ensureUploadsInfrastructure() {
  console.log("📦 Ensuring uploads metadata tables exist...");

  // R2 uploads rely on reports.image_key for correlation
  await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS image_key TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS uploads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      image_key TEXT UNIQUE NOT NULL,
      image_url TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_type TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  // Align defaults in case the table pre-dates DEFAULT clauses
  await sql`ALTER TABLE uploads ALTER COLUMN id SET DEFAULT gen_random_uuid()`;

  // Add guard rails only if they aren't already present
  await sql.unsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'uploads_file_size_positive'
          AND table_name = 'uploads'
          AND table_schema = 'public'
      ) THEN
        ALTER TABLE uploads
          ADD CONSTRAINT uploads_file_size_positive CHECK (file_size > 0);
      END IF;
    END
    $$;
  `);

  await sql.unsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'uploads_file_type_valid'
          AND table_name = 'uploads'
          AND table_schema = 'public'
      ) THEN
        ALTER TABLE uploads
          ADD CONSTRAINT uploads_file_type_valid CHECK (
            file_type IN ('image/jpeg', 'image/png', 'image/webp')
          );
      END IF;
    END
    $$;
  `);

  // Recreate indexes with IF NOT EXISTS to keep calls idempotent
  await sql`CREATE INDEX IF NOT EXISTS uploads_user_id_idx ON uploads(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS uploads_image_key_idx ON uploads(image_key)`;
  await sql`CREATE INDEX IF NOT EXISTS uploads_created_at_idx ON uploads(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS reports_image_key_idx ON reports(image_key)`;

  console.log("✅ Uploads metadata schema verified");
}
