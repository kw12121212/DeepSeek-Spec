export type NearestCommandOptions = {
  max?: number;
  maxDistance?: number;
};

export function nearestCommands(
  input: string,
  all: readonly string[],
  opts: NearestCommandOptions = {},
): string[] {
  if (!input) return [];
  const max = opts.max ?? 3;
  const maxDistance = Math.min(opts.maxDistance ?? 3, Math.floor(input.length / 2));
  if (max <= 0 || maxDistance <= 0) return [];
  return all
    .map((name) => ({ name, distance: levenshtein(input, name) }))
    .filter((entry) => entry.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name))
    .slice(0, max)
    .map((entry) => entry.name);
}

export function fuzzyMatch(input: string, target: string): number {
  if (!input || !target) return 0;
  const lo = input.toLowerCase();
  const tg = target.toLowerCase();
  let score = 0;
  let ti = 0;
  let consecutive = 0;
  for (let ii = 0; ii < lo.length; ii++) {
    const ch = lo[ii]!;
    let found = false;
    while (ti < tg.length) {
      if (tg[ti] === ch) {
        score += 1 + consecutive * 2;
        if (ti === 0 && ii === 0) score += 1;
        consecutive += 1;
        ti += 1;
        found = true;
        break;
      }
      score -= 1;
      consecutive = 0;
      ti += 1;
    }
    if (!found) return 0;
  }
  return score;
}

export type FuzzySlashOptions = {
  max?: number;
  minScore?: number;
};

export function fuzzySlashCommands(
  input: string,
  commands: readonly { cmd: string; aliases?: readonly string[] }[],
  opts: FuzzySlashOptions = {},
): { cmd: string; score: number }[] {
  const max = opts.max ?? 8;
  const minScore = opts.minScore ?? 1;
  const results: { cmd: string; score: number }[] = [];
  for (const spec of commands) {
    let best = fuzzyMatch(input, spec.cmd);
    if (spec.aliases) {
      for (const alias of spec.aliases) {
        const s = fuzzyMatch(input, alias);
        if (s > best) best = s;
      }
    }
    if (best >= minScore) results.push({ cmd: spec.cmd, score: best });
  }
  results.sort((a, b) => b.score - a.score || a.cmd.localeCompare(b.cmd));
  return results.slice(0, max);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let next = new Array<number>(b.length + 1).fill(0);
  for (let i = 0; i < a.length; i += 1) {
    next[0] = i + 1;
    for (let j = 0; j < b.length; j += 1) {
      const cost = a[i] === b[j] ? 0 : 1;
      next[j + 1] = Math.min((next[j] ?? 0) + 1, (prev[j + 1] ?? 0) + 1, (prev[j] ?? 0) + cost);
    }
    [prev, next] = [next, prev];
  }
  return prev[b.length] ?? 0;
}
