import { CsvParserService } from './csv-parser';
import { DatabaseImporter, type ImportResult } from './csv-database-importer';
import { testConnection } from '../src/db/connection';

export interface EntityStats {
  total: number;
  inserted: number;
  updated: number;
  errors: number;
}

export interface SyncStats {
  provinces: EntityStats;
  regencies: EntityStats;
  districts: EntityStats;
  duration: number;
}

export class CsvAdminSyncService {
  private csvParser = new CsvParserService();
  private dbImporter = new DatabaseImporter();

  /**
   * Sync all administrative data from CSV files
   */
  async syncAllAdministrativeData(): Promise<SyncStats> {
    const startTime = Date.now();

    console.log('🚀 Starting CSV administrative data import...');

    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error(
        'Database connection failed. Cannot proceed with import.'
      );
    }

    const stats: SyncStats = {
      provinces: { total: 0, inserted: 0, updated: 0, errors: 0 },
      regencies: { total: 0, inserted: 0, updated: 0, errors: 0 },
      districts: { total: 0, inserted: 0, updated: 0, errors: 0 },
      duration: 0,
    };

    try {
      // Step 1: Import Provinces
      console.log('📍 Processing provinces...');
      const provincesData = await this.csvParser.parseProvincesCSV();
      const provincesResult =
        await this.dbImporter.importProvinces(provincesData);
      stats.provinces = this.mapImportResultToEntityStats(provincesResult);
      this.logImportResult('Provinces', provincesResult);

      // Step 2: Import Regencies
      console.log('🏛️  Processing regencies...');
      const regenciesData = await this.csvParser.parseRegenciesCSV();
      const regenciesResult =
        await this.dbImporter.importRegencies(regenciesData);
      stats.regencies = this.mapImportResultToEntityStats(regenciesResult);
      this.logImportResult('Regencies', regenciesResult);

      // Step 3: Import Districts
      console.log('🏘️  Processing districts...');
      const districtsData = await this.csvParser.parseDistrictsCSV();
      const districtsResult =
        await this.dbImporter.importDistricts(districtsData);
      stats.districts = this.mapImportResultToEntityStats(districtsResult);
      this.logImportResult('Districts', districtsResult);

      stats.duration = Date.now() - startTime;

      // Final summary
      this.logFinalSummary(stats);

      return stats;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        '❌ Import failed:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      console.log(`⏱️  Duration: ${duration}ms`);
      throw error;
    }
  }

  /**
   * Map ImportResult to EntityStats
   */
  private mapImportResultToEntityStats(result: ImportResult): EntityStats {
    return {
      total: result.total,
      inserted: result.inserted,
      updated: result.updated,
      errors: result.errors,
    };
  }

  /**
   * Log import result for a specific entity type
   */
  private logImportResult(entityType: string, result: ImportResult): void {
    console.log(`✅ ${entityType} processed:`);
    console.log(`   Total: ${result.total}`);
    console.log(`   Inserted: ${result.inserted}`);
    console.log(`   Updated: ${result.updated}`);
    console.log(`   Errors: ${result.errors}`);

    if (result.errors > 0 && result.errorDetails.length > 0) {
      console.log(`   Error details:`);
      result.errorDetails.forEach((error, index) => {
        console.log(
          `     ${index + 1}. ${error.code} (${error.name}): ${error.error}`
        );
      });
    }
    console.log('');
  }

  /**
   * Log final summary of the import process
   */
  private logFinalSummary(stats: SyncStats): void {
    const totalRecords =
      stats.provinces.total + stats.regencies.total + stats.districts.total;
    const totalInserted =
      stats.provinces.inserted +
      stats.regencies.inserted +
      stats.districts.inserted;
    const totalUpdated =
      stats.provinces.updated +
      stats.regencies.updated +
      stats.districts.updated;
    const totalErrors =
      stats.provinces.errors + stats.regencies.errors + stats.districts.errors;

    console.log('🎉 Import completed successfully!');
    console.log('📊 Final Statistics:');
    console.log(`   Total records processed: ${totalRecords}`);
    console.log(`   Total inserted: ${totalInserted}`);
    console.log(`   Total updated: ${totalUpdated}`);
    console.log(`   Total errors: ${totalErrors}`);
    console.log(
      `   Duration: ${stats.duration}ms (${(stats.duration / 1000).toFixed(2)}s)`
    );

    if (totalErrors === 0) {
      console.log('✨ All records processed successfully!');
    } else {
      console.log(
        `⚠️  ${totalErrors} records had errors. Check the logs above for details.`
      );
    }
  }
}
