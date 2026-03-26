#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

POD_NAME="alramy-blog-dev"

echo -e "${BLUE}Removing Al-Ramy Blog development environment...${NC}"

# Check if pod exists
if ! podman pod exists "$POD_NAME"; then
    echo -e "${YELLOW}Pod '$POD_NAME' does not exist${NC}"
    exit 0
fi

# Remove the pod (this will remove all containers in the pod)
podman pod rm -f "$POD_NAME"

echo -e "${GREEN}✓ Pod and containers removed successfully${NC}"
echo -e "${YELLOW}Note: Volumes are preserved. Use 'pnpm podman:reset' to remove volumes${NC}"
