/**
 * Administrative Data Sync Service
 * 
 * Populates Indonesian administrative data (provinces, regencies, districts)
 * from external API: https://api-idnarea.fityan.tech
 * 
 * Follows clean architecture patterns and handles batch processing for large datasets.
 */

import { db } from '../db/connection';

// External API interfaces (matching api-idnarea.fityan.tech)
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

interface ApiProvince {
  code: string;
  name: string;
}

interface ApiRegency {
  code: string;
  name: string;
  provinceCode: string;
}

interface ApiDistrict {
  code: string;
  name: string;
  regencyCode: string;
}

// Database entities for insertion
interface DbProvince {
  code: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

interface DbRegency {
  code: string;
  name: string;
  province_code: string;
  created_at: Date;
  updated_at: Date;
}

interface DbDistrict {
  code: string;
  name: string;
  regency_code: string;
  created_at: Date;
  updated_at: Date;
}

interface SyncStats {
  provinces: { total: number; inserted: number; updated: number; errors: number };
  regencies: { total: number; inserted: number; updated: number; errors: number };
  districts: { total: number; inserted: number; updated: number; errors: number };
  duration: number;
}

export class AdminSyncService {
  private readonly baseUrl = 'https://api-idnarea.fityan.tech';
  private readonly batchSize = 100;
  private readonly requestDelay = 100; // 100ms delay between requests to be respectful

  /**
   * Sync all administrative data from external API
   */
  async syncAllAdministrativeData(): Promise<SyncStats> {
    const startTime = Date.now();
    console.log('🚀 Starting administrative data sync...');
    
    const stats: SyncStats = {
      provinces: { total: 0, inserted: 0, updated: 0, errors: 0 },
      regencies: { total: 0, inserted: 0, updated: 0, errors: 0 },
      districts: { total: 0, inserted: 0, updated: 0, errors: 0 },
      duration: 0,
    };

    try {
      // Sync in order: provinces → regencies → districts (due to foreign key dependencies)
      await this.syncProvinces(stats);
      await this.syncRegencies(stats);
      await this.syncDistricts(stats);
      
      stats.duration = Date.now() - startTime;
      console.log('✅ Administrative data sync completed successfully');
      console.log('📊 Sync Statistics:', stats);
      
      return stats;
    } catch (error) {
      stats.duration = Date.now() - startTime;
      console.error('❌ Administrative data sync failed:', error);
      throw error;
    }
  }

