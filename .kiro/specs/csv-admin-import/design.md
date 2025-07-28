# Design Document

## Overview

The CSV Administrative Data Import System replaces the external API-based sync with a local CSV file processing approach. The system reads Indonesian administrative data from three CSV files (`Provinces (1).csv`, `Regencies Data.csv`, `Districts Data.csv`) and imports them into the existing database schema while maintaining the same statistics and error handling interface.

## Architecture

### High-Level Architecture

```
CSV Files (docs/admin-id/) → CSV Parser → Data Validator → Database Importer → Statistics Reporter
```

### Component Flow

1. **CSV Reader**: Reads and parses CSV files from filesystem
2. **Data Validator**: Validates CSV structure and data integrity
3. **Database Importer**: Inserts/updates records with conflict resolution
4. **Statistics Tracker**: Maintains import statistics and error reporting
5. **Script Runner**: Provides command-line interface for import execution

## Components and Interfaces

### 1. CSV Parser Service

**Purpose**: Read and parse CSV files into structured data

```typescript
interface CsvParserService {
  parseProvincesCSV(filePath: string): Promise<ProvinceCSVRow[]>;
  parseRegenciesCSV(filePath: string): Promise<RegencyCSVRow[]>;
  parseDistrictsCSV(filePath: string): Promise<DistrictCSVRow[]>;
}

interface ProvinceCSVRow {
  code: string;
  name: string;
}

interface RegencyCSVRow {
  code: string;
  province_code: string;
  name: string;
}

interface DistrictCSVRow {
  code: string;
  regency_code: string;
  name: string;
}
```

**Implementation Details**:

- Uses Node.js `fs` module for file reading
- Uses `csv-parse` library for CSV parsing
- Handles UTF-8 encoding for Indonesian characters
- Validates CSV headers match expected format

### 2. Data Validator

**Purpose**: Validate CSV data structure and relationships

```typescript
interface DataValidator {
  validateProvinceData(
    data: ProvinceCSVRow[],
  ): ValidationResult<ProvinceCSVRow>;
  validateRegencyData(
    data: RegencyCSVRow[],
    provinces: ProvinceCSVRow[],
  ): ValidationResult<RegencyCSVRow>;
  validateDistrictData(
    data: DistrictCSVRow[],
    regencies: RegencyCSVRow[],
  ): ValidationResult<DistrictCSVRow>;
}

interface ValidationResult<T> {
  valid: T[];
  errors: ValidationError[];
}

interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}
```

**Validation Rules**:

- **Code Format**: Validate administrative codes follow Indonesian format
- **Name Validation**: Ensure names are non-empty and reasonable length
- **Relationship Validation**: Verify foreign key relationships exist
- **Duplicate Detection**: Check for duplicate codes within same entity type

### 3. Database Importer

**Purpose**: Import validated data into database with conflict resolution

```typescript
interface DatabaseImporter {
  importProvinces(data: ProvinceCSVRow[]): Promise<ImportResult>;
  importRegencies(data: RegencyCSVRow[]): Promise<ImportResult>;
  importDistricts(data: DistrictCSVRow[]): Promise<ImportResult>;
}

interface ImportResult {
  total: number;
  inserted: number;
  updated: number;
  errors: number;
  errorDetails: ImportError[];
}

interface ImportError {
  code: string;
  name: string;
  error: string;
}
```

**Database Operations**:

- Uses `ON CONFLICT (code) DO UPDATE` for upsert operations
- Maintains `created_at` and `updated_at` timestamps
- Preserves existing data relationships
- Handles database constraint violations gracefully

### 4. CSV Administrative Sync Service

**Purpose**: Orchestrate the complete import process

```typescript
interface CsvAdminSyncService {
  syncAllAdministrativeData(): Promise<SyncStats>;
  getSyncStatus(): Promise<SyncStatus>;
}

// Reuse existing SyncStats interface from admin-sync-improved.ts
interface SyncStats {
  provinces: EntityStats;
  regencies: EntityStats;
  districts: EntityStats;
  duration: number;
}

interface EntityStats {
  total: number;
  inserted: number;
  updated: number;
  errors: number;
}
```

