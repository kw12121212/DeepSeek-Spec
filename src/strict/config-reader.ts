import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";

export interface ReviewEvidenceRegression {
  method: string;
  command: string;
  meaning: string;
  unavailable_behavior: string;
}

export interface ReviewEvidence {
  project_regression?: ReviewEvidenceRegression;
}

export interface StrictRules {
  specs: string[];
  change: string[];
  code: string[];
  test: string[];
}

export interface StrictConfig {
  context: string;
  rules: StrictRules;
  review_evidence: ReviewEvidence;
}

const DEFAULT_RULES: StrictRules = {
  specs: [],
  change: [],
  code: [],
  test: [],
};

const DEFAULT_CONFIG: StrictConfig = {
  context: "",
  rules: { specs: [], change: [], code: [], test: [] },
  review_evidence: {},
};

interface RawConfig {
  context?: string;
  rules?: {
    specs?: string[];
    change?: string[];
    code?: string[];
    test?: string[];
  };
  review_evidence?: {
    project_regression?: ReviewEvidenceRegression;
    [key: string]: unknown;
  };
}

function parseConfig(projectRoot: string): StrictConfig {
  const configPath = resolve(projectRoot, ".strict-spec-driven/config.yaml");

  if (!existsSync(configPath)) {
    return { ...DEFAULT_CONFIG, rules: { ...DEFAULT_RULES } };
  }

  const raw = readFileSync(configPath, "utf-8");
  const parsed: RawConfig = parseYaml(raw) ?? {};

  const rules: StrictRules = {
    specs: parsed.rules?.specs ?? DEFAULT_RULES.specs,
    change: parsed.rules?.change ?? DEFAULT_RULES.change,
    code: parsed.rules?.code ?? DEFAULT_RULES.code,
    test: parsed.rules?.test ?? DEFAULT_RULES.test,
  };

  return {
    context: parsed.context ?? DEFAULT_CONFIG.context,
    rules,
    review_evidence: parsed.review_evidence ?? DEFAULT_CONFIG.review_evidence,
  };
}

export interface ConfigReader {
  getConfig(): StrictConfig;
  getContext(): string;
  getRules(): StrictRules;
  getReviewEvidence(): ReviewEvidence;
}

export function createConfigReader(projectRoot: string): ConfigReader {
  let cached: StrictConfig | undefined;

  function ensure(): StrictConfig {
    if (!cached) cached = parseConfig(projectRoot);
    return cached;
  }

  return {
    getConfig: () => ensure(),
    getContext: () => ensure().context,
    getRules: () => ensure().rules,
    getReviewEvidence: () => ensure().review_evidence,
  };
}
