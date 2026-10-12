#!/usr/bin/env bash
# Fetch the official Supabase docker setup at a pinned ref (not vendored into this repo).
set -euo pipefail
REF="${SUPABASE_REF:-master}"   # pin to a self-hosted release tag in production
DIR="$(cd "$(dirname "$0")" && pwd)/upstream"

if [ -d "$DIR" ]; then
  echo "upstream already present at $DIR"; exit 0
fi
tmp="$(mktemp -d)"
git clone --depth 1 --branch "$REF" https://github.com/supabase/supabase "$tmp"
mkdir -p "$DIR"
cp -r "$tmp/docker/." "$DIR/"
rm -rf "$tmp"
echo "Supabase docker files copied to $DIR (ref: $REF)"
