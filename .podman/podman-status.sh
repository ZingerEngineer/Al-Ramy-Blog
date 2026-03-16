#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

POD_NAME="alramy-blog-dev"

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Al-Ramy Blog - Development Status${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}\n"

# Check if pod exists
if ! podman pod exists "$POD_NAME"; then
    echo -e "${YELLOW}Pod '$POD_NAME' does not exist${NC}"
    echo -e "Run ${GREEN}pnpm podman:up${NC} to create it\n"
    exit 0
fi

# Show pod status
echo -e "${GREEN}Pod Status:${NC}"
podman pod ps --filter name="$POD_NAME" --format "table {{.ID}}\t{{.Name}}\t{{.Status}}\t{{.Created}}\t{{.InfraID}}"

echo -e "\n${GREEN}Container Status:${NC}"
podman ps -a --filter pod="$POD_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n${GREEN}Health Status:${NC}"
# Get health status for each container
POSTGRES_HEALTH=$(podman inspect --format='{{.State.Health.Status}}' alramy-blog-postgres-dev 2>/dev/null || echo "N/A")
REDIS_HEALTH=$(podman inspect --format='{{.State.Health.Status}}' alramy-blog-redis-dev 2>/dev/null || echo "N/A")
LOCALSTACK_HEALTH=$(podman inspect --format='{{.State.Health.Status}}' alramy-blog-localstack-dev 2>/dev/null || echo "N/A")

# Color health status
if [ "$POSTGRES_HEALTH" = "healthy" ]; then
    POSTGRES_HEALTH="${GREEN}healthy${NC}"
elif [ "$POSTGRES_HEALTH" = "unhealthy" ]; then
    POSTGRES_HEALTH="${RED}unhealthy${NC}"
elif [ "$POSTGRES_HEALTH" = "starting" ]; then
    POSTGRES_HEALTH="${YELLOW}starting${NC}"
fi

if [ "$REDIS_HEALTH" = "healthy" ]; then
    REDIS_HEALTH="${GREEN}healthy${NC}"
elif [ "$REDIS_HEALTH" = "unhealthy" ]; then
    REDIS_HEALTH="${RED}unhealthy${NC}"
elif [ "$REDIS_HEALTH" = "starting" ]; then
    REDIS_HEALTH="${YELLOW}starting${NC}"
fi

if [ "$LOCALSTACK_HEALTH" = "healthy" ]; then
    LOCALSTACK_HEALTH="${GREEN}healthy${NC}"
elif [ "$LOCALSTACK_HEALTH" = "unhealthy" ]; then
    LOCALSTACK_HEALTH="${RED}unhealthy${NC}"
elif [ "$LOCALSTACK_HEALTH" = "starting" ]; then
    LOCALSTACK_HEALTH="${YELLOW}starting${NC}"
fi

echo -e "  PostgreSQL:  $POSTGRES_HEALTH"
echo -e "  Redis:       $REDIS_HEALTH"
echo -e "  LocalStack:  $LOCALSTACK_HEALTH"

echo -e "\n${GREEN}Volumes:${NC}"
podman volume ls --filter name=alramy-blog --format "table {{.Name}}\t{{.Driver}}"

echo -e "\n${BLUE}════════════════════════════════════════════════════${NC}\n"
