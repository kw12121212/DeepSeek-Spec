#!/usr/bin/env sh
set -eu

# Install a locally built Reasonix native binary to ~/.local/bin (or --prefix).
# Usage: scripts/install.sh [--prefix <path>]

PREFIX="${PREFIX:-$HOME/.local/bin}"

while [ $# -gt 0 ]; do
  case "$1" in
    --prefix)
      [ $# -ge 2 ] || { echo "error: --prefix requires an argument" >&2; exit 1; }
      PREFIX="$2"
      shift 2
      ;;
    *)
      echo "usage: install.sh [--prefix <path>]" >&2
      exit 1
      ;;
  esac
done

# Detect OS and arch
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$OS-$ARCH" in
  linux-x86_64)  TARGET="linux-x64"   ;;
  linux-aarch64) TARGET="linux-arm64" ;;
  linux-arm64)   TARGET="linux-arm64" ;;
  darwin-x86_64) TARGET="darwin-x64"  ;;
  darwin-arm64)  TARGET="darwin-arm64" ;;
  *)
    echo "error: unsupported platform $OS-$ARCH" >&2
    exit 1
    ;;
esac

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BINARY="$ROOT_DIR/dist/native/$TARGET/reasonix"

if [ ! -f "$BINARY" ]; then
  echo "error: native binary not found at $BINARY" >&2
  echo "Run 'bun run build:native --target $TARGET' first." >&2
  exit 1
fi

# Create install directory
mkdir -p "$PREFIX"

# Copy and make executable
DEST="$PREFIX/reasonix"
cp "$BINARY" "$DEST"
chmod +x "$DEST"

echo "installed reasonix to $DEST"
