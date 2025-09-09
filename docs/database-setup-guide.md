# Database Setup Guide for Edge Proxy Architecture

## Overview

This guide explains how to properly set up and secure your PostgreSQL database with the Edge Proxy architecture. The database service has been added to your `docker-compose.prod.yml` file and configured to follow security best practices.

## Key Security Features

1. **Private Network Only**: The database is only accessible from the private `viralkan-private` network
2. **No Port Exposure**: No database ports are exposed to the host or internet
3. **Password Security**: Password is set via environment variable
4. **Data Persistence**: Database data is stored in a named volume
5. **Health Checks**: Ensures the database is ready before dependent services start

## Configuration Details

### Database Service in docker-compose.prod.yml

```yaml
db:
  image: postgres:15
  environment:
    - POSTGRES_DB=viralkan
    - POSTGRES_USER=postgres
    - POSTGRES_PASSWORD=${DB_PASSWORD}
  volumes:
    - db_data:/var/lib/postgresql/data
  networks:
    - viralkan-private  # Only private network - NOT connected to edge
  restart: always
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

## Setting Up Database Password

### Development vs Production

- **Development**: Your local `.env.local` file uses `asd123qwezsxc` as the password with `localhost:5432`
- **Production**: The production environment should use a strong, unique password set in `.env.production.local`

### Steps to Configure Production Password

1. Create a `.env.production.local` file (based on the provided `.env.production` template)
2. Set a strong password for `DB_PASSWORD` (minimum 16 characters, mix of letters, numbers, symbols)
3. Keep this file secure and never commit it to version control

### Example Production Configuration

```bash
# In .env.production.local
DB_PASSWORD=P@ssw0rd-Str0ng-S3cur3-Ch4ng3M3!
```

## Connection Strings

### Development Connection String

```
DATABASE_URL=postgres://postgres:asd123qwezsxc@localhost:5432/viralkan-app
```

### Production Connection String (in docker-compose.prod.yml)

```
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/viralkan
```

Note the differences:
- `postgres://` vs `postgresql://` (both work, but the latter is more explicit)
- `localhost:5432` vs `db:5432` (in Docker, we use the service name as hostname)
- `viralkan-app` vs `viralkan` (database name difference)

## Database Initialization

When deploying for the first time, the database will be automatically created with the name `viralkan`. If you need to run migrations or seed data, you should do this as part of your deployment process.

## Backup Considerations

The database data is stored in the `db_data` volume. For production, consider implementing a backup strategy:

```bash
# Example backup command (run on host)
docker exec -t viralkan-app_db_1 pg_dumpall -c -U postgres > backup_$(date +%Y-%m-%d_%H-%M-%S).sql
```

## Troubleshooting

### Database Connection Issues

If your application can't connect to the database, check:

1. The `DB_PASSWORD` environment variable is correctly set
2. Both services are on the same `viralkan-private` network
3. The database service is healthy (`docker ps` to check status)
4. Logs for any errors: `docker logs viralkan-app_db_1`

### Database Data Persistence

To ensure your data persists between deployments, never remove the `db_data` volume. If you need to start fresh, you can explicitly remove it:

```bash
docker volume rm viralkan-app_db_data
```

## Security Best Practices

1. **Never** expose the database port in production
2. **Never** commit database passwords to version control
3. Use strong, unique passwords for production
4. Regularly backup your database
5. Consider implementing database encryption at rest for sensitive data

This setup ensures your database is secure and follows the Edge Proxy architecture principles of keeping databases isolated on private networks.