  /**
   * Sync provinces data from external API
   */
  private async syncProvinces(stats: SyncStats): Promise<void> {
    console.log('📍 Syncing provinces...');
    
    try {
      const allProvinces: ApiProvince[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      // Fetch all pages of provinces
      while (hasMorePages) {
        const response = await this.fetchFromApi<ApiProvince>(`/provinces?page=${currentPage}&limit=50`);
        
        allProvinces.push(...response.data);
        stats.provinces.total = response.meta.pagination.total;
        
        hasMorePages = response.meta.pagination.pages.next !== null;
        currentPage++;
        
        if (hasMorePages) {
          await this.delay(this.requestDelay);
        }
      }

      console.log(`📥 Fetched ${allProvinces.length} provinces from API`);

      // Process provinces in batches
      await this.processProvincesInBatches(allProvinces, stats);
      
      console.log(`✅ Provinces sync completed: ${stats.provinces.inserted} inserted, ${stats.provinces.updated} updated`);
    } catch (error) {
      console.error('❌ Error syncing provinces:', error);
      throw error;
    }
  }

  /**
   * Sync regencies data from external API
   */
  private async syncRegencies(stats: SyncStats): Promise<void> {
    console.log('🏘️ Syncing regencies...');
    
    try {
      const allRegencies: ApiRegency[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      // Fetch all pages of regencies
      while (hasMorePages) {
        const response = await this.fetchFromApi<ApiRegency>(`/regencies?page=${currentPage}&limit=100`);
        
        allRegencies.push(...response.data);
        stats.regencies.total = response.meta.pagination.total;
        
        hasMorePages = response.meta.pagination.pages.next !== null;
        currentPage++;
        
        if (hasMorePages) {
          await this.delay(this.requestDelay);
        }
      }

      console.log(`📥 Fetched ${allRegencies.length} regencies from API`);

      // Process regencies in batches
      await this.processRegenciesInBatches(allRegencies, stats);
      
      console.log(`✅ Regencies sync completed: ${stats.regencies.inserted} inserted, ${stats.regencies.updated} updated`);
    } catch (error) {
      console.error('❌ Error syncing regencies:', error);
      throw error;
    }
  }

  /**
   * Sync districts data from external API
   */
  private async syncDistricts(stats: SyncStats): Promise<void> {
    console.log('🏪 Syncing districts...');
    
    try {
      const allDistricts: ApiDistrict[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      // Fetch all pages of districts (this will be the largest dataset ~7000+ records)
      while (hasMorePages) {
        const response = await this.fetchFromApi<ApiDistrict>(`/districts?page=${currentPage}&limit=200`);
        
        allDistricts.push(...response.data);
        stats.districts.total = response.meta.pagination.total;
        
        hasMorePages = response.meta.pagination.pages.next !== null;
        currentPage++;
        
        if (hasMorePages) {
          await this.delay(this.requestDelay);
        }
        
        // Progress indicator for large dataset
        if (currentPage % 10 === 0) {
          console.log(`📥 Fetched ${allDistricts.length} districts so far...`);
        }
      }

      console.log(`📥 Fetched ${allDistricts.length} districts from API`);

      // Process districts in batches
      await this.processDistrictsInBatches(allDistricts, stats);
      
      console.log(`✅ Districts sync completed: ${stats.districts.inserted} inserted, ${stats.districts.updated} updated`);
    } catch (error) {
      console.error('❌ Error syncing districts:', error);
      throw error;
    }
  }

  /**
   * Process provinces in batches for database operations
   */
  private async processProvincesInBatches(provinces: ApiProvince[], stats: SyncStats): Promise<void> {
    const batches = this.chunkArray(provinces, this.batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing province batch ${i + 1}/${batches.length} (${batch.length} items)`);
      
      try {
        await db.transaction().execute(async (trx) => {
          for (const province of batch) {
            try {
              const dbProvince: DbProvince = {
                code: province.code,
                name: province.name,
                created_at: new Date(),
                updated_at: new Date(),
              };

              // Upsert province (insert or update if exists)
              const result = await trx
                .insertInto('provinces')
                .values(dbProvince)
                .onConflict('code')
                .doUpdateSet({
                  name: province.name,
                  updated_at: new Date(),
                })
                .returning(['code'])
                .execute();

              if (result.length > 0) {
                // Check if this was an insert or update by checking if record existed
                const existingCount = await trx
                  .selectFrom('provinces')
                  .where('code', '=', province.code)
                  .where('created_at', '<', dbProvince.created_at)
                  .select(({ fn }) => fn.count<number>('code').as('count'))
                  .executeTakeFirst();

                if (existingCount?.count && existingCount.count > 0) {
                  stats.provinces.updated++;
                } else {
                  stats.provinces.inserted++;
                }
              }
            } catch (error) {
              console.error(`Error processing province ${province.code}:`, error);
              stats.provinces.errors++;
            }
          }
        });
      } catch (error) {
        console.error(`Error processing province batch ${i + 1}:`, error);
        stats.provinces.errors += batch.length;
      }
    }
  }

  /**
   * Process regencies in batches for database operations
   */
  private async processRegenciesInBatches(regencies: ApiRegency[], stats: SyncStats): Promise<void> {
    const batches = this.chunkArray(regencies, this.batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing regency batch ${i + 1}/${batches.length} (${batch.length} items)`);
      
      try {
        await db.transaction().execute(async (trx) => {
          for (const regency of batch) {
            try {
              const dbRegency: DbRegency = {
                code: regency.code,
                name: regency.name,
                province_code: regency.provinceCode,
                created_at: new Date(),
                updated_at: new Date(),
              };

              // Upsert regency (insert or update if exists)
              const result = await trx
                .insertInto('regencies')
                .values(dbRegency)
                .onConflict('code')
                .doUpdateSet({
                  name: regency.name,
                  province_code: regency.provinceCode,
                  updated_at: new Date(),
                })
                .returning(['code'])
                .execute();

              if (result.length > 0) {
                stats.regencies.inserted++;
              }
            } catch (error) {
              console.error(`Error processing regency ${regency.code}:`, error);
              stats.regencies.errors++;
            }
          }
        });
      } catch (error) {
        console.error(`Error processing regency batch ${i + 1}:`, error);
        stats.regencies.errors += batch.length;
      }
    }
  }

  /**
   * Process districts in batches for database operations
   */
  private async processDistrictsInBatches(districts: ApiDistrict[], stats: SyncStats): Promise<void> {
    const batches = this.chunkArray(districts, this.batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing district batch ${i + 1}/${batches.length} (${batch.length} items)`);
      
      try {
        await db.transaction().execute(async (trx) => {
          for (const district of batch) {
            try {
              const dbDistrict: DbDistrict = {
                code: district.code,
                name: district.name,
                regency_code: district.regencyCode,
                created_at: new Date(),
                updated_at: new Date(),
              };

              // Upsert district (insert or update if exists)
              const result = await trx
                .insertInto('districts')
                .values(dbDistrict)
                .onConflict('code')
                .doUpdateSet({
                  name: district.name,
                  regency_code: district.regencyCode,
                  updated_at: new Date(),
                })
                .returning(['code'])
                .execute();

              if (result.length > 0) {
                stats.districts.inserted++;
              }
            } catch (error) {
              console.error(`Error processing district ${district.code}:`, error);
              stats.districts.errors++;
            }
          }
        });
      } catch (error) {
        console.error(`Error processing district batch ${i + 1}:`, error);
        stats.districts.errors += batch.length;
      }
    }
  }

  /**
   * Fetch data from external API with error handling and retries
   */
  private async fetchFromApi<T>(endpoint: string, retries = 3): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🌐 Fetching: ${url} (attempt ${attempt}/${retries})`);
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Viralkan-AdminSync/1.0',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ApiResponse<T> = await response.json();
        
        if (data.statusCode !== 200) {
          throw new Error(`API Error: ${data.message}`);
        }

        return data;
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed for ${url}:`, error);
        
        if (attempt === retries) {
          throw new Error(`Failed to fetch ${url} after ${retries} attempts: ${error}`);
        }
        
        // Exponential backoff: wait longer between retries
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await this.delay(waitTime);
      }
    }

    throw new Error(`Unexpected error fetching ${url}`);
  }

  /**
   * Split array into chunks for batch processing
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Delay execution for the specified number of milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Quick method to sync only provinces (for testing)
   */
  async syncProvincesOnly(): Promise<void> {
    console.log('🚀 Starting provinces-only sync...');
    const stats: SyncStats = {
      provinces: { total: 0, inserted: 0, updated: 0, errors: 0 },
      regencies: { total: 0, inserted: 0, updated: 0, errors: 0 },
      districts: { total: 0, inserted: 0, updated: 0, errors: 0 },
      duration: 0,
    };
    
    await this.syncProvinces(stats);
    console.log('✅ Provinces-only sync completed');
  }

  /**
   * Get sync status and database counts
   */
  async getSyncStatus(): Promise<{
    provinces: number;
    regencies: number;
    districts: number;
    lastSync: Date | null;
  }> {
    const [provincesCount, regenciesCount, districtsCount] = await Promise.all([
      db.selectFrom('provinces').select(({ fn }) => fn.count<number>('code').as('count')).executeTakeFirst(),
      db.selectFrom('regencies').select(({ fn }) => fn.count<number>('code').as('count')).executeTakeFirst(),
      db.selectFrom('districts').select(({ fn }) => fn.count<number>('code').as('count')).executeTakeFirst(),
    ]);

    // Get the most recent update timestamp
    const lastSync = await db
      .selectFrom('provinces')
      .select('updated_at')
      .orderBy('updated_at', 'desc')
      .limit(1)
      .executeTakeFirst();

    return {
      provinces: provincesCount?.count ?? 0,
      regencies: regenciesCount?.count ?? 0,
      districts: districtsCount?.count ?? 0,
      lastSync: lastSync?.updated_at ?? null,
    };
  }
}

// Export singleton instance
export const adminSyncService = new AdminSyncService();