# Shared settings for the system cron wrappers.
# Override by exporting the variable before the script runs.

API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:8080}"
LOG_DIR="${LOG_DIR:-/var/log/socialista}"
ENV_FILE="${ENV_FILE:-/var/www/socialista/apps/api/.env}"
LOCK_DIR="${LOCK_DIR:-$LOG_DIR}"
