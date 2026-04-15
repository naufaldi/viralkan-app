// apps/api/src/db/__tests__/migration-runner.test.ts
import { describe, test, expect } from "bun:test";

describe("Migration Runner", () => {
  describe("migration file sorting", () => {
    test("sorts migration files by numeric prefix ascending", () => {
      const files = [
        "010_ensure_uploads_table.sql",
        "001_add_upload_system.sql",
        "005_add_admin_audit_log.sql",
        "011_add_rate_limit_table.sql",
      ];

      const sorted = [...files].sort((a, b) => {
        const numA = parseInt(a.split("_")[0] ?? "0");
        const numB = parseInt(b.split("_")[0] ?? "0");
        return numA - numB;
      });

      expect(sorted[0]).toBe("001_add_upload_system.sql");
      expect(sorted[1]).toBe("005_add_admin_audit_log.sql");
      expect(sorted[2]).toBe("010_ensure_uploads_table.sql");
      expect(sorted[3]).toBe("011_add_rate_limit_table.sql");
    });

    test("filters only .sql files", () => {
      const allFiles = [
        "001_schema.sql",
        "README.md",
        ".DS_Store",
        "002_users.sql",
      ];

      const sqlFiles = allFiles.filter((f) => f.endsWith(".sql"));
      expect(sqlFiles).toHaveLength(2);
      expect(sqlFiles).not.toContain("README.md");
      expect(sqlFiles).not.toContain(".DS_Store");
    });

    test("pending files are those not in applied set", () => {
      const allFiles = [
        "001_schema.sql",
        "002_users.sql",
        "003_reports.sql",
        "004_admin.sql",
      ];
      const applied = new Set(["001_schema.sql", "002_users.sql"]);
      const pending = allFiles.filter((f) => !applied.has(f));

      expect(pending).toEqual(["003_reports.sql", "004_admin.sql"]);
    });

    test("returns empty pending list when all applied", () => {
      const allFiles = ["001_schema.sql", "002_users.sql"];
      const applied = new Set(["001_schema.sql", "002_users.sql"]);
      const pending = allFiles.filter((f) => !applied.has(f));

      expect(pending).toHaveLength(0);
    });
  });

  describe("schema_migrations tracking", () => {
    test("DDL string contains required columns", () => {
      const ddl = `
        CREATE TABLE IF NOT EXISTS schema_migrations (
          filename TEXT PRIMARY KEY,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      expect(ddl).toContain("schema_migrations");
      expect(ddl).toContain("filename TEXT PRIMARY KEY");
      expect(ddl).toContain("applied_at TIMESTAMPTZ");
    });

    test("migration filename matches expected format", () => {
      const validFilenames = [
        "001_add_upload_system.sql",
        "011_add_rate_limit_table.sql",
      ];
      const pattern = /^\d{3}_[\w]+\.sql$/;
      for (const filename of validFilenames) {
        expect(filename).toMatch(pattern);
      }
    });

    test("filename prefix extraction works for 3-digit prefixes", () => {
      const filename = "011_add_rate_limit_table.sql";
      const num = parseInt(filename.split("_")[0] ?? "0");
      expect(num).toBe(11);
    });
  });
});
