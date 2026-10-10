#!/usr/bin/env bash
# Build Socialista locally and deploy it to a VPS over SSH.
#
# Usage:
#   ./deploy.sh                         # build and deploy web + api
#   ./deploy.sh --web                   # web only
#   ./deploy.sh --api                   # api only
#   ./deploy.sh --all --skip-build      # rsync the last local build
#
# Configure with env vars (or edit the defaults below):
#   VPS_USER, VPS_HOST, REMOTE_DIR, SSH_OPTS, WEB_URL, API_URL
#
# Before the first deploy:
#   - apps/web/.env.production          (see apps/web/.env.production.example)
#   - $REMOTE_DIR/apps/api/.env         on the VPS (API loads this itself)
#   - $REMOTE_DIR/env/web.env           on the VPS (sourced by scripts/pm2/start-web.sh)
#   - node, pnpm, and pm2 installed on the VPS; pm2 startup already configured
#
# Fallback if `pnpm deploy` misbehaves on a future pnpm release: rsync the repo
# (minus node_modules and .env) to the VPS and build there instead of staging
# a pruned bundle locally:
#   rsync -az --delete --exclude node_modules --exclude .env --exclude '.env.*' \
#     --exclude .next --exclude dist \
#     ./ "$VPS_USER@$VPS_HOST:$REMOTE_DIR/src/"
#   ssh "$VPS_USER@$VPS_HOST" \
#     "cd $REMOTE_DIR/src && pnpm install --frozen-lockfile && pnpm build:api && pnpm build:web"
# Then point PM2 at the on-server build output and restart. The local
# `pnpm deploy` path below is what this script actually runs.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

VPS_USER="${VPS_USER:-deploy}"
VPS_HOST="${VPS_HOST:-}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/socialista}"
SSH_OPTS="${SSH_OPTS:-}"
WEB_URL="${WEB_URL:-https://socialista.app/}"
API_URL="${API_URL:-https://api.socialista.app/}"

DEPLOY_WEB=0
DEPLOY_API=0
SKIP_BUILD=0
EXPLICIT_TARGET=0

if [[ -t 1 ]]; then
  C_BLUE=$'\033[34m'
  C_GREEN=$'\033[32m'
  C_RED=$'\033[31m'
  C_RESET=$'\033[0m'
else
  C_BLUE=''
  C_GREEN=''
  C_RED=''
  C_RESET=''
fi

step() { printf '%s==>%s %s\n' "$C_BLUE" "$C_RESET" "$*"; }
ok() { printf '%s ok%s %s\n' "$C_GREEN" "$C_RESET" "$*"; }
die() { printf '%serror:%s %s\n' "$C_RED" "$C_RESET" "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Usage:
  ./deploy.sh                         # build and deploy web + api
  ./deploy.sh --web                   # web only
  ./deploy.sh --api                   # api only
  ./deploy.sh --all --skip-build      # rsync the last local build

Configure with env vars: VPS_USER, VPS_HOST, REMOTE_DIR, SSH_OPTS, WEB_URL, API_URL
EOF
  exit 2
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --web) DEPLOY_WEB=1; EXPLICIT_TARGET=1 ;;
    --api) DEPLOY_API=1; EXPLICIT_TARGET=1 ;;
    --all) DEPLOY_WEB=1; DEPLOY_API=1; EXPLICIT_TARGET=1 ;;
    --skip-build) SKIP_BUILD=1 ;;
    -h|--help) usage ;;
    *) die "unknown argument: $1 (try --help)" ;;
  esac
  shift
done

if [[ "$EXPLICIT_TARGET" -eq 0 ]]; then
  DEPLOY_WEB=1
  DEPLOY_API=1
fi

[[ -n "$VPS_HOST" ]] || die "set VPS_HOST (and optionally VPS_USER, REMOTE_DIR, SSH_OPTS)"

