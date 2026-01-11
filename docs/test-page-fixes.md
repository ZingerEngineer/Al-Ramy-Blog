# Test Page Fixes - Container Connection Issues

## Issues Fixed

### 1. LocalStack S3 Connection Errors (Critical) ✅

**Problems:**
1. **ECONNRESET Error**: The S3 client was reusing connections that became stale over time
2. **Socket Hang Up Error**: Node.js was trying to connect via IPv6, but LocalStack only listens on IPv4

**Root Causes:**
- AWS SDK's persistent connection pooling caused ECONNRESET errors when connections timed out
- Node.js DNS resolution prefers IPv6 (`::1`) over IPv4 (`127.0.0.1`)
- LocalStack doesn't support IPv6 connections from the host
- No retry logic or connection timeout configuration

**Solutions:**
1. **Force IPv4 connections**: Changed endpoint from `http://localhost:4566` to `http://127.0.0.1:4566`
2. **Client lifecycle management**: Automatic client recreation every 5 minutes
3. **Retry logic**: Added `maxAttempts: 3` for automatic retries on transient failures

**Changes:**
```typescript
// Before: localhost can resolve to IPv6 (::1) which LocalStack doesn't support
export function getS3Endpoint(): string {
  return process.env.LOCALSTACK_ENDPOINT ?? 'http://localhost:4566';
}

// After: Force IPv4 with 127.0.0.1
export function getS3Endpoint(): string {
  return process.env.LOCALSTACK_ENDPOINT ?? 'http://127.0.0.1:4566';
}

// Also added:
let s3Client: S3Client | null = null;
let lastClientCreation = 0;
const CLIENT_TTL = 5 * 60 * 1000; // 5 minutes

// Client now includes:
- Automatic recreation after 5 minutes
- maxAttempts: 3 (automatic retry)
```

### 2. Redis Test Key TTL Issue (Medium) ✅

**Problem 1: ACL Permissions**
- The `tester_redis` user only had `+ping` permission
- Couldn't check key existence, get values, or check TTL
- Caused permission denied errors when testing keys

**Solution:**
- Updated Redis ACL to grant necessary permissions: `+ping +exists +get +ttl`
- File: `.redis/redis-init.sh`

**Changes:**
```bash
# Before
user ${REDIS_TESTER} on >${REDIS_TESTER_PASSWORD} ~* resetchannels -@all +ping

# After
user ${REDIS_TESTER} on >${REDIS_TESTER_PASSWORD} ~* resetchannels -@all +ping +exists +get +ttl
```

**Problem 2: TTL Validation**
- No validation of TTL input before converting to number
- `Number(ttl)` could produce NaN if input was invalid
- No user feedback for invalid TTL values

**Solution:**
- Added validation in the UI component (`apps/webapp/app/test/components/redis-test-card.tsx`)
- Validate TTL is a number between 1 and 30 before calling the server
- Show error messages for invalid input
- Added small delay (10ms) to ensure Redis processes the write before checking

**Changes:**
```typescript
// Added validation
const ttlValue = Number(ttl);
if (isNaN(ttlValue) || ttlValue < 1 || ttlValue > 30) {
  setKeyResult({
    success: false,
    error: 'TTL must be a number between 1 and 30',
  });
  return;
}

// Added small delay before checking
await new Promise((resolve) => setTimeout(resolve, 10));
```

## Files Modified

1. `packages/services/src/s3/client.ts` - S3 client connection management
2. `.redis/redis-init.sh` - Redis ACL permissions
3. `apps/webapp/app/test/components/redis-test-card.tsx` - UI validation and error handling

## Testing

### Test LocalStack S3
1. Navigate to `/test` page
2. Click "Test Connection" under LocalStack S3
3. Should see: ✅ Connected (no ECONNRESET error)
4. Upload a file - should succeed
5. View file contents - should work

### Test Redis TTL
1. Navigate to `/test` page
2. Click "Test Connection" under Redis Cache
3. Should see: ✅ Connected
4. Change TTL to any value between 1-30 seconds
5. Click "Set Test Key"
6. Should see:
   - Key is created with status "Exists"
   - TTL countdown shows correctly (e.g., "TTL: 10s remaining")
   - After TTL expires, status changes to "Expired"
7. Try invalid TTL (e.g., 0 or 100) - should show error message

## Technical Details

### S3 Connection Pooling
The AWS SDK maintains HTTP connection pools for performance. Issues arise when:
- Connections idle longer than server timeout (usually 60s)
- Next.js development server hot-reloads
- LocalStack restarts

Our solution:
- Recreate client every 5 minutes (fresh connection pool)
- Configure explicit timeouts (prevent hanging requests)
- Retry logic (handle transient failures)

### Redis ACL Security Model
Redis ACL controls which commands users can execute:
- `+ping` - Health check
- `+exists` - Check if key exists
- `+get` - Read key value
- `+ttl` - Check time-to-live

The tester user now has read-only access for testing, while the main user (`ramy_redis`) can write/modify keys.

## Prevention

To prevent similar issues in the future:

1. **Always configure connection timeouts** when using AWS SDK or HTTP clients
2. **Implement retry logic** for network operations
3. **Test ACL permissions** when adding new Redis operations
4. **Validate user input** before type conversion (Number, parseInt, etc.)
5. **Show meaningful error messages** to users

## Deployment

Changes have been applied to:
- ✅ Service layer (S3 client)
- ✅ Redis container (ACL updated and applied)
- ✅ UI components (validation added)

No database migrations or environment variable changes required.

## Rollback

If issues occur:

1. **S3 Client:** Revert `packages/services/src/s3/client.ts` to previous version
2. **Redis ACL:** Edit `.redis/redis-init.sh` and run `pnpm podman:restart`
3. **UI Validation:** Revert `apps/webapp/app/test/components/redis-test-card.tsx`

All changes are backward compatible.
