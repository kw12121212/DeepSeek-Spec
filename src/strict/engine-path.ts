import { resolveDataFile } from "../cli/native-detect.js";

export function resolveEnginePath(): string {
  return resolveDataFile("vendor/strict-spec-driven.js");
}
