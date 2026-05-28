import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { IS_NATIVE, assets } from "./assets.js";

export { IS_NATIVE, detectNative } from "./assets.js";

export interface NativeContext {
  readonly isNative: boolean;
  readonly assetRoot: string;
}

let _ctx: NativeContext | null = null;

const here = dirname(fileURLToPath(import.meta.url));

export function detectNativeContext(): NativeContext {
  if (_ctx) return _ctx;
  _ctx = {
    isNative: IS_NATIVE,
    assetRoot: IS_NATIVE ? "" : resolve(here, "..", ".."),
  };
  return _ctx;
}

export function resolveAsset(name: string): Uint8Array {
  return assets.get(name);
}

export function resolveDataFile(relPath: string): string {
  if (IS_NATIVE) throw new Error(`Filesystem path unavailable in native mode: ${relPath}`);
  return resolve(detectNativeContext().assetRoot, relPath);
}
