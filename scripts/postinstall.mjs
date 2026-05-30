#!/usr/bin/env node
// No-op when run from the published tarball (no dashboard/package.json shipped) —
// only the git checkout has workspace deps to install.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

if (!existsSync("dashboard/package.json")) process.exit(0);

execSync("bun install --cwd dashboard", { stdio: "inherit" });
execSync("bun install --cwd desktop", { stdio: "inherit" });
