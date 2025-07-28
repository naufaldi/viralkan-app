#!/usr/bin/env bun

/**
 * Retry Failed Districts Script
 *
 * Specifically retries fetching districts for regencies that failed due to rate limiting.
 * Only targets the specific regency codes that failed.
 *
 * Usage: bun run scripts/retry-failed-districts.ts
 */

import { sql } from "../src/db/connection";

// Failed regency codes from your error message
const FAILED_REGENCY_CODES = ["1204", "1401", "1507", "1508", "1709", "1771"];

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
  meta: {
    total: number;
    pagination: {
      total: number;
      pages: {
        first: number;
        last: number;
        current: number;
        previous: number | null;
        next: number | null;
      };
    };
  };
}

interface ApiDistrict {
  code: string;
  name: string;
  regencyCode: string;
}

class DistrictRetryService {
  private readonly baseUrl = "https://api-idnarea.fityan.tech";
  private readonly requestDelay = 5000; // 5 seconds between requests
  private readonly maxRetries = 5; // More retries for failed ones
  private readonly retryDelay = 15000; // 15 seconds on rate limit

  /**
   * Retry fetching districts for specific failed regency codes
   */
  async retryFailedDistricts(regencyCodes: string[]): Promise<void> {
    console.log(
      `🔄 Retrying districts for ${regencyCodes.length} failed regencies...`,
    );
    console.log(`📝 Regency codes: ${regencyCodes.join(", ")}`);
    console.log(
      `⏳ This will take ~${Math.ceil((regencyCodes.length * 5) / 60)} minutes with delays\n`,
    );

    let successCount = 0;
    let errorCount = 0;
    let totalDistricts = 0;

    for (let i = 0; i < regencyCodes.length; i++) {
      const regencyCode = regencyCodes[i];
      console.log(
        `[${i + 1}/${regencyCodes.length}] Retrying districts for regency ${regencyCode}...`,
      );

      try {
        // Check if regency exists in our database
        const regencyInfo = await sql`
          SELECT code, name FROM regencies WHERE code = ${regencyCode} LIMIT 1
        `;

        if (regencyInfo.length === 0) {
          console.log(
            `  ⚠️ Regency ${regencyCode} not found in database, skipping...`,
          );
          continue;
        }

        console.log(`  📍 Regency: ${regencyInfo[0].name}`);

        // Fetch districts for this regency
        const districts = await this.fetchDistrictsWithRetry(regencyCode);

        if (districts.length === 0) {
          console.log(`  ⚠️ No districts found for regency ${regencyCode}`);
          continue;
        }

        // Save districts to database
        let insertedCount = 0;
        let updatedCount = 0;

        for (const district of districts) {
          try {
            const result = await sql`
              INSERT INTO districts (code, name, regency_code, created_at, updated_at)
              VALUES (${district.code}, ${district.name}, ${district.regencyCode}, ${new Date()}, ${new Date()})
              ON CONFLICT (code) 
              DO UPDATE SET 
                name = ${district.name},
                regency_code = ${district.regencyCode},
                updated_at = ${new Date()}
              RETURNING code, (xmax = 0) AS was_inserted
            `;

            if (result.length > 0) {
              if (result[0].was_inserted) {
                insertedCount++;
              } else {
                updatedCount++;
              }
            }
          } catch (error) {
            console.error(
              `    ❌ Error saving district ${district.code}:`,
              error,
            );
          }
        }

        totalDistricts += districts.length;
        successCount++;

        console.log(
          `  ✅ Success: ${districts.length} districts (${insertedCount} new, ${updatedCount} updated)`,
        );

        // Delay before next regency (except for the last one)
        if (i < regencyCodes.length - 1) {
          console.log(
            `  ⏳ Waiting ${this.requestDelay}ms before next regency...\n`,
          );
          await this.delay(this.requestDelay);
        }
      } catch (error) {
        console.error(`  ❌ Failed to retry regency ${regencyCode}:`, error);
        errorCount++;
      }
    }

    console.log("\n📊 Retry Results:");
    console.log("================");
    console.log(`Regencies processed: ${regencyCodes.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    console.log(`Total districts added: ${totalDistricts}`);
  }

  /**
   * Fetch districts for a specific regency with retry logic
   */
  private async fetchDistrictsWithRetry(
    regencyCode: string,
  ): Promise<ApiDistrict[]> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(
          `    📡 Fetching districts (attempt ${attempt}/${this.maxRetries})`,
        );

        const response = await fetch(
          `${this.baseUrl}/districts?regencyCode=${regencyCode}`,
        );

        if (response.status === 429) {
          console.warn(
            `    ⚠️ Rate limited, waiting ${this.retryDelay}ms before retry...`,
          );
          if (attempt < this.maxRetries) {
            await this.delay(this.retryDelay);
            continue;
          }
          throw new Error(`Rate limited after ${this.maxRetries} attempts`);
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ApiResponse<ApiDistrict> = await response.json();
        console.log(
          `    ✅ Successfully fetched ${data.data.length} districts`,
        );
        return data.data;
      } catch (error) {
        if (attempt === this.maxRetries) {
          console.error(
            `    ❌ Failed after ${this.maxRetries} attempts:`,
            error,
          );
          throw error;
        }
        console.warn(
          `    ⚠️ Attempt ${attempt} failed, retrying in ${this.retryDelay}ms...`,
        );
        await this.delay(this.retryDelay);
      }
    }

    return [];
  }

  /**
   * Utility function to add delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

async function main() {
  console.log("🔄 Starting retry for failed district fetches...\n");

  try {
    const retryService = new DistrictRetryService();

    // Check current status
    console.log("📊 Current database status:");
    const [provincesResult, regenciesResult, districtsResult] =
      await Promise.all([
        sql`SELECT COUNT(*) as count FROM provinces`,
        sql`SELECT COUNT(*) as count FROM regencies`,
        sql`SELECT COUNT(*) as count FROM districts`,
      ]);

    console.log(`  Provinces: ${provincesResult[0].count}`);
    console.log(`  Regencies: ${regenciesResult[0].count}`);
    console.log(`  Districts: ${districtsResult[0].count}\n`);

    // Retry the failed regencies
    await retryService.retryFailedDistricts(FAILED_REGENCY_CODES);

    // Check final status
    console.log("\n📊 Final database status:");
    const [finalDistrictsResult] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM districts`,
    ]);

    console.log(`  Districts: ${finalDistrictsResult[0].count}`);

    console.log("\n✅ Retry completed!");
    console.log("\n💡 If you still get rate limited, you can:");
    console.log("  1. Wait longer and run this script again");
    console.log(
      "  2. Add more failed regency codes to FAILED_REGENCY_CODES array",
    );
    console.log("  3. Increase the delays in the script");
  } catch (error) {
    console.error("❌ Retry failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the script
main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
