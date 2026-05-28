import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { type InvokeResult, invokeStrict } from "./invoker.js";

export interface ProposeArgs {
  changeName: string;
  description: string;
}

export interface ProposeSuccess {
  ok: true;
  changeName: string;
  directory: string;
}

export type ProposeResult = ProposeSuccess | { ok: false; error: string };

export async function propose(projectRoot: string, args: ProposeArgs): Promise<ProposeResult> {
  const changeDir = resolve(projectRoot, ".strict-spec-driven/changes", args.changeName);

  if (existsSync(changeDir)) {
    return {
      ok: false,
      error: `change '${args.changeName}' already exists — use strict_modify or strict_cancel to handle it`,
    };
  }

  if (!args.description?.trim()) {
    return {
      ok: false,
      error: "description is required to scaffold a change",
    };
  }

  const result: InvokeResult = await invokeStrict("propose", {
    args: [args.changeName],
  });

  if (!result.ok) {
    return { ok: false, error: result.error ?? "propose scaffold failed" };
  }

  if (!existsSync(changeDir)) {
    return {
      ok: false,
      error: `scaffold did not create directory for '${args.changeName}'`,
    };
  }

  return { ok: true, changeName: args.changeName, directory: changeDir };
}
