// DEV ONLY — database seed script for realistic development data
// Run: bun run db:seed --confirm

import "dotenv/config";
import { faker } from "@faker-js/faker";
import { sql } from "./connection";
import { generateUsers } from "./seed/users";
import { generateReports } from "./seed/reports";

// --- Guards ---

const nodeEnv = process.env.NODE_ENV;
if (nodeEnv === "production") {
  console.error('❌ Refusing to seed: NODE_ENV is "production".');
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL ?? "";
const prodPatterns = ["railway", "render", "neon", "supabase"];
for (const pattern of prodPatterns) {
  if (databaseUrl.includes(pattern)) {
    console.error(
      `❌ Refusing to seed: DATABASE_URL contains "${pattern}" (likely a production database).`,
    );
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const confirmed = args.includes("--confirm");
if (!confirmed) {
  console.log(
    "⚠️  This script will TRUNCATE users and admin_actions tables (reports CASCADE-delete).",
  );
  console.log("   Run with --confirm to proceed: bun run db:seed --confirm");
  process.exit(0);
}

// --- Main ---

const run = async (): Promise<void> => {
  const startTime = Date.now();

  console.log("🌱 Starting dev seed...");

  // Deterministic seed for reproducibility
  faker.seed(42);

  try {
    // DEV ONLY: truncate all data before seeding
    console.log("🗑️  Truncating existing data...");
    await sql`TRUNCATE users, admin_actions RESTART IDENTITY CASCADE`;

    // Generate users
    const usersData = generateUsers();
    console.log(`👥 Inserting ${usersData.length} users...`);

    await sql`
      INSERT INTO users ${sql(
        usersData,
        "firebase_uid",
        "email",
        "name",
        "avatar_url",
        "provider",
        "role",
        "created_at",
      )}
    `;

    // Fetch back inserted users to get their UUIDs
    // Admin is placed at index 0 so report distribution (Zipf) skips them correctly
    const insertedUsers = await sql<Array<{ id: string; role: string }>>`
      SELECT id, role FROM users
      ORDER BY (CASE WHEN role = 'admin' THEN 0 ELSE 1 END), created_at ASC
    `;

    const adminUser = insertedUsers[0];
    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Admin user not found at index 0 after insert");
    }

    const userIds = insertedUsers.map((u) => u.id);
    const adminId = adminUser.id;

    // Generate reports
    const reportsData = generateReports(userIds, adminId);
    console.log(`📋 Inserting ${reportsData.length} reports...`);

    // Insert in batches of 100 to avoid hitting postgres parameter limits
    const batchSize = 100;
    for (let i = 0; i < reportsData.length; i += batchSize) {
      const batch = reportsData.slice(i, i + batchSize);
      await sql`
        INSERT INTO reports ${sql(
          batch,
          "user_id",
          "image_url",
          "category",
          "street_name",
          "location_text",
          "lat",
          "lon",
          "status",
          "verified_at",
          "verified_by",
          "rejection_reason",
          "deleted_at",
          "created_at",
        )}
      `;
    }

    // --- Verification stats ---
    const [reportStats] = await sql<
      Array<{
        total: number;
        berlubang: number;
        retak: number;
        lainnya: number;
        verified: number;
        pending: number;
        rejected: number;
        deleted: number;
      }>
    >`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE category = 'berlubang')::int AS berlubang,
        COUNT(*) FILTER (WHERE category = 'retak')::int AS retak,
        COUNT(*) FILTER (WHERE category = 'lainnya')::int AS lainnya,
        COUNT(*) FILTER (WHERE status = 'verified')::int AS verified,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected,
        COUNT(*) FILTER (WHERE status = 'deleted')::int AS deleted
      FROM reports
    `;

    const [currentMonthRow] = await sql<Array<{ current_month: number }>>`
      SELECT COUNT(*)::int AS current_month
      FROM reports
      WHERE created_at >= date_trunc('month', NOW())
    `;

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

    if (!reportStats || !currentMonthRow) {
      throw new Error("Failed to fetch verification stats");
    }

    const total = reportStats.total;
    const pct = (n: number): string => ((n / total) * 100).toFixed(0);

    console.log("");
    console.log("✅ Dev seed completed");
    console.log(
      `   Users:   ${insertedUsers.length} (1 admin, ${insertedUsers.length - 1} regular)`,
    );
    console.log(`   Reports: ${total} total`);
    console.log(
      `            - berlubang: ${reportStats.berlubang} (${pct(reportStats.berlubang)}%)`,
    );
    console.log(
      `            - retak:     ${reportStats.retak} (${pct(reportStats.retak)}%)`,
    );
    console.log(
      `            - lainnya:   ${reportStats.lainnya} (${pct(reportStats.lainnya)}%)`,
    );
    console.log(`            - verified:  ${reportStats.verified}`);
    console.log(`            - pending:   ${reportStats.pending}`);
    console.log(`            - rejected:  ${reportStats.rejected}`);
    console.log(`            - deleted:   ${reportStats.deleted}`);
    console.log(`   Current month reports: ${currentMonthRow.current_month}`);
    console.log(`   Duration: ${durationSeconds}s`);
  } finally {
    await sql.end();
  }
};

run().catch((err: unknown) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
