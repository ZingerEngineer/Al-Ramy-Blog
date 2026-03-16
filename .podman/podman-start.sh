#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

POD_NAME="alramy-blog-dev"

echo -e "${BLUE}Starting Al-Ramy Blog development environment...${NC}"

# Check if pod exists
if ! podman pod exists "$POD_NAME"; then
    echo -e "${YELLOW}Pod '$POD_NAME' does not exist. Running setup...${NC}"
    "$(dirname "${BASH_SOURCE[0]}")/podman-setup.sh"
    exit 0
fi

# Start the pod
podman pod start "$POD_NAME"

echo -e "${GREEN}✓ Pod started successfully${NC}"
echo -e "${YELLOW}Run 'pnpm podman:status' to check container status${NC}"
