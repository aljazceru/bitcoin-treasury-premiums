#!/bin/bash

# Bitcoin Treasury Premium Tracker - Docker Management Scripts
# Usage: ./docker-scripts.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if docker-compose is available
check_compose() {
    if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    
    # Use 'docker compose' if available, otherwise fall back to 'docker-compose'
    if docker compose version >/dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi
}

# Production deployment
prod_up() {
    print_status "Starting production deployment..."
    check_docker
    check_compose
    $COMPOSE_CMD -f docker-compose.prod.yml up --build -d
    print_success "Production deployment started!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:3001"
}

# Development deployment
dev_up() {
    print_status "Starting development deployment with hot reload..."
    check_docker
    check_compose
    $COMPOSE_CMD -f docker-compose.dev.yml up --build
}

# Standard deployment
up() {
    print_status "Starting standard deployment..."
    check_docker
    check_compose
    $COMPOSE_CMD up --build -d
    print_success "Deployment started!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:3001"
}

# Stop all services
down() {
    print_status "Stopping all services..."
    check_compose
    $COMPOSE_CMD down
    $COMPOSE_CMD -f docker-compose.dev.yml down 2>/dev/null || true
    $COMPOSE_CMD -f docker-compose.prod.yml down 2>/dev/null || true
    print_success "All services stopped!"
}

# Show logs
logs() {
    check_compose
    if [ "$2" = "prod" ]; then
        $COMPOSE_CMD -f docker-compose.prod.yml logs -f
    elif [ "$2" = "dev" ]; then
        $COMPOSE_CMD -f docker-compose.dev.yml logs -f
    else
        $COMPOSE_CMD logs -f
    fi
}

# Show status
status() {
    check_compose
    print_status "Service Status:"
    $COMPOSE_CMD ps 2>/dev/null || true
    $COMPOSE_CMD -f docker-compose.dev.yml ps 2>/dev/null || true
    $COMPOSE_CMD -f docker-compose.prod.yml ps 2>/dev/null || true
}

# Clean up everything
clean() {
    print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Docker resources..."
        check_compose
        
        # Stop all services
        $COMPOSE_CMD down -v 2>/dev/null || true
        $COMPOSE_CMD -f docker-compose.dev.yml down -v 2>/dev/null || true
        $COMPOSE_CMD -f docker-compose.prod.yml down -v 2>/dev/null || true
        
        # Remove images
        docker rmi $(docker images "bitcoin-treasury*" -q) 2>/dev/null || true
        
        # Clean up system
        docker system prune -f
        
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Rebuild services
rebuild() {
    print_status "Rebuilding services..."
    check_compose
    if [ "$2" = "prod" ]; then
        $COMPOSE_CMD -f docker-compose.prod.yml build --no-cache
    elif [ "$2" = "dev" ]; then
        $COMPOSE_CMD -f docker-compose.dev.yml build --no-cache
    else
        $COMPOSE_CMD build --no-cache
    fi
    print_success "Rebuild completed!"
}

# Health check
health() {
    print_status "Checking service health..."
    
    # Check backend health
    if curl -s http://localhost:3001/health > /dev/null; then
        print_success "Backend is healthy"
    else
        print_error "Backend is not responding"
    fi
    
    # Check frontend health
    if curl -s http://localhost:3000/health > /dev/null; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend is not responding"
    fi
}

# Show help
help() {
    echo "Bitcoin Treasury Premium Tracker - Docker Management"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  up              Start standard deployment"
    echo "  dev             Start development deployment with hot reload"
    echo "  prod            Start production deployment"
    echo "  down            Stop all services"
    echo "  logs [env]      Show logs (env: dev/prod, default: standard)"
    echo "  status          Show service status"
    echo "  rebuild [env]   Rebuild services (env: dev/prod, default: standard)"
    echo "  health          Check service health"
    echo "  clean           Clean up all Docker resources"
    echo "  help            Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 up           # Start standard deployment"
    echo "  $0 dev          # Start development mode"
    echo "  $0 prod         # Start production mode"
    echo "  $0 logs prod    # Show production logs"
    echo "  $0 rebuild dev  # Rebuild development images"
    echo ""
}

# Main script logic
case "${1}" in
    up)
        up
        ;;
    dev)
        dev_up
        ;;
    prod)
        prod_up
        ;;
    down)
        down
        ;;
    logs)
        logs "$@"
        ;;
    status)
        status
        ;;
    rebuild)
        rebuild "$@"
        ;;
    health)
        health
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        help
        exit 1
        ;;
esac