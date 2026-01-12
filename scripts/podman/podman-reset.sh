#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

POD_NAME="alramy-blog-dev"

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${RED}   RESETTING Al-Ramy Blog Development Environment${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}This will remove all containers, pod, and volumes!${NC}"
echo -e "${YELLOW}All data will be lost!${NC}\n"

# Ask for confirmation
read -p "Are you sure you want to continue? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${GREEN}Reset cancelled${NC}"
    exit 0
fi

# Step 1: Remove pod and containers
if podman pod exists "$POD_NAME"; then
    echo -e "\n${BLUE}[1/3] Removing pod and containers...${NC}"
    podman pod rm -f "$POD_NAME"
    echo -e "${GREEN}✓ Pod and containers removed${NC}"
else
    echo -e "\n${YELLOW}[1/3] Pod does not exist, skipping...${NC}"
fi

# Step 2: Remove volumes
echo -e "\n${BLUE}[2/3] Removing volumes...${NC}"
podman volume rm -f alramy-blog-postgres-data 2>/dev/null && echo -e "  ${GREEN}✓ Removed postgres data${NC}" || echo -e "  ${YELLOW}✗ Volume alramy-blog-postgres-data not found${NC}"
podman volume rm -f alramy-blog-redis-data 2>/dev/null && echo -e "  ${GREEN}✓ Removed redis data${NC}" || echo -e "  ${YELLOW}✗ Volume alramy-blog-redis-data not found${NC}"
podman volume rm -f alramy-blog-localstack-data 2>/dev/null && echo -e "  ${GREEN}✓ Removed localstack data${NC}" || echo -e "  ${YELLOW}✗ Volume alramy-blog-localstack-data not found${NC}"
echo -e "${GREEN}✓ Volumes removed${NC}"

# Step 3: Recreate everything
echo -e "\n${BLUE}[3/3] Recreating environment...${NC}"
"$(dirname "${BASH_SOURCE[0]}")/podman-setup.sh"

echo -e "\n${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Reset complete! Environment recreated${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}\n"
