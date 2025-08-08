#!/bin/bash

# Viralkan Deployment Script
# Usage: ./scripts/deploy.sh [environment] [image_tag]
# Example: ./scripts/deploy.sh production v1.0.0

set -e  # Exit on any error

# Default values
ENVIRONMENT=${1:-production}
IMAGE_TAG=${2:-latest}
PROJECT_NAME="viralkan"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    error "Invalid environment: $ENVIRONMENT. Must be development, staging, or production."
fi

log "Starting deployment for environment: $ENVIRONMENT with image tag: $IMAGE_TAG"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running. Please start Docker and try again."
fi

# Check if required files exist
COMPOSE_FILE="docker-compose.yml"
if [[ "$ENVIRONMENT" != "development" ]]; then
    COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
    error "Compose file not found: $COMPOSE_FILE"
fi

# Check if environment file exists
ENV_FILE=".env.${ENVIRONMENT}"
if [[ ! -f "$ENV_FILE" ]]; then
    warning "Environment file not found: $ENV_FILE. Using default values."
else
    log "Loading environment from: $ENV_FILE"
fi

# Check if secrets exist for production/staging
if [[ "$ENVIRONMENT" != "development" ]]; then
    log "Checking secrets..."
    
    required_secrets=(
        "secrets/db-password.txt"
        "secrets/jwt-secret.txt"
        "secrets/nextauth-secret.txt"
        "secrets/firebase-service-account.json"
    )
    
    for secret in "${required_secrets[@]}"; do
        if [[ ! -f "$secret" ]]; then
            error "Required secret file not found: $secret. Please create it from the template."
        fi
    done
    
    success "All required secrets found"
fi

# Create necessary directories
log "Creating necessary directories..."
mkdir -p backups
mkdir -p logs

# Set environment variables
export ENVIRONMENT
export IMAGE_TAG
export COMPOSE_PROJECT_NAME="${PROJECT_NAME}_${ENVIRONMENT}"

# Load environment file if it exists
if [[ -f "$ENV_FILE" ]]; then
    set -a  # Automatically export all variables
    source "$ENV_FILE"
    set +a
fi

# Build and deploy based on environment
case "$ENVIRONMENT" in
    "development")
        log "Deploying development environment..."
        docker-compose -f docker-compose.yml \
            --project-name "$COMPOSE_PROJECT_NAME" \
            up -d --build
        ;;
    "staging")
        log "Deploying staging environment..."
        docker-compose -f docker-compose.yml \
                      -f docker-compose.staging.yml \
                      --project-name "$COMPOSE_PROJECT_NAME" \
                      up -d
        ;;
    "production")
        log "Deploying production environment..."
        
        # Create backup before deployment
        log "Creating database backup..."
        docker-compose -f docker-compose.prod.yml \
                      --project-name "$COMPOSE_PROJECT_NAME" \
                      exec -T db pg_dump -U viralkan viralkan > "backups/backup-$(date +%Y%m%d-%H%M%S).sql" || warning "Backup failed or database not running"
        
        # Deploy with zero downtime
        docker-compose -f docker-compose.prod.yml \
                      --project-name "$COMPOSE_PROJECT_NAME" \
                      up -d --no-deps api web
        ;;
esac

# Wait for services to be healthy
log "Waiting for services to be healthy..."
sleep 10

# Check service health
check_service_health() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            success "$service is healthy"
            return 0
        fi
        
        log "Waiting for $service to be healthy... (attempt $attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
    
    error "$service health check failed after $max_attempts attempts"
}

# Health checks based on environment
if [[ "$ENVIRONMENT" == "development" ]]; then
    check_service_health "API" "http://localhost/api/health"
    check_service_health "Web" "http://localhost/"
else
    if [[ -n "$DOMAIN" ]]; then
        if [[ "$ENVIRONMENT" == "staging" ]]; then
            check_service_health "API" "https://staging.$DOMAIN/api/health"
            check_service_health "Web" "https://staging.$DOMAIN/"
        else
            check_service_health "API" "https://$DOMAIN/api/health"
            check_service_health "Web" "https://$DOMAIN/"
        fi
    else
        warning "DOMAIN not set, skipping health checks"
    fi
fi

# Show running containers
log "Running containers:"
docker-compose -f "$COMPOSE_FILE" --project-name "$COMPOSE_PROJECT_NAME" ps

success "Deployment completed successfully!"

# Show useful commands
log "Useful commands:"
log "  View logs: docker-compose -f $COMPOSE_FILE --project-name $COMPOSE_PROJECT_NAME logs -f"
log "  Stop services: docker-compose -f $COMPOSE_FILE --project-name $COMPOSE_PROJECT_NAME down"
log "  View status: docker-compose -f $COMPOSE_FILE --project-name $COMPOSE_PROJECT_NAME ps"

if [[ "$ENVIRONMENT" != "development" ]]; then
    log "  Monitor with Traefik dashboard: https://$DOMAIN:8080 (if enabled)"
fi