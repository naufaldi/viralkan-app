# Requirements Document

## Introduction

This feature replaces the external API-based administrative data sync system with a CSV-based import system. Instead of fetching Indonesian administrative data (provinces, regencies, districts) from external APIs with rate limiting and reliability issues, the system will read from local CSV files in the `docs/admin-id` directory and populate the database with the same hierarchical structure.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to import Indonesian administrative data from CSV files, so that I can populate the database without depending on external APIs.

#### Acceptance Criteria

1. WHEN the import system runs THEN it SHALL read CSV files from `docs/admin-id` directory
2. WHEN CSV files are processed THEN the system SHALL validate data format and structure
3. WHEN data is valid THEN the system SHALL insert/update records in provinces, regencies, and districts tables
4. WHEN import completes THEN the system SHALL provide detailed statistics (inserted, updated, errors)

### Requirement 2

**User Story:** As a developer, I want the CSV import to handle the hierarchical relationship between provinces, regencies, and districts, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN importing provinces THEN the system SHALL process `Provinces (1).csv` with code and name fields
2. WHEN importing regencies THEN the system SHALL process `Regencies Data.csv` with code, province_code, and name fields
3. WHEN importing districts THEN the system SHALL process `Districts Data.csv` with code, regency_code, and name fields
4. WHEN processing hierarchical data THEN the system SHALL validate foreign key relationships exist

### Requirement 3

**User Story:** As a developer, I want comprehensive error handling and validation, so that data quality issues are caught and reported.

#### Acceptance Criteria

1. WHEN CSV files are missing THEN the system SHALL report clear error messages
2. WHEN CSV data has invalid format THEN the system SHALL log specific validation errors
3. WHEN database operations fail THEN the system SHALL continue processing other records and report errors
4. WHEN foreign key constraints fail THEN the system SHALL log relationship validation errors

### Requirement 4

**User Story:** As a developer, I want the same statistics and logging interface as the current API-based system, so that monitoring and debugging remain consistent.

#### Acceptance Criteria

1. WHEN import runs THEN the system SHALL provide SyncStats interface with counts for each entity type
2. WHEN processing completes THEN the system SHALL log detailed statistics (total, inserted, updated, errors)
3. WHEN errors occur THEN the system SHALL log specific error details with context
4. WHEN import finishes THEN the system SHALL report total duration and success/failure status

### Requirement 5

**User Story:** As a developer, I want the CSV import to be more reliable than the API approach, so that administrative data setup is consistent and fast.

#### Acceptance Criteria

1. WHEN CSV import runs THEN it SHALL complete without network dependencies
2. WHEN processing large datasets THEN the system SHALL not be subject to rate limiting
3. WHEN import is executed THEN it SHALL be significantly faster than API-based sync
4. WHEN system runs offline THEN the CSV import SHALL still function properly

### Requirement 6

**User Story:** As a developer, I want to run the CSV import via script, so that I can easily populate administrative data during setup or updates.

#### Acceptance Criteria

1. WHEN running import script THEN it SHALL execute the full CSV import process
2. WHEN script completes THEN it SHALL exit with appropriate status codes (0 for success, 1 for failure)
3. WHEN script runs THEN it SHALL provide progress updates and final statistics
4. WHEN script encounters errors THEN it SHALL display helpful error messages and continue processing
