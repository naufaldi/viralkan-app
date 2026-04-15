import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { sql } from "./connection";

/**
 * Ensures the schema_migrations tracking table exists.
 * Idempotent — safe to call on every startup.
 */
const ensureMigrationsTable = async (): Promise<void> => {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
};

/**
 * Returns the set of migration filenames already recorded in schema_migrations.
 */
const getAppliedMigrations = async (): Promise<Set<string>> => {
  const rows = await sql<{ filename: string }[]>`
    SELECT filename FROM schema_migrations ORDER BY filename ASC
  `;
  return new Set(rows.map((r) => r.filename));
};

/**
 * Reads .sql files from migrationsDir, applies only unapplied ones in numeric order.
 * Each file is executed via sql.unsafe (needed for multi-statement DDL).
 * Records each applied filename in schema_migrations for idempotency.
 * Stops and throws on the first failure — later files are not attempted.
 */
export const runSqlFileMigrations = async (
  migrationsDir: string,
): Promise<void> => {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const allFiles = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort((a, b) => {
      const numA = parseInt(a.split("_")[0] ?? "0");
      const numB = parseInt(b.split("_")[0] ?? "0");
      return numA - numB;
    });

  const pending = allFiles.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log("✅ No pending SQL file migrations.");
    return;
  }

  console.log(`📋 Applying ${pending.length} pending migration(s)...`);

  for (const filename of pending) {
    const filePath = join(migrationsDir, filename);
    const sqlContent = readFileSync(filePath, "utf-8");

    console.log(`  ⏳ Applying: ${filename}`);

    try {
      await sql.unsafe(sqlContent);
      await sql`
        INSERT INTO schema_migrations (filename) VALUES (${filename})
      `;
      console.log(`  ✅ Applied: ${filename}`);
    } catch (error) {
      console.error(`  ❌ Failed: ${filename}`, error);
      throw error;
    }
  }

  console.log("✅ All SQL file migrations applied.");
};
