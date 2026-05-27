import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function findPkgRoot(start: string): string {
  let dir = start;
  while (true) {
    if (existsSync(resolve(dir, "package.json"))) return dir;
    const parent = resolve(dir, "..");
    if (parent === dir) return start;
    dir = parent;
  }
}

export function resolveEnginePath(): string {
  return resolve(findPkgRoot(__dirname), "vendor/strict-spec-driven.js");
}
