#!/usr/bin/env bash
# One-time: ensure VPS accepts GitHub Actions SSH deploy key.
# Copy the printed private key into GitHub → Spybot → Settings → Secrets → SSH_PRIVATE_KEY
set -euo pipefail
KEY="${KEY:-/root/.ssh/id_ed25519}"
PUB="${KEY}.pub"
install -m 600 -m 600 "$KEY" 2>/dev/null || true
grep -qF "$(cat "$PUB")" /root/.ssh/authorized_keys 2>/dev/null || cat "$PUB" >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
echo "==> Public key added to /root/.ssh/authorized_keys"
echo "==> Set GitHub secrets:"
echo "    DEPLOY_HOST=187.127.145.85"
echo "    DEPLOY_USER=root"
echo "    DEPLOY_PATH=/srv/Spybot"
echo "    SSH_PRIVATE_KEY = contents of: $KEY"
echo ""
echo "----- BEGIN PRIVATE KEY (paste into GitHub secret) -----"
cat "$KEY"
echo "----- END PRIVATE KEY -----"
