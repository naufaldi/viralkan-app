# API Scripts

This directory contains utility scripts for the API.

## Security Guidelines

⚠️ **IMPORTANT**: These scripts can modify system data and user permissions. Always review scripts before execution and ensure you're running them in a trusted environment.

## Scripts

### import-csv-admin-data.ts

Imports Indonesian administrative data from CSV files into the database.

#### Features

- ✅ **Fast and reliable** - No external API dependencies or rate limiting
- ✅ **Comprehensive logging** - Detailed progress and error reporting
- ✅ **Data validation** - Validates hierarchical relationships between entities
- ✅ **Upsert operations** - Updates existing records, inserts new ones
- ✅ **Error handling** - Continues processing on individual record failures
- ✅ **Statistics reporting** - Provides detailed import statistics

#### Usage

```bash
# Set environment variables
export DATABASE_URL="postgresql://..."

# Run the import script
bun run scripts/import-csv-admin-data.ts

# Or use the npm script
bun run import:admin-data
```

#### CSV File Requirements

The script expects three CSV files in the `docs/admin-id` directory:

1. **provinces.csv** - Contains province codes and names

   ```csv
   code,name
   11,ACEH
   12,SUMATERA UTARA
   ```

2. **regencies.csv** - Contains regency codes, province codes, and names

   ```csv
   code,province_code,name
   11.01,11,KABUPATEN ACEH SELATAN
   11.02,11,KABUPATEN ACEH TENGGARA
   ```

3. **districts.csv** - Contains district codes, regency codes, and names
   ```csv
   code,regency_code,name
   11.01.01,11.01,Bakongan
   11.01.02,11.01,Kluet Utara
   ```

#### Database Schema

The script populates these tables:

- `provinces` (code, name, created_at, updated_at)
- `regencies` (code, name, province_code, created_at, updated_at)
- `districts` (code, name, regency_code, created_at, updated_at)

#### Security Considerations

1. **Database Access**: Requires direct database access via DATABASE_URL
2. **File System Access**: Reads CSV files from docs/admin-id directory
3. **Data Validation**: Validates foreign key relationships before insertion
4. **Error Isolation**: Individual record failures don't stop the entire import

### setup-admin.ts

Sets up admin users based on environment configuration.

#### Security Features

- ✅ **Environment-based configuration** - No hardcoded secrets
- ✅ **Email validation** - Validates email format before processing
- ✅ **User existence check** - Only updates existing users
- ✅ **Audit logging** - All admin changes are logged to `admin_audit_log` table
- ✅ **Confirmation prompts** - Requires user confirmation before execution
- ✅ **Error handling** - Comprehensive error handling and logging

#### Usage

```bash
# Set environment variables
export ADMIN_EMAILS="admin@example.com,other@example.com"
export DATABASE_URL="postgresql://..."

# Run the script
bun run scripts/setup-admin.ts
```

#### Environment Variables

- `ADMIN_EMAILS` (required): Comma-separated list of admin email addresses
- `DATABASE_URL` (required): PostgreSQL connection string
- `CONFIRM_ADMIN_SETUP` (optional): Set to "true" to skip confirmation prompts

#### Security Considerations

1. **Access Control**: Only run this script in trusted environments
2. **Database Access**: Requires direct database access via DATABASE_URL
3. **User Prerequisites**: Users must exist in the database (must have logged in first)
4. **Audit Trail**: All changes are logged in `admin_audit_log` table
5. **Monitoring**: Monitor `admin_audit_log` for suspicious activity

#### Audit Log Schema

The `admin_audit_log` table tracks:

- `email`: The email address being modified
- `action`: Either 'grant' or 'revoke'
- `success`: Whether the operation succeeded
- `executed_at`: When the action was performed
- `executed_by`: Who performed the action (from USER env var)

#### Best Practices

1. **Review before running**: Always review the script and environment variables
2. **Use in development first**: Test in development environment before production
3. **Monitor logs**: Regularly check admin_audit_log for unexpected changes
4. **Limit access**: Restrict access to this script to authorized personnel only
5. **Document changes**: Keep records of when and why admin changes were made

## Contributing

When adding new scripts:

1. Follow the security patterns established in `setup-admin.ts`
2. Include proper error handling and logging
3. Add validation for all inputs
4. Document security considerations
5. Include usage examples
6. Add tests where appropriate
