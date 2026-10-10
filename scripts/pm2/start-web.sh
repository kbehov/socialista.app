#!/usr/bin/env bash
# Load web runtime env, then start the staged Next.js standalone server.
# Next's standalone server does not read .env files on its own.
#
# deploy.sh rsyncs the standalone tree to $ROOT/apps/web/, so server.js lives at
# $ROOT/apps/web/apps/web/server.js (monorepo tracing root preserved).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${WEB_ENV_FILE:-$ROOT/env/web.env}"
SERVER="$ROOT/apps/web/apps/web/server.js"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "missing web env file: $ENV_FILE" >&2
  exit 1
fi

if [[ ! -f "$SERVER" ]]; then
  echo "standalone server not found: $SERVER" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-3000}"
# Loopback only. Nginx is the public listener. WEB_HOSTNAME overrides this.
export HOSTNAME="${WEB_HOSTNAME:-127.0.0.1}"

cd "$ROOT/apps/web"
exec node "$SERVER"
