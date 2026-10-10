#!/usr/bin/env bash
# Helpers for the Socialista cron wrappers. Source this file; do not execute it.

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  echo "source this file; do not execute it" >&2
  exit 1
fi

_CRON_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=config.sh
source "$_CRON_DIR/config.sh"

load_internal_secret() {
  local line value
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "API env file not found: $ENV_FILE" >&2
    return 1
  fi

  line="$(grep -E '^[[:space:]]*INTERNAL_API_SECRET=' "$ENV_FILE" | tail -n 1 || true)"
  # Strip an optional "export " prefix.
  line="${line#export }"
  line="${line#"${line%%[![:space:]]*}"}"

  if [[ -z "$line" ]]; then
    echo "INTERNAL_API_SECRET is missing in $ENV_FILE" >&2
    return 1
  fi

  value="${line#INTERNAL_API_SECRET=}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  if [[ ${#value} -ge 2 && "${value:0:1}" == '"' && "${value: -1}" == '"' ]]; then
    value="${value:1:${#value}-2}"
  elif [[ ${#value} -ge 2 && "${value:0:1}" == "'" && "${value: -1}" == "'" ]]; then
    value="${value:1:${#value}-2}"
  fi

  if [[ -z "$value" ]]; then
    echo "INTERNAL_API_SECRET is empty in $ENV_FILE" >&2
    return 1
  fi

  INTERNAL_API_SECRET="$value"
}

# POST one /cron/* endpoint. Overlapping runs exit 0 so cron does not mail
# every minute while a previous sweep is still in flight.
run_cron() {
  local path="$1"
  local name="${path//\//-}"
  local logfile="$LOG_DIR/cron-${name}.log"
  local lockfile="$LOCK_DIR/socialista-cron-${name}.lock"
  local tmp http_code curl_exit

  load_internal_secret
  mkdir -p "$LOG_DIR" "$(dirname "$lockfile")"

  exec 9>"$lockfile"
  if ! flock -n 9; then
    printf '%s skip /cron/%s (already running)\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$path" >>"$logfile"
    return 0
  fi

  tmp="$(mktemp)"

  set +e
  http_code="$(
    curl -fsS -X POST \
      --max-time 300 \
      --retry 2 \
      --retry-connrefused \
      --retry-delay 2 \
      -H "x-internal-api-secret: ${INTERNAL_API_SECRET}" \
      -H "content-length: 0" \
      -o "$tmp" \
      -w '%{http_code}' \
      "${API_BASE_URL%/}/cron/${path}"
  )"
  curl_exit=$?
  set -e

  {
    printf '%s POST /cron/%s curl_exit=%s http=%s\n' \
      "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$path" "$curl_exit" "${http_code:-none}"
    cat "$tmp"
    printf '\n'
  } >>"$logfile"
  rm -f "$tmp"

  if [[ "$curl_exit" -ne 0 ]]; then
    echo "cron /cron/${path} failed (curl exit ${curl_exit}); see ${logfile}" >&2
    return "$curl_exit"
  fi
}
