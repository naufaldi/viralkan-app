import { sql } from "../src/db/connection";
import type {
  ProvinceCSVRow,
  RegencyCSVRow,
  DistrictCSVRow,
} from "./csv-parser";

export interface ImportResult {
  total: number;
  inserted: number;
  updated: number;
  errors: number;
  errorDetails: ImportError[];
}

export interface ImportError {
  code: string;
  name: string;
  error: string;
}

export class DatabaseImporter {
  /**
   * Import provinces data into database
   */
  async importProvinces(data: ProvinceCSVRow[]): Promise<ImportResult> {
    const result: ImportResult = {
      total: data.length,
      inserted: 0,
      updated: 0,
      errors: 0,
      errorDetails: [],
    };

    for (const province of data) {
      try {
        const existingProvince = await sql`
          SELECT code FROM provinces WHERE code = ${province.code}
        `;

        if (existingProvince.length > 0) {
          // Update existing province
          await sql`
            UPDATE provinces 
            SET name = ${province.name}, updated_at = now()
            WHERE code = ${province.code}
          `;
          result.updated++;
        } else {
          // Insert new province
          await sql`
            INSERT INTO provinces (code, name, created_at, updated_at)
            VALUES (${province.code}, ${province.name}, now(), now())
          `;
          result.inserted++;
        }
      } catch (error) {
        result.errors++;
        result.errorDetails.push({
          code: province.code,
          name: province.name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return result;
  }

  /**
   * Import regencies data into database
   */
  async importRegencies(data: RegencyCSVRow[]): Promise<ImportResult> {
    const result: ImportResult = {
      total: data.length,
      inserted: 0,
      updated: 0,
      errors: 0,
      errorDetails: [],
    };

    for (const regency of data) {
      try {
        // Validate province exists
        const provinceExists = await sql`
          SELECT code FROM provinces WHERE code = ${regency.province_code}
        `;

        if (provinceExists.length === 0) {
          result.errors++;
          result.errorDetails.push({
            code: regency.code,
            name: regency.name,
            error: `Province ${regency.province_code} not found`,
          });
          continue;
        }

        const existingRegency = await sql`
          SELECT code FROM regencies WHERE code = ${regency.code}
        `;

        if (existingRegency.length > 0) {
          // Update existing regency
          await sql`
            UPDATE regencies 
            SET name = ${regency.name}, province_code = ${regency.province_code}, updated_at = now()
            WHERE code = ${regency.code}
          `;
          result.updated++;
        } else {
          // Insert new regency
          await sql`
            INSERT INTO regencies (code, name, province_code, created_at, updated_at)
            VALUES (${regency.code}, ${regency.name}, ${regency.province_code}, now(), now())
          `;
          result.inserted++;
        }
      } catch (error) {
        result.errors++;
        result.errorDetails.push({
          code: regency.code,
          name: regency.name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return result;
  }

  /**
   * Import districts data into database
   */
  async importDistricts(data: DistrictCSVRow[]): Promise<ImportResult> {
    const result: ImportResult = {
      total: data.length,
      inserted: 0,
      updated: 0,
      errors: 0,
      errorDetails: [],
    };

    for (const district of data) {
      try {
        // Validate regency exists
        const regencyExists = await sql`
          SELECT code FROM regencies WHERE code = ${district.regency_code}
        `;

        if (regencyExists.length === 0) {
          result.errors++;
          result.errorDetails.push({
            code: district.code,
            name: district.name,
            error: `Regency ${district.regency_code} not found`,
          });
          continue;
        }

        const existingDistrict = await sql`
          SELECT code FROM districts WHERE code = ${district.code}
        `;

        if (existingDistrict.length > 0) {
          // Update existing district
          await sql`
            UPDATE districts 
            SET name = ${district.name}, regency_code = ${district.regency_code}, updated_at = now()
            WHERE code = ${district.code}
          `;
          result.updated++;
        } else {
          // Insert new district
          await sql`
            INSERT INTO districts (code, name, regency_code, created_at, updated_at)
            VALUES (${district.code}, ${district.name}, ${district.regency_code}, now(), now())
          `;
          result.inserted++;
        }
      } catch (error) {
        result.errors++;
        result.errorDetails.push({
          code: district.code,
          name: district.name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return result;
  }
}