# SSH_OPTS is a string of extra ssh flags, e.g. "-i ~/.ssh/socialista -p 22".
ssh_base=(ssh)
if [[ -n "$SSH_OPTS" ]]; then
  # shellcheck disable=SC2206
  ssh_extra=($SSH_OPTS)
  ssh_base+=("${ssh_extra[@]}")
fi
remote() {
  "${ssh_base[@]}" "$VPS_USER@$VPS_HOST" "$@"
}
RSYNC_RSH="${ssh_base[*]}"

stage_web() {
  local stage="$ROOT/deploy/dist/web"
  [[ -f apps/web/.next/standalone/apps/web/server.js ]] || die "missing apps/web/.next/standalone — run a web build first"
  step "staging Next.js standalone"
  rm -rf "$stage"
  mkdir -p "$stage"
  cp -R apps/web/.next/standalone/. "$stage/"
  mkdir -p "$stage/apps/web/.next"
  rm -rf "$stage/apps/web/.next/static"
  cp -R apps/web/.next/static "$stage/apps/web/.next/static"
  if [[ -d apps/web/public ]]; then
    rm -rf "$stage/apps/web/public"
    cp -R apps/web/public "$stage/apps/web/public"
  fi
  [[ -f "$stage/apps/web/server.js" ]] || die "staged standalone is missing apps/web/server.js"
}

# pnpm deploy respects .gitignore, and the repo ignores `dist`, so the API's
# compiled output (and any workspace package that does not whitelist `files`)
# would be omitted. Copy those dist trees in after the pruned install.
overlay_workspace_dist() {
  local name="$1"
  local src="$2"
  local stage="$ROOT/deploy/dist/api"
  local dest dir found=0

  [[ -d "$src" ]] || die "missing $src — build the workspace package first"
  while IFS= read -r dest; do
    [[ -n "$dest" ]] || continue
    dir="$(dirname "$dest")"
    rm -rf "$dir/dist"
    cp -R "$src" "$dir/dist"
    found=1
  done < <(find "$stage/node_modules" -path "*/node_modules/${name}/package.json" -print 2>/dev/null || true)
  [[ "$found" -eq 1 ]] || die "pnpm deploy did not include ${name}; use the in-script fallback at the top of deploy.sh"
}

overlay_api_dists() {
  local stage="$ROOT/deploy/dist/api"

  [[ -d apps/api/dist ]] || die "missing apps/api/dist — run pnpm build:api first"
  rm -rf "$stage/dist"
  cp -R apps/api/dist "$stage/dist"
  [[ -f "$stage/dist/index.js" ]] || die "staged API is missing dist/index.js"

  overlay_workspace_dist "@socialista/types" "$ROOT/packages/types/dist"
  overlay_workspace_dist "@socialista/db" "$ROOT/packages/db/dist"
  overlay_workspace_dist "@socialista/ai" "$ROOT/packages/ai/dist"
  overlay_workspace_dist "@socialista/email" "$ROOT/packages/email/dist"
  overlay_workspace_dist "@socialista/trigger" "$ROOT/packages/trigger/dist"
}

stage_api() {
  local stage="$ROOT/deploy/dist/api"
  local tmp="${TMPDIR:-/tmp}/socialista-api-deploy"
  step "pruning API production dependencies (pnpm deploy)"
  # Deploy outside the repo. Some pnpm versions reject a target inside the workspace.
  rm -rf "$tmp"
  # See the header comment if this command fails on a future pnpm release.
  pnpm --filter '@socialista/api' deploy --prod "$tmp"
  rm -rf "$stage"
  mkdir -p "$ROOT/deploy/dist"
  mv "$tmp" "$stage"
  overlay_api_dists
}

rsync_tree() {
  local src="$1"
  local dest="$2"
  step "rsync $src -> $VPS_HOST:$dest"
  remote "mkdir -p '$dest'"
  rsync -az --delete \
    --exclude '.env' \
    --exclude '.env.*' \
    --exclude '.DS_Store' \
    -e "$RSYNC_RSH" \
    "$src" "$VPS_USER@$VPS_HOST:$dest"
}

