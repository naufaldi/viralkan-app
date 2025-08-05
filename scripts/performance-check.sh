#!/bin/bash

# Performance Check Script
# Run this script to monitor your application performance

echo "🚀 Viralkan Performance Check"
echo "================================"

# Check if running in production directory
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Function to check service health
check_service_health() {
    local service=$1
    echo "\n📊 Checking $service service..."
    
    # Check if service is running
    if docker-compose -f docker-compose.prod.yml ps $service | grep -q "Up"; then
        echo "✅ $service is running"
        
        # Get resource usage
        echo "📈 Resource usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep $service
    else
        echo "❌ $service is not running"
    fi
}

# Function to test response time
test_response_time() {
    local url=$1
    local name=$2
    
    echo "\n⏱️  Testing $name response time..."
    
    # Test response time using curl
    response_time=$(curl -o /dev/null -s -w '%{time_total}\n' "$url" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "✅ $name response time: ${response_time}s"
        
        # Check if response time is good (< 2 seconds)
        if (( $(echo "$response_time < 2.0" | bc -l) )); then
            echo "🟢 Good performance"
        elif (( $(echo "$response_time < 5.0" | bc -l) )); then
            echo "🟡 Moderate performance"
        else
            echo "🔴 Slow performance - needs optimization"
        fi
    else
        echo "❌ Failed to connect to $name"
    fi
}

# Function to check database performance
check_database() {
    echo "\n🗄️  Checking database performance..."
    
    # Check database connections
    connections=$(docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres -d viralkan -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | tr -d ' ')
    
    if [ $? -eq 0 ]; then
        echo "✅ Database connections: $connections"
        
        # Check database size
        db_size=$(docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres -d viralkan -t -c "SELECT pg_size_pretty(pg_database_size('viralkan'));" 2>/dev/null | tr -d ' ')
        echo "📊 Database size: $db_size"
    else
        echo "❌ Cannot connect to database"
    fi
}

# Function to check disk usage
check_disk_usage() {
    echo "\n💾 Checking disk usage..."
    
    # Check Docker disk usage
    echo "🐳 Docker disk usage:"
    docker system df
    
    echo "\n📁 Project directory size:"
    du -sh .
}

# Main execution
echo "\n🔍 Starting performance check..."

# Check services
check_service_health "web"
check_service_health "api"
check_service_health "db"

# Test response times (replace with your actual domain)
DOMAIN=${DOMAIN:-"viral.faldi.xyz"}
test_response_time "https://$DOMAIN" "Website"
test_response_time "https://$DOMAIN/api/health" "API Health"

# Check database
check_database

# Check disk usage
check_disk_usage

# Summary
echo "\n📋 Performance Check Complete"
echo "================================"
echo "💡 Tips:"
echo "   - Monitor resource usage regularly"
echo "   - Check logs if any service shows issues"
echo "   - Consider scaling if CPU/Memory usage is consistently high"
echo "   - Use 'docker-compose -f docker-compose.prod.yml logs [service]' for detailed logs"

echo "\n🔗 Useful commands:"
echo "   - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   - Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "   - Update images: docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"