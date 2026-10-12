#!/usr/bin/env bash
# Fetch the official Postiz docker-compose (not vendored; AGPL code stays upstream).
set -euo pipefail
REF="${POSTIZ_COMPOSE_REF:-main}"
DIR="$(cd "$(dirname "$0")" && pwd)/upstream"

if [ -d "$DIR" ]; then
  echo "upstream already present at $DIR"; exit 0
fi
git clone --depth 1 --branch "$REF" https://github.com/gitroomhq/postiz-docker-compose "$DIR"
echo "Postiz compose cloned to $DIR (ref: $REF)"
