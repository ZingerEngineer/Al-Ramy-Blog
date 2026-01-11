#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

POD_NAME="alramy-blog-dev"

# Parse arguments
CONTAINER=""
FOLLOW=false
TAIL="50"

usage() {
    echo "Usage: $0 [OPTIONS] [CONTAINER]"
    echo ""
    echo "Show logs for Al-Ramy Blog development containers"
    echo ""
    echo "Options:"
    echo "  -f, --follow      Follow log output"
    echo "  -n, --tail NUM    Number of lines to show from the end (default: 50)"
    echo "  -h, --help        Show this help message"
    echo ""
    echo "Containers:"
    echo "  postgres    PostgreSQL logs"
    echo "  redis       Redis logs"
    echo "  localstack  LocalStack logs"
    echo "  all         All containers (default)"
    echo ""
    echo "Examples:"
    echo "  pnpm podman:logs                  # Show last 50 lines from all containers"
    echo "  pnpm podman:logs postgres         # Show PostgreSQL logs"
    echo "  pnpm podman:logs -f redis         # Follow Redis logs"
    echo "  pnpm podman:logs -n 100 postgres  # Show last 100 lines"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -n|--tail)
            TAIL="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        postgres|redis|localstack|all)
            CONTAINER="$1"
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

# Default to all containers
if [ -z "$CONTAINER" ]; then
    CONTAINER="all"
fi

# Check if pod exists
if ! podman pod exists "$POD_NAME"; then
    echo -e "${RED}Pod '$POD_NAME' does not exist${NC}"
    echo -e "Run ${GREEN}pnpm podman:up${NC} to create it"
    exit 1
fi

# Build log command
LOG_CMD="podman logs"
if [ "$FOLLOW" = true ]; then
    LOG_CMD="$LOG_CMD -f"
fi
LOG_CMD="$LOG_CMD --tail $TAIL"

# Show logs
case $CONTAINER in
    postgres)
        echo -e "${BLUE}PostgreSQL Logs:${NC}"
        $LOG_CMD alramy-blog-postgres-dev
        ;;
    redis)
        echo -e "${BLUE}Redis Logs:${NC}"
        $LOG_CMD alramy-blog-redis-dev
        ;;
    localstack)
        echo -e "${BLUE}LocalStack Logs:${NC}"
        $LOG_CMD alramy-blog-localstack-dev
        ;;
    all)
        echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}   PostgreSQL Logs${NC}"
        echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
        $LOG_CMD alramy-blog-postgres-dev
        echo -e "\n${BLUE}════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}   Redis Logs${NC}"
        echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
        $LOG_CMD alramy-blog-redis-dev
        echo -e "\n${BLUE}════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}   LocalStack Logs${NC}"
        echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
        $LOG_CMD alramy-blog-localstack-dev
        ;;
esac
