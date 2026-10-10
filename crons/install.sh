#!/usr/bin/env bash
# Install (or replace) the Socialista block in the current user's crontab.
# Safe to run more than once. Does not touch lines outside the marker block.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_common.sh
source "$DIR/_common.sh"

load_internal_secret >/dev/null
mkdir -p "$LOG_DIR"
chmod 755 "$LOG_DIR" || true

BEGIN="# >>> socialista crons"
END="# <<< socialista crons"

block="$(cat <<EOF
$BEGIN
# Installed by $DIR/install.sh — edit crons/crontab.txt and re-run to change.
* * * * * $DIR/posts-publish-due.sh
*/15 * * * * $DIR/accounts-refresh-expiring.sh
17 3 * * * $DIR/accounts-disconnect-expired.sh
7 */6 * * * $DIR/analytics-sweep.sh
37 */6 * * * $DIR/analytics-posts-sweep.sh
$END
EOF
)"

current="$(crontab -l 2>/dev/null || true)"
cleaned="$(printf '%s\n' "$current" | awk -v begin="$BEGIN" -v end="$END" '
  $0 == begin { skip = 1; next }
  $0 == end { skip = 0; next }
  skip != 1 { print }
')"

{
  printf '%s\n' "$cleaned" | sed '/^[[:space:]]*$/d'
  printf '\n%s\n' "$block"
} | crontab -

echo "installed socialista crons for $(id -un)"
echo "logs: $LOG_DIR/cron-*.log"