check_http() {
  local url="$1"
  local allow_404="${2:-0}"
  local code
  # The API has no GET / handler (it returns 404). A response below 500 still
  # means nginx reached the process. The web app must return 2xx or 3xx.
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 --retry 5 --retry-delay 2 --retry-connrefused "$url" || true)"
  if [[ -z "$code" || "$code" == "000" || "$code" =~ ^5 ]]; then
    die "health check failed: $url -> ${code:-no response}"
  fi
  if [[ "$allow_404" -eq 0 && ! "$code" =~ ^[23] ]]; then
    die "health check failed: $url -> $code"
  fi
  ok "$url -> $code"
}

if [[ "$DEPLOY_WEB" -eq 1 && "$SKIP_BUILD" -eq 0 ]]; then
  [[ -f apps/web/.env.production ]] || die "create apps/web/.env.production from apps/web/.env.production.example before building"
  step "building web (standalone)"
  pnpm build:web
fi

if [[ "$DEPLOY_API" -eq 1 && "$SKIP_BUILD" -eq 0 ]]; then
  step "building api"
  pnpm build:api
fi

if [[ "$DEPLOY_WEB" -eq 1 ]]; then
  stage_web
fi
if [[ "$DEPLOY_API" -eq 1 ]]; then
  if [[ "$SKIP_BUILD" -eq 1 && -d "$ROOT/deploy/dist/api/node_modules" && -f apps/api/dist/index.js ]]; then
    step "reusing pruned API dependencies, refreshing dist"
    overlay_api_dists
  else
    stage_api
  fi
fi

step "preparing remote directories"
remote "mkdir -p '$REMOTE_DIR/apps' '$REMOTE_DIR/env' '$REMOTE_DIR/scripts' && mkdir -p /var/log/socialista"

if [[ "$DEPLOY_WEB" -eq 1 ]]; then
  rsync_tree "$ROOT/deploy/dist/web/" "$REMOTE_DIR/apps/web/"
fi
if [[ "$DEPLOY_API" -eq 1 ]]; then
  rsync_tree "$ROOT/deploy/dist/api/" "$REMOTE_DIR/apps/api/"
fi

step "syncing pm2 and cron files"
rsync -az \
  -e "$RSYNC_RSH" \
  "$ROOT/ecosystem.config.cjs" "$VPS_USER@$VPS_HOST:$REMOTE_DIR/ecosystem.config.cjs"
rsync -az \
  -e "$RSYNC_RSH" \
  "$ROOT/scripts/pm2/" "$VPS_USER@$VPS_HOST:$REMOTE_DIR/scripts/pm2/"
rsync -az \
  -e "$RSYNC_RSH" \
  "$ROOT/crons/" "$VPS_USER@$VPS_HOST:$REMOTE_DIR/crons/"
remote "chmod +x '$REMOTE_DIR/scripts/pm2/'*.sh '$REMOTE_DIR/crons/'*.sh"

only=()
if [[ "$DEPLOY_API" -eq 1 ]]; then
  only+=("socialista-api")
fi
if [[ "$DEPLOY_WEB" -eq 1 ]]; then
  only+=("socialista-web")
fi
only_csv="$(IFS=,; echo "${only[*]}")"

step "reloading pm2 ($only_csv)"
remote "cd '$REMOTE_DIR' && SOCIALISTA_ROOT='$REMOTE_DIR' pm2 startOrReload ecosystem.config.cjs --only '$only_csv' && pm2 save"

step "health checks"
sleep 2
if [[ "$DEPLOY_API" -eq 1 ]]; then
  check_http "$API_URL" 1
fi
if [[ "$DEPLOY_WEB" -eq 1 ]]; then
  check_http "$WEB_URL" 0
fi

ok "deploy finished"
