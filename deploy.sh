#!/bin/bash

# Bitcoin Treasury Tracker Deployment Script
set -e

echo "Starting Bitcoin Treasury Tracker deployment..."

# Load environment variables from .env file
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    set -o allexport
    source .env
    set +o allexport
else
    echo "ERROR: .env file not found! Please create one from .env.example"
    exit 1
fi

# Check if docker and docker-compose are available
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed or not in PATH"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed or not in PATH"
    exit 1
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p app/data app/logs

# Set proper permissions for data and logs directories
echo "Setting up directory permissions..."
chmod 755 app/data app/logs
if [ -f app/data/treasury.db ]; then
    chmod 664 app/data/treasury.db
fi

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build the application
echo "Building Docker image..."
docker-compose build

# Start the application
echo "Starting application..."
docker-compose up -d

# Wait for health check
echo "Waiting for application to be healthy..."
sleep 10

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo "Application is running!"
    
    # Show status
    echo ""
    echo "Container Status:"
    docker-compose ps
    
    echo ""
    echo "Application URLs:"
    echo "  - Direct access: http://localhost:${PORT}"
    if [ "$NODE_ENV" = "production" ]; then
        echo "  - Production: https://${DOMAIN}"
    else
        echo "  - Development: http://${DOMAIN}"
    fi
    
    echo ""
    echo "Health check:"
    curl -s http://localhost:${PORT}/api/health || echo "Health check failed"
    
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop: docker-compose down"
    
else
    echo "ERROR: Application failed to start!"
    echo "Container logs:"
    docker-compose logs
    exit 1
fi

echo ""
echo "Deployment completed successfully!"

# Show nginx configuration hint
echo ""
echo "Nginx Reverse Proxy Configuration:"
echo "Add this to your nginx configuration:"
echo ""
echo "server {"
echo "    listen 80;"
echo "    server_name ${DOMAIN};"
echo "    "
echo "    location / {"
echo "        proxy_pass http://127.0.0.1:${PORT};"
echo "        proxy_set_header Host \$host;"
echo "        proxy_set_header X-Real-IP \$remote_addr;"
echo "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
echo "        proxy_set_header X-Forwarded-Proto \$scheme;"
echo "    }"
echo "}"