#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";

const TARGETS = [
  "linux-x64",
  "linux-arm64",
  "darwin-x64",
  "darwin-arm64",
  "windows-x64",
];

const ROOT = resolve(import.meta.dirname, "..");
const ENTRY = resolve(ROOT, "dist", "cli", "index.js");
const OUT_DIR = resolve(ROOT, "dist", "native");

function parseArgs(args) {
  const flags = { target: null, all: false, embed: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--target" && args[i + 1]) {
      flags.target = args[++i];
    } else if (args[i] === "--all") {
      flags.all = true;
    } else if (args[i] === "--embed") {
      flags.embed = true;
    }
  }
  return flags;
}

function collectEmbeddableFiles() {
  const files = [];
  // Tokenizer
  const tokenizer = resolve(ROOT, "data", "deepseek-tokenizer.json.gz");
  if (existsSync(tokenizer)) files.push({ assetName: "tokenizer", path: tokenizer });
  // Tree-sitter grammars
  const grammarDir = resolve(ROOT, "dist", "grammars");
  if (existsSync(grammarDir)) {
    for (const name of readdirSync(grammarDir)) {
      if (name.endsWith(".wasm")) {
        const grammarName = name.replace("tree-sitter-", "").replace(".wasm", "");
        files.push({ assetName: `grammar:${grammarName}`, path: resolve(grammarDir, name) });
      }
    }
  }
  // Dashboard files
  const dashboardDir = resolve(ROOT, "dashboard");
  if (existsSync(dashboardDir)) {
    collectDir(dashboardDir, "dashboard", files);
  }
  // Marketplace overlays
  const overlayDir = resolve(ROOT, "src", "mcp", "marketplace-overlay");
  if (existsSync(overlayDir)) {
    for (const name of readdirSync(overlayDir)) {
      if (name.endsWith(".json")) {
        const lang = name.replace(".json", "");
        files.push({ assetName: `marketplace:${lang}`, path: resolve(overlayDir, name) });
      }
    }
  }
  return files;
}

function collectDir(dir, prefix, files) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, name.name);
    if (name.isDirectory()) {
      collectDir(fullPath, `${prefix}/${name.name}`, files);
    } else if (!name.name.endsWith(".map")) {
      files.push({ assetName: `${prefix}/${name.name}`, path: fullPath });
    }
  }
}

function generateEmbedModule(files) {
  // Self-contained module that stores embedded loaders on globalThis.
  // The main bundle's AssetRegistry reads from globalThis at startup.
  const lines = [];
  for (let i = 0; i < files.length; i++) {
    const { path } = files[i];
    const varName = `_a${i}`;
    const absPath = path.replace(/\\/g, "/");
    lines.push(`import ${varName} from "${absPath}" with { type: "file" };`);
  }
  lines.push("");
  lines.push("const _loaders = new Map([");
  for (let i = 0; i < files.length; i++) {
    const { assetName } = files[i];
    const varName = `_a${i}`;
    lines.push(`  ["${assetName}", () => new Uint8Array(${varName}.bytes())],`);
  }
  lines.push("]);");
  lines.push("");
  lines.push("if (!globalThis.__REASONIX_EMBEDDED) globalThis.__REASONIX_EMBEDDED = _loaders;");
  lines.push("else for (const [k, v] of _loaders) globalThis.__REASONIX_EMBEDDED.set(k, v);");
  lines.push("");
  return lines.join("\n");
}

function buildTarget(target, embed) {
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

  let entryFile = ENTRY;
  const tempFiles = [];

  if (embed) {
    const files = collectEmbeddableFiles();
    if (files.length === 0) {
      console.warn("Warning: --embed specified but no embeddable files found.");
    } else {
      const embedModulePath = resolve(ROOT, "dist", "cli", "embed-assets.js");
      writeFileSync(embedModulePath, generateEmbedModule(files));
      tempFiles.push(embedModulePath);
      // Create wrapper entry that preloads assets before main
      const wrapperPath = resolve(ROOT, "dist", "cli", "native-entry.js");
      writeFileSync(wrapperPath, `import "./embed-assets.js";\nimport "./index.js";\n`);
      tempFiles.push(wrapperPath);
      entryFile = wrapperPath;
      console.log(`  embedded ${files.length} assets`);
    }
  }

  console.log(`Compiling ${target} -> ${outPath}`);
  try {
    execFileSync("bun", ["build", "--compile", "--target", target, entryFile, "--outfile", outPath], {
      stdio: "inherit",
    });
    console.log(`  done: ${outPath}`);
  } finally {
    for (const f of tempFiles) {
      try { unlinkSync(f); } catch { /* cleanup */ }
    }
  }
}

const flags = parseArgs(process.argv.slice(2));

if (flags.all) {
  for (const target of TARGETS) {
    buildTarget(target, flags.embed);
  }
} else if (flags.target) {
  buildTarget(flags.target, flags.embed);
} else {
  console.error("Usage: build-native.mjs --target <platform> | --all [--embed]");
  console.error(`Targets: ${TARGETS.join(", ")}`);
  process.exit(1);
}
