#!/usr/bin/env bash
# Register GitHub self-hosted runner for Spybot (Hostinger VPS).
# Usage:
#   export RUNNER_REG_TOKEN='<GitHub → Spybot repo → Settings → Actions → Runners → New>'
#   sudo bash /srv/Spybot/deploy/scripts/install-github-runner.sh

set -euo pipefail

export RUNNER_ALLOW_RUNASROOT=1

RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner-spybot}"
REPO_URL="https://github.com/Akhlaque-Ur-Rahman/Spybot"

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

: "${RUNNER_REG_TOKEN:?Get token from GitHub → Settings → Actions → Runners → New self-hosted runner}"

RUNNER_VERSION="$(curl -sf https://api.github.com/repos/actions/runner/releases/latest \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['tag_name'].lstrip('v'))")"

echo "==> Download runner ${RUNNER_VERSION}"
curl -sfL -o "actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" \
  "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
tar xzf "actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
rm -f "actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"

./config.sh --url "$REPO_URL" \
  --token "${RUNNER_REG_TOKEN}" \
  --name spybot-vps \
  --labels spybot,self-hosted,Linux,X64 \
  --unattended \
  --replace

./svc.sh install
./svc.sh start
./svc.sh status

echo "Verify: GitHub → Akhlaque-Ur-Rahman/Spybot → Settings → Actions → Runners → spybot-vps Idle"
