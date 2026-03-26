#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
POD_NAME="alramy-blog-dev"
POSTGRES_CONTAINER="alramy-blog-postgres-dev"
REDIS_CONTAINER="alramy-blog-redis-dev"
LOCALSTACK_CONTAINER="alramy-blog-localstack-dev"

# Load environment variables from .env file
if [ -f .env ]; then
    echo -e "${BLUE}Loading environment variables from .env${NC}"
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Get the absolute path of the project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Al-Ramy Blog - Podman Development Setup${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"

# Check if pod already exists
if podman pod exists "$POD_NAME"; then
    echo -e "${YELLOW}Pod '$POD_NAME' already exists. Remove it first with: pnpm podman:down${NC}"
    exit 1
fi

# Step 1: Create volumes
echo -e "\n${GREEN}[1/5] Creating volumes...${NC}"
podman volume create alramy-blog-postgres-data 2>/dev/null || echo "  Volume alramy-blog-postgres-data already exists"
podman volume create alramy-blog-redis-data 2>/dev/null || echo "  Volume alramy-blog-redis-data already exists"
podman volume create alramy-blog-localstack-data 2>/dev/null || echo "  Volume alramy-blog-localstack-data already exists"
echo -e "${GREEN}✓ Volumes created${NC}"

# Step 2: Create pod with port mappings
echo -e "\n${GREEN}[2/5] Creating pod with port mappings...${NC}"
podman pod create \
    --name "$POD_NAME" \
    --publish 5432:5432 \
    --publish 6379:6379 \
    --publish 4566:4566 \
    --publish 127.0.0.1:4510-4559:4510-4559
echo -e "${GREEN}✓ Pod created: $POD_NAME${NC}"

# Step 3: Create PostgreSQL container
echo -e "\n${GREEN}[3/5] Creating PostgreSQL container...${NC}"
podman run -d \
    --pod "$POD_NAME" \
    --name "$POSTGRES_CONTAINER" \
    --restart unless-stopped \
    -e POSTGRES_USER="${POSTGRES_USER}" \
    -e POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
    -e POSTGRES_DB="${POSTGRES_DB}" \
    -v alramy-blog-postgres-data:/var/lib/postgresql/data:Z \
    --health-cmd "pg_isready -d ${POSTGRES_DB} -U ${POSTGRES_USER}" \
    --health-interval 10s \
    --health-timeout 5s \
    --health-retries 5 \
    postgres:17-alpine
echo -e "${GREEN}✓ PostgreSQL container created${NC}"

# Step 4: Create Redis container
echo -e "\n${GREEN}[4/5] Creating Redis container...${NC}"
podman run -d \
    --pod "$POD_NAME" \
    --name "$REDIS_CONTAINER" \
    --restart unless-stopped \
    -e REDIS_USER="${REDIS_USER}" \
    -e REDIS_PASSWORD="${REDIS_PASSWORD}" \
    -e REDIS_TESTER="${REDIS_TESTER}" \
    -e REDIS_TESTER_PASSWORD="${REDIS_TESTER_PASSWORD}" \
    -e REDIS_HOST="${REDIS_HOST}" \
    -e REDIS_PORT="${REDIS_PORT}" \
    -v alramy-blog-redis-data:/data:Z \
    -v "${PROJECT_ROOT}/.redis/redis-init.sh:/usr/local/bin/redis-init.sh:ro,Z" \
    --health-cmd "redis-cli ping" \
    --health-interval 10s \
    --health-timeout 5s \
    --health-retries 5 \
    redis:7.2-alpine \
    sh /usr/local/bin/redis-init.sh
echo -e "${GREEN}✓ Redis container created${NC}"

# Step 5: Create LocalStack container
echo -e "\n${GREEN}[5/5] Creating LocalStack container...${NC}"
podman run -d \
    --pod "$POD_NAME" \
    --name "$LOCALSTACK_CONTAINER" \
    --restart unless-stopped \
    -e SERVICES="${LOCALSTACK_SERVICES:-s3,ses}" \
    -e DEBUG="${LOCALSTACK_DEBUG:-0}" \
    -e DATA_DIR=/var/lib/localstack \
    -e HOSTNAME=localstack \
    -e AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}" \
    -e AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}" \
    -e AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION}" \
    -e EMAIL_FROM="${EMAIL_FROM}" \
    -v alramy-blog-localstack-data:/var/lib/localstack:Z \
    -v "${PROJECT_ROOT}/.localstack/init-s3-dev.py:/etc/localstack/init/ready.d/init-s3-dev.py:ro,Z" \
    -v "${PROJECT_ROOT}/.localstack/init-ses-dev.py:/etc/localstack/init/ready.d/init-ses-dev.py:ro,Z" \
    --health-cmd "curl -f http://localhost:4566/_localstack/health" \
    --health-interval 10s \
    --health-timeout 5s \
    --health-retries 5 \
    localstack/localstack:latest
echo -e "${GREEN}✓ LocalStack container created${NC}"

# Summary
echo -e "\n${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "\nPod: ${GREEN}$POD_NAME${NC}"
echo -e "\nContainers:"
echo -e "  • ${GREEN}$POSTGRES_CONTAINER${NC} (PostgreSQL 17)"
echo -e "  • ${GREEN}$REDIS_CONTAINER${NC} (Redis 7.2)"
echo -e "  • ${GREEN}$LOCALSTACK_CONTAINER${NC} (LocalStack S3)"
echo -e "\nPorts:"
echo -e "  • PostgreSQL: ${GREEN}5432${NC}"
echo -e "  • Redis:      ${GREEN}6379${NC}"
echo -e "  • LocalStack: ${GREEN}4566${NC}"
echo -e "\nVolumes:"
echo -e "  • alramy-blog-postgres-data"
echo -e "  • alramy-blog-redis-data"
echo -e "  • alramy-blog-localstack-data"
echo -e "\n${YELLOW}Run 'pnpm podman:status' to check container status${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}\n"
