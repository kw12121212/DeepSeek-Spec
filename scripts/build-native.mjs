#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";

const TARGETS = [
  "linux-x64",
  "linux-arm64",
  "darwin-x64",
  "darwin-arm64",
  "windows-x64",
];

const ENTRY = resolve(import.meta.dirname, "..", "dist", "cli", "index.js");
const OUT_DIR = resolve(import.meta.dirname, "..", "dist", "native");

function parseArgs(args) {
  const flags = { target: null, all: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--target" && args[i + 1]) {
      flags.target = args[++i];
    } else if (args[i] === "--all") {
      flags.all = true;
    }
  }
  return flags;
}

function buildTarget(target) {
  if (!TARGETS.includes(target)) {
    console.error(`Unknown target "${target}". Valid targets: ${TARGETS.join(", ")}`);
    process.exit(1);
  }

  if (!existsSync(ENTRY)) {
    console.error(`Entry point not found: ${ENTRY}`);
    console.error("Run `bun run build` first to produce the tsup output.");
    process.exit(1);
  }

  const ext = target.startsWith("windows-") ? ".exe" : "";
  const outPath = join(OUT_DIR, target, `reasonix${ext}`);

  mkdirSync(join(OUT_DIR, target), { recursive: true });

  console.log(`Compiling ${target} -> ${outPath}`);
  execFileSync("bun", ["build", "--compile", "--target", target, ENTRY, "--outfile", outPath], {
    stdio: "inherit",
  });
  console.log(`  done: ${outPath}`);
}

const flags = parseArgs(process.argv.slice(2));

if (flags.all) {
  for (const target of TARGETS) {
    buildTarget(target);
  }
} else if (flags.target) {
  buildTarget(flags.target);
} else {
  console.error("Usage: build-native.mjs --target <platform> | --all");
  console.error(`Targets: ${TARGETS.join(", ")}`);
  process.exit(1);
}
