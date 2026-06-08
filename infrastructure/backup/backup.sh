#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# MTC Group — Daily RDS Backup to S3
# Run via cron: 0 3 * * * /opt/mtc/backup.sh >> /var/log/mtc-backup.log 2>&1
#
# Required env vars:
#   DB_HOST       — RDS endpoint
#   DB_NAME       — database name (default: mtcdb)
#   DB_USER       — database username
#   PGPASSWORD    — database password (set in environment, not here)
#   S3_BUCKET     — destination bucket (e.g. mtc-prod-documents)
#   AWS_REGION    — AWS region
#   GPG_KEY_ID    — GPG key fingerprint for encryption (optional but recommended)
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

: "${DB_HOST:?DB_HOST is required}"
: "${DB_NAME:=mtcdb}"
: "${DB_USER:?DB_USER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
: "${S3_BUCKET:?S3_BUCKET is required}"
: "${AWS_REGION:=us-east-1}"

TIMESTAMP=$(date -u +"%Y%m%d_%H%M%S")
DUMP_FILE="/tmp/mtc_backup_${TIMESTAMP}.sql.gz"
ENCRYPTED_FILE="${DUMP_FILE}.gpg"
S3_KEY="backups/rds/${TIMESTAMP}/mtc_backup_${TIMESTAMP}.sql.gz"

log() { echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*"; }

log "Starting backup of ${DB_NAME} from ${DB_HOST}"

# Dump and compress in one pipe
pg_dump \
  --host="${DB_HOST}" \
  --port=5432 \
  --username="${DB_USER}" \
  --dbname="${DB_NAME}" \
  --format=plain \
  --no-password \
  --verbose \
  | gzip -9 > "${DUMP_FILE}"

log "Dump complete: $(du -sh "${DUMP_FILE}" | cut -f1)"

# Encrypt if GPG key is configured
if [[ -n "${GPG_KEY_ID:-}" ]]; then
  gpg --batch --yes --trust-model always \
      --recipient "${GPG_KEY_ID}" \
      --output "${ENCRYPTED_FILE}" \
      --encrypt "${DUMP_FILE}"
  rm -f "${DUMP_FILE}"
  UPLOAD_FILE="${ENCRYPTED_FILE}"
  S3_KEY="${S3_KEY}.gpg"
  log "Encrypted with GPG key: ${GPG_KEY_ID}"
else
  UPLOAD_FILE="${DUMP_FILE}"
  log "WARNING: Backup is not encrypted. Set GPG_KEY_ID for production."
fi

# Upload to S3 with server-side encryption
aws s3 cp "${UPLOAD_FILE}" "s3://${S3_BUCKET}/${S3_KEY}" \
  --region "${AWS_REGION}" \
  --sse AES256 \
  --storage-class STANDARD_IA

log "Uploaded to s3://${S3_BUCKET}/${S3_KEY}"

# Remove local temp file
rm -f "${UPLOAD_FILE}"

# Delete backups older than 30 days
log "Pruning backups older than 30 days..."
CUTOFF=$(date -u -d "30 days ago" +"%Y-%m-%d" 2>/dev/null || date -u -v-30d +"%Y-%m-%d")
aws s3 ls "s3://${S3_BUCKET}/backups/rds/" --region "${AWS_REGION}" \
  | awk '{print $2}' \
  | grep -E '^[0-9]{8}_' \
  | while read -r prefix; do
      dir_date="${prefix:0:4}-${prefix:4:2}-${prefix:6:2}"
      if [[ "${dir_date}" < "${CUTOFF}" ]]; then
        log "Deleting old backup: ${prefix}"
        aws s3 rm "s3://${S3_BUCKET}/backups/rds/${prefix}" \
          --region "${AWS_REGION}" --recursive
      fi
    done

log "Backup complete."
