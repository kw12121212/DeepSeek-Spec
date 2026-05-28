#!/usr/bin/env bash
set -euo pipefail

# setup.sh — one-command bootstrap: install deps, build, compile, install.
# Produces a standalone single binary with all assets embedded.
# Requires bun (bun build --compile).
# Usage: ./setup.sh [--prefix <path>]
#   Defaults to ~/.local

PREFIX="${PREFIX:-$HOME/.local}"

while [ $# -gt 0 ]; do
  case "$1" in
    --prefix)
      [ $# -ge 2 ] || { echo "error: --prefix requires an argument" >&2; exit 1; }
      PREFIX="$2"
      shift 2
      ;;
    *)
      echo "usage: setup.sh [--prefix <path>]" >&2
      exit 1
      ;;
  esac
done

cd "$(dirname "$0")"
ROOT="$(pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

step() { printf "${CYAN}▸ %s${NC}\n" "$1"; }
ok()   { printf "${GREEN}✓ %s${NC}\n" "$1"; }
die()  { printf "${RED}✗ %s${NC}\n" "$1" >&2; exit 1; }

# ── 1. Runtime check ─────────────────────────────────────────────────────────

step "checking runtime"

if ! command -v bun >/dev/null 2>&1; then
  die "bun not found. Install bun: curl -fsSL https://bun.sh/install | bash"
fi
ok "bun $(bun --version) at $(command -v bun)"

# ── 2. Detect platform target ────────────────────────────────────────────────

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$OS-$ARCH" in
  linux-x86_64)  TARGET="bun-linux-x64"   ;;
  linux-aarch64) TARGET="bun-linux-arm64" ;;
  linux-arm64)   TARGET="bun-linux-arm64" ;;
  darwin-x86_64) TARGET="bun-darwin-x64"  ;;
  darwin-arm64)  TARGET="bun-darwin-arm64" ;;
  *) die "unsupported platform $OS-$ARCH" ;;
esac
ok "target $TARGET"

# ── 3. Install dependencies ──────────────────────────────────────────────────

step "installing dependencies"
bun install --frozen-lockfile 2>/dev/null || bun install
ok "dependencies installed"

step "installing workspace deps"
for ws in dashboard desktop packages/core-utils packages/dsnix packages/ink; do
  if [ -f "$ws/package.json" ]; then
    bun install --cwd "$ws" 2>/dev/null || true
  fi
done
ok "workspace deps"

# ── 4. Build ─────────────────────────────────────────────────────────────────

step "building dashboard"
bun run build:dashboard
ok "dashboard"

step "bundling with tsup"
bun x tsup
ok "tsup"

step "copying vendor assets"
node scripts/copy-dashboard-vendor-css.mjs
node scripts/copy-tree-sitter-grammars.mjs
ok "vendor assets"

# ── 5. Compile single binary with embedded assets ────────────────────────────

step "compiling native binary (embedded assets)"
BINARY_NAME=deepseek-spec node scripts/build-native.mjs --target "$TARGET" --embed
ok "native binary"

# ── 6. Install ────────────────────────────────────────────────────────────────

step "installing to $PREFIX"

BIN_DIR="$PREFIX/bin"
mkdir -p "$BIN_DIR"

EXT=""
[ "$TARGET" = "bun-windows-x64" ] && EXT=".exe"
cp "dist/native/$TARGET/deepseek-spec$EXT" "$BIN_DIR/deepseek-spec$EXT"
chmod +x "$BIN_DIR/deepseek-spec$EXT"

ok "installed $BIN_DIR/deepseek-spec$EXT ($(du -h "$BIN_DIR/deepseek-spec$EXT" | cut -f1))"

# Ensure bin dir is in PATH
case ":$PATH:" in
  *":$BIN_DIR:"*) ok "PATH already contains $BIN_DIR" ;;
  *)
    case "$SHELL" in
      *zsh)  SHELL_RC="$HOME/.zshrc" ;;
      *bash) SHELL_RC="$HOME/.bashrc" ;;
      *)     SHELL_RC="$HOME/.profile" ;;
    esac
    echo "" >> "$SHELL_RC"
    echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$SHELL_RC"
    ok "added $BIN_DIR to PATH in $SHELL_RC (restart shell to apply)"
    ;;
esac

printf "\n${GREEN}Done!${NC} Run ${CYAN}deepseek-spec${NC} to start.\n"