## Data Models

### CSV File Structure

**Provinces (1).csv**:

```csv
code,name
11,ACEH
12,SUMATERA UTARA
```

**Regencies Data.csv**:

```csv
code,province_code,name
11.01,11,KABUPATEN ACEH SELATAN
11.02,11,KABUPATEN ACEH TENGGARA
```

**Districts Data.csv**:

```csv
code,regency_code,name
11.01.01,11.01,Bakongan
11.01.02,11.01,Kluet Utara
```

### Database Schema

The system uses the existing database schema:

```sql
-- Provinces table
CREATE TABLE provinces (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Regencies table
CREATE TABLE regencies (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  province_code TEXT NOT NULL REFERENCES provinces(code),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Districts table
CREATE TABLE districts (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  regency_code TEXT NOT NULL REFERENCES regencies(code),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Error Handling

### Error Categories

1. **File System Errors**:
   - Missing CSV files
   - File permission issues
   - File encoding problems

2. **CSV Parsing Errors**:
   - Invalid CSV format
   - Missing required columns
   - Malformed data rows

3. **Data Validation Errors**:
   - Invalid administrative codes
   - Missing foreign key relationships
   - Duplicate entries

4. **Database Errors**:
   - Connection failures
   - Constraint violations
   - Transaction rollback scenarios

### Error Handling Strategy

```typescript
interface ErrorHandler {
  handleFileSystemError(error: Error, filePath: string): void;
  handleParsingError(error: Error, row: number): void;
  handleValidationError(error: ValidationError): void;
  handleDatabaseError(error: Error, operation: string): void;
}
```

**Error Recovery**:

- Continue processing other records when individual records fail
- Log detailed error information for debugging
- Provide summary of all errors at completion
- Use database transactions for data consistency

## Testing Strategy

### Unit Tests

1. **CSV Parser Tests**:
   - Test parsing valid CSV files
   - Test handling malformed CSV data
   - Test UTF-8 character handling

2. **Data Validator Tests**:
   - Test validation rules for each entity type
   - Test foreign key relationship validation
   - Test duplicate detection

3. **Database Importer Tests**:
   - Test insert and update operations
   - Test conflict resolution
   - Test error handling for constraint violations

### Integration Tests

1. **End-to-End Import Tests**:
   - Test complete import process with sample data
   - Test import with existing data (updates)
   - Test import with invalid data (error handling)

2. **Database Integration Tests**:
   - Test with actual database connection
   - Test transaction handling
   - Test foreign key constraints

### Test Data

Create sample CSV files for testing:

- `test-provinces.csv`: Small set of provinces
- `test-regencies.csv`: Regencies for test provinces
- `test-districts.csv`: Districts for test regencies

## Performance Considerations

### Optimization Strategies

1. **Batch Processing**:
   - Process CSV data in batches to manage memory usage
   - Use database batch inserts for better performance

2. **Memory Management**:
   - Stream large CSV files instead of loading entirely into memory
   - Clear processed data from memory after database operations

3. **Database Optimization**:
   - Use prepared statements for repeated operations
   - Leverage database indexes for faster lookups
   - Use transactions to ensure data consistency

### Expected Performance

- **CSV Import Speed**: Significantly faster than API approach (no network delays)
- **Memory Usage**: Minimal memory footprint with streaming approach
- **Database Load**: Efficient batch operations minimize database connections

## Security Considerations

### File System Security

- Validate CSV file paths to prevent directory traversal
- Ensure CSV files are read-only during import
- Handle file permission errors gracefully

### Data Validation Security

- Sanitize CSV data to prevent SQL injection
- Validate data types and formats strictly
- Limit string lengths to prevent buffer overflow

### Database Security

- Use parameterized queries for all database operations
- Implement proper transaction handling
- Log security-relevant events for auditing
