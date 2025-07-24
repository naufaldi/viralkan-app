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
