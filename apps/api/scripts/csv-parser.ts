import { parse } from "csv-parse";
import { readFile } from "fs/promises";
import { join } from "path";

// TypeScript interfaces for CSV row data
export interface ProvinceCSVRow {
  code: string;
  name: string;
}

export interface RegencyCSVRow {
  code: string;
  province_code: string;
  name: string;
}

export interface DistrictCSVRow {
  code: string;
  regency_code: string;
  name: string;
}

export class CsvParserService {
  private readonly csvDirectory = join(
    process.cwd(),
    "..",
    "..",
    "docs",
    "admin-id",
  );

  /**
   * Parse provinces CSV file
   */
  async parseProvincesCSV(): Promise<ProvinceCSVRow[]> {
    const filePath = join(this.csvDirectory, "provinces.csv");
    return this.parseCSV<ProvinceCSVRow>(filePath);
  }

  /**
   * Parse regencies CSV file
   */
  async parseRegenciesCSV(): Promise<RegencyCSVRow[]> {
    const filePath = join(this.csvDirectory, "regencies.csv");
    return this.parseCSV<RegencyCSVRow>(filePath);
  }

  /**
   * Parse districts CSV file
   */
  async parseDistrictsCSV(): Promise<DistrictCSVRow[]> {
    const filePath = join(this.csvDirectory, "districts.csv");
    return this.parseCSV<DistrictCSVRow>(filePath);
  }

  /**
   * Generic CSV parsing function
   */
  private async parseCSV<T>(filePath: string): Promise<T[]> {
    try {
      const fileContent = await readFile(filePath, "utf-8");

      return new Promise((resolve, reject) => {
        const records: T[] = [];

        parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        })
          .on("data", (record) => {
            // Remove dots from codes to match database format (e.g., 11.01 -> 1101)
            if (record.code) {
              record.code = record.code.replace(/\./g, "");
            }
            if (record.province_code) {
              record.province_code = record.province_code.replace(/\./g, "");
            }
            if (record.regency_code) {
              record.regency_code = record.regency_code.replace(/\./g, "");
            }
            records.push(record);
          })
          .on("error", (error) => {
            reject(
              new Error(`CSV parsing error in ${filePath}: ${error.message}`),
            );
          })
          .on("end", () => {
            resolve(records);
          });
      });
    } catch (error) {
      throw new Error(
        `Failed to read CSV file ${filePath}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
