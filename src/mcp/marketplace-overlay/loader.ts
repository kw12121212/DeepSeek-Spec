import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { assets } from "../../cli/assets.js";

export interface OverlayEntry {
  title: string;
  description: string;
}

let cache: Record<string, OverlayEntry> | null = null;
let cachedLang: string | null = null;

const here = dirname(fileURLToPath(import.meta.url));

export function loadOverlay(lang: string): Record<string, OverlayEntry> | null {
  if (cachedLang === lang && cache) return cache;
  const assetName = `marketplace:${lang}`;
  try {
    const raw = assets.has(assetName)
      ? assets.getText(assetName)
      : readFileSync(join(here, `${lang}.json`), "utf8");
    cache = JSON.parse(raw) as Record<string, OverlayEntry>;
    cachedLang = lang;
    return cache;
  } catch {
    return null;
  }
}
