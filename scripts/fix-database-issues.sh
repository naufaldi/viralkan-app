#!/bin/bash

echo "🔧 Fixing Database Issues..."

# Stop all services
echo "Stopping services..."
docker-compose -f docker-compose.prod.yml --env-file .env.production down

# Clean up any corrupted volumes (if needed)
echo "Cleaning up volumes..."
docker volume prune -f

# Start services with new configuration
echo "Starting services with optimized configuration..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 30

# Check database health
echo "Checking database health..."
docker-compose -f docker-compose.prod.yml --env-file .env.production exec db pg_isready -U postgres

# Check database performance
echo "Checking database performance..."
docker-compose -f docker-compose.prod.yml --env-file .env.production exec db psql -U postgres -d viralkan -c "SELECT name, setting, unit FROM pg_settings WHERE name IN ('shared_buffers', 'effective_cache_size', 'checkpoint_timeout', 'max_wal_size');"

echo "✅ Database fixes applied!"
echo "📊 Monitor logs with: docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f db" 