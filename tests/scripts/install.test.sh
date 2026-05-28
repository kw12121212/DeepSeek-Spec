#!/usr/bin/env sh
# Tests for scripts/install.sh — runs in a temp directory with fixture binaries.

set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
INSTALL_SH="$ROOT_DIR/scripts/install.sh"

PASS=0
FAIL=0

assert_exit() {
  label="$1"
  expected="$2"
  shift 2
  actual=0
  "$@" >/dev/null 2>&1 || actual=$?
  if [ "$actual" -eq "$expected" ]; then
    echo "  PASS: $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $label (expected exit $expected, got $actual)"
    FAIL=$((FAIL + 1))
  fi
}

assert_file() {
  label="$1"
  path="$2"
  if [ -f "$path" ] && [ -x "$path" ]; then
    echo "  PASS: $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $label (file missing or not executable: $path)"
    FAIL=$((FAIL + 1))
  fi
}

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

echo "testing install.sh"

# --- Test: missing binary exits non-zero ---
assert_exit "missing binary exits non-zero" 1 sh "$INSTALL_SH" --prefix "$TMPDIR/missing-prefix"

# --- Test: successful install with --prefix ---
TARGET="linux-x64"
FAKE_BINDIR="$ROOT_DIR/dist/native/$TARGET"
FAKE_BINARY="$FAKE_BINDIR/reasonix"
mkdir -p "$FAKE_BINDIR"
echo "#!/bin/sh" > "$FAKE_BINARY"
echo "echo 0.52.0" >> "$FAKE_BINARY"
chmod +x "$FAKE_BINARY"

assert_exit "install with --prefix succeeds" 0 sh "$INSTALL_SH" --prefix "$TMPDIR/test-prefix"
assert_file "binary copied and executable" "$TMPDIR/test-prefix/reasonix"

# Cleanup fake binary
rm -f "$FAKE_BINARY"
rmdir "$FAKE_BINDIR" 2>/dev/null || true

echo ""
echo "$PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || exit 1
