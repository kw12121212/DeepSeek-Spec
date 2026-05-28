#!/usr/bin/env bash
set -euo pipefail

# setup.sh — one-command bootstrap: install deps, build, bundle, install.
# Produces a standalone single-file bundle installed as `deepseek-spec`.
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

if command -v bun >/dev/null 2>&1; then
  BUN="$(command -v bun)"
  ok "bun $(bun --version) at $BUN"
else
  BUN=""
fi

if command -v node >/dev/null 2>&1; then
  NODE_VERSION="$(node --version)"
  NODE_MAJOR="${NODE_VERSION#v}"
  NODE_MAJOR="${NODE_MAJOR%%.*}"
  if [ "$NODE_MAJOR" -lt 22 ]; then
    die "node $NODE_VERSION found, but >=22 required."
  fi
  ok "node $NODE_VERSION"
else
  die "no bun or node found. Install bun: curl -fsSL https://bun.sh/install | bash"
fi

# ── 2. Install root dependencies ─────────────────────────────────────────────

step "installing dependencies"
if [ -n "${BUN:-}" ]; then
  bun install --frozen-lockfile 2>/dev/null || bun install
else
  npm ci 2>/dev/null || npm install
fi
ok "dependencies installed"

# ── 3. Install workspace dependencies ────────────────────────────────────────

for ws in dashboard desktop packages/core-utils packages/dsnix packages/ink; do
  if [ -f "$ws/package.json" ]; then
    step "installing $ws"
    if [ -n "${BUN:-}" ]; then
      bun install --cwd "$ws" 2>/dev/null || true
    else
      (cd "$ws" && npm ci --ignore-scripts 2>/dev/null) || true
    fi
    ok "$ws"
  fi
done

# ── 4. Build ─────────────────────────────────────────────────────────────────

step "building dashboard"
if [ -n "${BUN:-}" ]; then
  bun run build:dashboard
else
  npm run build:dashboard
fi
ok "dashboard"

step "bundling with tsup"
if [ -n "${BUN:-}" ]; then
  bun x tsup
else
  npx tsup
fi
ok "tsup"

step "copying vendor assets"
node scripts/copy-dashboard-vendor-css.mjs
node scripts/copy-tree-sitter-grammars.mjs
ok "vendor assets"

# ── 5. Create single-file bundle ─────────────────────────────────────────────

step "creating standalone bundle"
ESBUILD="node_modules/.bin/esbuild"
if [ ! -x "$ESBUILD" ]; then
  ESBUILD="esbuild"
fi

"$ESBUILD" dist/cli/index.js \
  --bundle \
  --platform=node \
  --format=esm \
  --target=node22 \
  --outfile=dist/bundle/deepseek-spec.mjs \
  --external:react-devtools-core \
  --external:inspector/promises \
  --external:readline/promises \
  --log-level=error

ok "standalone bundle ($(du -h dist/bundle/deepseek-spec.mjs | cut -f1))"

# ── 6. Install ────────────────────────────────────────────────────────────────

step "installing to $PREFIX"

LIB_DIR="$PREFIX/lib/deepseek-spec"
BIN_DIR="$PREFIX/bin"
mkdir -p "$LIB_DIR" "$BIN_DIR"

# Copy bundle
cp dist/bundle/deepseek-spec.mjs "$LIB_DIR/app.mjs"

# Create launcher script
cat > "$BIN_DIR/deepseek-spec" << 'LAUNCHER'
#!/usr/bin/env bash
exec node "$(dirname "$0")/../lib/deepseek-spec/app.mjs" "$@"
LAUNCHER
chmod +x "$BIN_DIR/deepseek-spec"

ok "installed $BIN_DIR/deepseek-spec"

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
