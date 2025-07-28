#!/usr/bin/env bun

/**
 * CSV Administrative Data Import Script
 *
 * Imports Indonesian administrative data (provinces, regencies, districts)
 * from CSV files in the docs/admin-id directory into the database.
 *
 * This replaces the external API-based sync with a reliable, fast,
 * local CSV import process.
 *
 * Usage: bun run scripts/import-csv-admin-data.ts
 */

import { CsvAdminSyncService } from "./csv-admin-sync";

async function main() {
  console.log("🇮🇩 CSV Administrative Data Import");
  console.log("=====================================");
  console.log("");

  const syncService = new CsvAdminSyncService();

  try {
    const stats = await syncService.syncAllAdministrativeData();

    // Exit with success code
    process.exit(0);
  } catch (error) {
    console.error("💥 Import failed with error:");
    console.error(error instanceof Error ? error.message : "Unknown error");
    console.log("");
    console.log("🔍 Troubleshooting tips:");
    console.log("1. Ensure DATABASE_URL environment variable is set");
    console.log("2. Check that CSV files exist in docs/admin-id directory:");
    console.log("   - Provinces (1).csv");
    console.log("   - Regencies Data.csv");
    console.log("   - Districts Data.csv");
    console.log("3. Verify database connection and permissions");
    console.log("4. Check that database tables exist (run migrations first)");

    // Exit with error code
    process.exit(1);
  }
}

// Handle process termination gracefully
process.on("SIGINT", () => {
  console.log("\n⚠️  Import interrupted by user");
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("\n⚠️  Import terminated");
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
