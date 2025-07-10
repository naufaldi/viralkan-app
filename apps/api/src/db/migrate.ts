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

    // Read and execute schema
    const schemaPath = join(__dirname, "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");

    await sql.unsafe(schema);

    console.log("✅ Database migrations completed successfully");

    // Create a test user if none exists
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;
    const userCount = Number(existingUsers[0]?.count || 0);

    if (userCount === 0) {
      await sql`
        INSERT INTO users (google_id, email, name, avatar_url)
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
