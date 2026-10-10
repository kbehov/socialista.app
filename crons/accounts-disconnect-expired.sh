#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
# shellcheck source=_common.sh
source ./_common.sh
run_cron "accounts/disconnect-expired"
