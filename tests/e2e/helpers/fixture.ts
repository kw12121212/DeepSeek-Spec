import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const FIXTURE_DIR = join(import.meta.dirname, "../fixtures/sample-project");

export function createFixtureWorktree(): { dir: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "dspec-e2e-"));
  cpSync(FIXTURE_DIR, dir, { recursive: true });
  return {
    dir,
    cleanup: () => {
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
