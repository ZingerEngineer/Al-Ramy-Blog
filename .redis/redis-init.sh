#!/bin/sh
set -e

ACL_FILE="/data/users.acl"

cat > "$ACL_FILE" <<EOF
user default on nopass ~* &* +@all

user ${REDIS_USER} on >${REDIS_PASSWORD} ~* resetchannels -@all +get +set +del +mget +mset +exists +ttl +expire +keys +scan

user ${REDIS_TESTER} on >${REDIS_TESTER_PASSWORD} ~* resetchannels -@all +ping
EOF

chmod 644 "$ACL_FILE"

exec redis-server \
  --aclfile "$ACL_FILE" \
  --dir /data \
  --appendonly yes \
  --appendfsync everysec \
  --save 900 1 \
  --save 300 10 \
  --save 60 10000 \
  --dbfilename dump.rdb