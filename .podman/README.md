# Podman Management Scripts

Native Podman pod and container management scripts for Al-Ramy Blog development environment.

## Why Native Podman?

These scripts use **native Podman pods** instead of `docker-compose` or `podman-compose`, providing:

- **Better Performance**: Direct Podman commands without wrapper overhead
- **Rootless Architecture**: Secure, daemonless container management
- **Pod-based Design**: Containers share network namespace (like Kubernetes)
- **Full Control**: Custom health checks, restart policies, and volume management
- **No Dependencies**: No need for docker-compose or podman-compose

## Architecture

### Pod Structure

All containers run in a single pod named `alramy-blog-dev`:

```
alramy-blog-dev (Pod)
├── alramy-blog-postgres-dev (PostgreSQL 17)
├── alramy-blog-redis-dev (Redis 7.2)
└── alramy-blog-localstack-dev (LocalStack S3)
```

### Network Design

- **Shared Network Namespace**: All containers communicate via `localhost`
- **Port Mappings**: Defined at pod level
  - `5432` - PostgreSQL
  - `6379` - Redis
  - `4566` - LocalStack S3
  - `4510-4559` - LocalStack extended range

### Volume Management

Three named volumes for persistent data:

- `alramy-blog-postgres-data` - PostgreSQL database
- `alramy-blog-redis-data` - Redis data and AOF files
- `alramy-blog-localstack-data` - LocalStack S3 storage

### SELinux Compatibility

All volume mounts use the `:Z` flag for SELinux labeling, ensuring compatibility with Fedora and RHEL-based systems.

## Scripts

### `podman-start.sh`

Start the development environment. Creates the pod if it doesn't exist.

```bash
pnpm podman:up
```

**What it does:**
1. Checks if pod exists
2. If not, runs `podman-setup.sh`
3. If exists, starts the pod and all containers

### `podman-stop.sh`

Stop all containers without removing them.

```bash
pnpm podman:stop
```

**Use case**: Temporarily pause the environment while preserving container state.

### `podman-down.sh`

Remove pod and containers (preserves volumes).

```bash
pnpm podman:down
```

**What it does:**
1. Removes the pod
2. Automatically removes all containers in the pod
3. **Preserves volumes** - data is not lost

### `podman-restart.sh`

Restart all containers in the pod.

```bash
pnpm podman:restart
```

**Use case**: Apply configuration changes or recover from container issues.

### `podman-reset.sh`

**⚠️ DESTRUCTIVE**: Remove everything and recreate from scratch.

```bash
pnpm podman:reset
```

**What it does:**
1. Asks for confirmation
2. Removes pod and containers
3. **Removes all volumes** (data loss!)
4. Recreates everything using `podman-setup.sh`

**Use case**: Fresh start when database is corrupted or you need clean state.

### `podman-status.sh`

Show detailed status of all resources.

```bash
pnpm podman:status
```

**Output includes:**
- Pod status
- Container status and ports
- Health check status (colored indicators)
- Volume information

### `podman-logs.sh`

View container logs with flexible options.

```bash
# Show last 50 lines from all containers
pnpm podman:logs

# Show specific container
pnpm podman:logs:postgres
pnpm podman:logs:redis
pnpm podman:logs:localstack

# Follow logs in real-time
./scripts/podman-logs.sh -f postgres

# Show last 100 lines
./scripts/podman-logs.sh -n 100 redis

# Show help
./scripts/podman-logs.sh --help
```

## Quick Start

### First Time Setup

```bash
# 1. Ensure .env file exists with required variables
cp .env.example .env

# 2. Start the environment (creates everything)
pnpm podman:up

# 3. Check status
pnpm podman:status

# 4. Run database migrations
pnpm db:migrate

# 5. Seed the database
pnpm db:seed
```

### Daily Usage

```bash
# Start containers
pnpm podman:up

# Check health
pnpm podman:status

# View logs
pnpm podman:logs

# Stop when done
pnpm podman:stop
```

## Environment Variables

Required in `.env`:

```bash
# PostgreSQL
POSTGRES_USER=ramy
POSTGRES_PASSWORD=p0stgr3SQL21102
POSTGRES_DB=al_ramy_blog_postgres

# Redis
REDIS_USER=default
REDIS_PASSWORD=your_redis_password
REDIS_TESTER=tester
REDIS_TESTER_PASSWORD=tester_password
REDIS_HOST=localhost
REDIS_PORT=6379

# LocalStack S3
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_DEFAULT_REGION=us-east-1
LOCALSTACK_SERVICES=s3
LOCALSTACK_DEBUG=0
```

## Health Checks

Each container includes health checks:

### PostgreSQL
```bash
pg_isready -d ${POSTGRES_DB} -U ${POSTGRES_USER}
```
Checks every 10s, timeout 5s, 5 retries

