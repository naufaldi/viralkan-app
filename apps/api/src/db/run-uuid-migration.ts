import { sql, testConnection } from "./connection";

const runUuidMigration = async () => {
  console.log("🔄 Running UUID migration...");

  try {
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error("❌ Cannot connect to database");
      process.exit(1);
    }

    console.log("📋 Applying UUID migration...");
    
    // Step 1: Check if UUID migration is already applied
    const checkUsers = await sql`SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'`;
    const checkReports = await sql`SELECT data_type FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'id'`;
    
    const usersIdType = checkUsers[0]?.data_type;
    const reportsIdType = checkReports[0]?.data_type;
    
    console.log(`Current users.id type: ${usersIdType}`);
    console.log(`Current reports.id type: ${reportsIdType}`);
    
    if (usersIdType === 'uuid' && reportsIdType === 'uuid') {
      console.log("✅ UUID migration already applied");
      return;
    }

    // Step 2: Add UUID columns if they don't exist
    console.log("Adding UUID columns...");
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS uuid_id UUID DEFAULT gen_random_uuid()`;
    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS uuid_id UUID DEFAULT gen_random_uuid()`;
    await sql`ALTER TABLE reports ADD COLUMN IF NOT EXISTS uuid_user_id UUID`;

    // Step 3: Populate UUID columns for existing records
    console.log("Populating UUID columns...");
    await sql`UPDATE users SET uuid_id = gen_random_uuid() WHERE uuid_id IS NULL`;
    await sql`UPDATE reports SET uuid_id = gen_random_uuid() WHERE uuid_id IS NULL`;

    // Step 4: Update foreign key relationships
    console.log("Updating foreign key relationships...");
    await sql`
      UPDATE reports r 
      SET uuid_user_id = u.uuid_id 
      FROM users u 
      WHERE r.user_id = u.id AND r.uuid_user_id IS NULL
    `;

    // Step 5: Drop old constraints and columns
    console.log("Dropping old constraints and columns...");
    await sql`ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_user_id_fkey`;
    await sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey`;
    await sql`ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_pkey`;

    // Step 6: Drop old columns
    await sql`ALTER TABLE users DROP COLUMN IF EXISTS id`;
    await sql`ALTER TABLE reports DROP COLUMN IF EXISTS id`;
    await sql`ALTER TABLE reports DROP COLUMN IF EXISTS user_id`;

    // Step 7: Rename UUID columns
    console.log("Renaming UUID columns...");
    await sql`ALTER TABLE users RENAME COLUMN uuid_id TO id`;
    await sql`ALTER TABLE reports RENAME COLUMN uuid_id TO id`;
    await sql`ALTER TABLE reports RENAME COLUMN uuid_user_id TO user_id`;

    // Step 8: Add constraints
    console.log("Adding constraints...");
    await sql`ALTER TABLE users ALTER COLUMN id SET NOT NULL`;
    await sql`ALTER TABLE reports ALTER COLUMN id SET NOT NULL`;
    await sql`ALTER TABLE reports ALTER COLUMN user_id SET NOT NULL`;
    await sql`ALTER TABLE users ADD PRIMARY KEY (id)`;
    await sql`ALTER TABLE reports ADD PRIMARY KEY (id)`;
    await sql`ALTER TABLE reports ADD CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`;

    // Step 9: Recreate indexes
    console.log("Recreating indexes...");
    await sql`CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS reports_user_idx ON reports(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS users_firebase_uid_idx ON users(firebase_uid)`;
    await sql`CREATE INDEX IF NOT EXISTS users_email_idx ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS users_provider_idx ON users(provider)`;
    await sql`CREATE INDEX IF NOT EXISTS reports_category_idx ON reports(category)`;

    console.log("✅ UUID migration completed successfully");

  } catch (error) {
    console.error("❌ UUID migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
};

// Run migration if this file is executed directly
if (import.meta.main) {
  runUuidMigration();
}

export { runUuidMigration }; 