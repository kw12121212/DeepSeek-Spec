import { useCallback, useEffect, useState } from "react";
import { DeepSeekClient, pickPrimaryBalance } from "../../client.js";
import type { CacheFirstLoop } from "../../loop.js";
import { VERSION, compareVersions, getLatestVersion } from "../../version.js";

export interface Balance {
  currency: string;
  total: number;
}

export interface UseSessionInfoResult {
  balance: Balance | null;
  models: string[] | null;
  latestVersion: string | null;
  /** Strictly-newer version string (for the header badge) — else `null`. */
  updateAvailable: string | null;
  refreshBalance: () => void;
  refreshModels: () => void;
  refreshLatestVersion: () => void;
}

/** All values best-effort — `null` means "not loaded or endpoint failed"; StatsPanel hides those cells. */
export function useSessionInfo(loop: CacheFirstLoop): UseSessionInfoResult {
  const dsClient = loop.client instanceof DeepSeekClient ? loop.client : null;
  const [balance, setBalance] = useState<Balance | null>(null);
  const [models, setModels] = useState<string[] | null>(null);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);

  // Fetch balance on mount. Non-blocking — the session works without
  // it; `null` hides the cell. handleSubmit calls refreshBalance in
  // its finally so the number tracks actual spend rather than
  // freezing at mount-time.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const bal = await dsClient?.getBalance().catch(() => null);
      if (cancelled || !bal) return;
      const primary = pickPrimaryBalance(bal.balance_infos);
      if (!primary) return;
      setBalance({ currency: primary.currency, total: Number(primary.total_balance) });
    })();
    return () => {
      cancelled = true;
    };
  }, [dsClient]);

  // Fetch the model catalog from DeepSeek once. Silent degrade on
  // failure (stays null), so `/models` can tell "still loading /
  // offline" apart from "loaded, here's the list."
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const list = await dsClient?.listModels().catch(() => null);
      if (cancelled || !list) return;
      setModels(list.data.map((m: { id: string }) => m.id));
    })();
    return () => {
      cancelled = true;
    };
  }, [dsClient]);

  // Background registry check — 24h disk cache absorbs repeated
  // launches, timeout bounded so a flaky network doesn't delay the
  // notification. `null` on failure (silent). We store the raw version
  // regardless of whether it's newer; the header badge's newer-only
  // check happens at the `updateAvailable` derivation below.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const latest = await getLatestVersion();
      if (cancelled || !latest) return;
      setLatestVersion(latest);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateAvailable =
    latestVersion && compareVersions(VERSION, latestVersion) < 0 ? latestVersion : null;

  const refreshBalance = useCallback(() => {
    void (async () => {
      const bal = await dsClient?.getBalance().catch(() => null);
      const primary = bal ? pickPrimaryBalance(bal.balance_infos) : null;
      if (primary) {
        setBalance({ currency: primary.currency, total: Number(primary.total_balance) });
      }
    })();
  }, [dsClient]);

  const refreshModels = useCallback(() => {
    void (async () => {
      const list = await dsClient?.listModels().catch(() => null);
      if (list) setModels(list.data.map((m: { id: string }) => m.id));
    })();
  }, [dsClient]);

  const refreshLatestVersion = useCallback(() => {
    void (async () => {
      const fresh = await getLatestVersion({ force: true });
      if (fresh) setLatestVersion(fresh);
    })();
  }, []);

  return {
    balance,
    models,
    latestVersion,
    updateAvailable,
    refreshBalance,
    refreshModels,
    refreshLatestVersion,
  };
}