### Redis
```bash
redis-cli ping
```
Checks every 10s, timeout 5s, 5 retries

### LocalStack
```bash
curl -f http://localhost:4566/_localstack/health
```
Checks every 10s, timeout 5s, 5 retries

View health status: `pnpm podman:status`

## Troubleshooting

### Pod Already Exists Error

```bash
# Remove existing pod first
pnpm podman:down

# Then recreate
pnpm podman:up
```

### Permission Denied on Scripts

```bash
# Make scripts executable
chmod +x scripts/podman-*.sh
```

### Volume Permission Issues (SELinux)

The scripts automatically use `:Z` flag for SELinux labeling. If you still have issues:

```bash
# Check SELinux status
getenforce

# Temporarily set to permissive (for testing)
sudo setenforce 0

# Fix permanently: ensure :Z flag is on all volume mounts
```

### Containers Not Healthy

```bash
# Check logs for errors
pnpm podman:logs:postgres
pnpm podman:logs:redis
pnpm podman:logs:localstack

# Restart containers
pnpm podman:restart
```

### Network Issues Between Containers

In a Podman pod, containers share network namespace and communicate via `localhost`:

```bash
# From application
DATABASE_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379
LOCALSTACK_URL=http://localhost:4566
```

### Complete Reset

If everything is broken:

```bash
# Nuclear option: remove everything
pnpm podman:reset

# Then run migrations and seed
pnpm db:migrate
pnpm db:seed
```

## Advanced Usage

### Direct Podman Commands

```bash
# List all pods
podman pod ps

# Inspect pod
podman pod inspect alramy-blog-dev

# List containers in pod
podman ps -a --filter pod=alramy-blog-dev

# Execute command in container
podman exec -it alramy-blog-postgres-dev psql -U ramy -d al_ramy_blog_postgres

# Access Redis CLI
podman exec -it alramy-blog-redis-dev redis-cli

# Check volume contents
podman volume inspect alramy-blog-postgres-data
```

### Custom Initialization Scripts

#### PostgreSQL
Add `.sql` files to a directory and mount:
```bash
-v ./init-scripts:/docker-entrypoint-initdb.d:ro,Z
```

#### Redis
Modify `.redis/redis-init.sh` to customize Redis configuration.

#### LocalStack
Add init hooks to `.localstack/init-s3-dev.py` (already configured).

## Migration from Docker Compose

Key differences:

| Docker Compose | Native Podman |
|---------------|---------------|
| `docker-compose up -d` | `pnpm podman:up` |
| `docker-compose down` | `pnpm podman:down` |
| `docker-compose ps` | `pnpm podman:status` |
| `docker-compose logs` | `pnpm podman:logs` |
| `docker-compose restart` | `pnpm podman:restart` |
| Separate networks | Shared pod network |
| Docker daemon | Daemonless (rootless) |

## Benefits Over Docker

1. **Rootless**: Runs without root privileges
2. **Daemonless**: No background daemon required
3. **Compatible**: Drop-in replacement for Docker
4. **Kubernetes-ready**: Pods are Kubernetes-compatible
5. **SELinux**: Better integration with Fedora/RHEL
6. **Systemd**: Native systemd integration for auto-start

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Setup Podman
  run: |
    # Podman is pre-installed on GitHub runners
    podman version

- name: Start Services
  run: |
    ./scripts/podman-setup.sh

- name: Wait for Health
  run: |
    ./scripts/podman-status.sh

- name: Run Tests
  run: |
    pnpm test

- name: Cleanup
  run: |
    ./scripts/podman-down.sh
```

## systemd Integration (Optional)

Auto-start pod on boot:

```bash
# Generate systemd unit
podman generate systemd --new --files --name alramy-blog-dev

# Move to systemd user directory
mkdir -p ~/.config/systemd/user/
mv pod-alramy-blog-dev.service ~/.config/systemd/user/

# Enable and start
systemctl --user enable pod-alramy-blog-dev
systemctl --user start pod-alramy-blog-dev

# Enable linger (keep running after logout)
loginctl enable-linger $USER
```

## Resources

- [Podman Documentation](https://docs.podman.io/)
- [Podman Pods](https://docs.podman.io/en/latest/markdown/podman-pod.1.html)
- [Rootless Containers](https://github.com/containers/podman/blob/main/docs/tutorials/rootless_tutorial.md)
- [Migrating from Docker](https://github.com/containers/podman/blob/main/transfer.md)

## Contributing

When modifying scripts:

1. Test thoroughly with `podman:reset`
2. Ensure SELinux compatibility (`:Z` flags)
3. Add appropriate error handling
4. Update this README
5. Maintain colored output for UX

## License

Private - Al-Ramy Blog Project
