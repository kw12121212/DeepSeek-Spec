#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const PKG = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
const EXPECTED_VERSION = PKG.version;

const args = process.argv.slice(2);
let target = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--target" && args[i + 1]) {
    target = args[++i];
  }
}

if (!target) {
  const os = process.platform;
  const arch = process.arch;
  const map = {
    "linux-x64": "linux-x64",
    "linux-arm64": "linux-arm64",
    "darwin-x64": "darwin-x64",
    "darwin-arm64": "darwin-arm64",
    "win32-x64": "windows-x64",
  };
  target = map[`${os}-${arch}`];
}

if (!target) {
  console.error(`Cannot detect native target for ${process.platform}-${process.arch}`);
  console.error("Pass --target <platform> explicitly.");
  process.exit(1);
}

const ext = target.startsWith("windows-") ? ".exe" : "";
const binary = resolve(ROOT, "dist", "native", target, `reasonix${ext}`);

if (!existsSync(binary)) {
  console.error(`Binary not found: ${binary}`);
  console.error("Run 'bun run build:native --target <platform>' first.");
  process.exit(1);
}

let passed = 0;
let failed = 0;

function check(label, fn) {
  try {
    fn();
    console.log(`  PASS: ${label}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${label}: ${err.message}`);
    failed++;
  }
}

console.log(`smoke-testing ${binary}`);

check("--version output matches package.json", () => {
  const output = execFileSync(binary, ["--version"], { encoding: "utf8" }).trim();
  if (output !== EXPECTED_VERSION) {
    throw new Error(`expected '${EXPECTED_VERSION}', got '${output}'`);
  }
});

check("--help exits with code 0", () => {
  execFileSync(binary, ["--help"], { encoding: "utf8" });
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
