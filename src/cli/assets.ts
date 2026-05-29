import { readFileSync } from "node:fs";

export function detectNative(): boolean {
  return (
    typeof process === "object" &&
    // @ts-expect-error -- Bun-specific property
    process.isBun === true &&
    typeof process.execPath === "string" &&
    !process.execPath.includes("bun")
  );
}

export const IS_NATIVE = detectNative();

type Resolver = () => string[];

export class AssetRegistry {
  private cache = new Map<string, Uint8Array>();
  private resolvers = new Map<string, Resolver>();
  private embedded: Map<string, () => Uint8Array> | null = null;

  register(name: string, resolver: Resolver): void {
    this.resolvers.set(name, resolver);
  }

  preload(name: string, data: Uint8Array): void {
    this.cache.set(name, data);
  }

  /** Set native-mode embedded loaders (called by build-generated embed-assets module). */
  setEmbeddedLoaders(loaders: Map<string, () => Uint8Array>): void {
    this.embedded = loaders;
  }

  get(name: string): Uint8Array {
    const cached = this.cache.get(name);
    if (cached) return cached;

    // Check for build-time embedded assets (set by native-embed module)
    const embedded = this.embedded?.get(name);
    if (embedded) {
      const bytes = embedded();
      this.cache.set(name, bytes);
      return bytes;
    }

    const resolve = this.resolvers.get(name);
    if (!resolve) throw new Error(`Unknown asset: ${name}`);

    for (const p of resolve()) {
      try {
        const buf = readFileSync(p);
        const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
        this.cache.set(name, bytes);
        return bytes;
      } catch {
        /* next candidate */
      }
    }
    throw new Error(`Asset "${name}" not found on disk`);
  }

  getText(name: string): string {
    return new TextDecoder().decode(this.get(name));
  }

  has(name: string): boolean {
    return this.cache.has(name) || this.resolvers.has(name);
  }

  list(): string[] {
    const names = new Set<string>([...this.cache.keys(), ...this.resolvers.keys()]);
    return [...names];
  }
}

export const assets = new AssetRegistry();

// Pick up build-time embedded assets from globalThis (set by native embed-assets module)
const _embedded = (globalThis as Record<string, unknown>).__DSPEC_EMBEDDED;
if (_embedded instanceof Map) assets.setEmbeddedLoaders(_embedded as Map<string, () => Uint8Array>);
