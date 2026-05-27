export interface BrainstormQA {
  question: string;
  answer: string;
}

export interface BrainstormSummary {
  title: string;
  goal: string;
  scope: {
    in: string[];
    out: string[];
  };
  done_criteria: string[];
}

export interface BrainstormQuestionsResult {
  phase: "questions";
  questions: string[];
}

export interface BrainstormSummaryResult {
  phase: "summary";
  summary: BrainstormSummary;
}

export type BrainstormResult = BrainstormQuestionsResult | BrainstormSummaryResult;

const FOCUS_QUESTIONS: Record<string, string> = {
  title: "What short title describes this change?",
  goal: "What is the primary goal or outcome this change should achieve?",
  scope_in: "What specific features, behaviors, or files should be in scope?",
  scope_out: "What should be explicitly excluded from scope?",
  done_criteria: "How will you know this change is complete? What are the success criteria?",
};

export function isValidSummary(value: unknown): value is BrainstormSummary {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  if (typeof s.title !== "string" || !s.title.trim()) return false;
  if (typeof s.goal !== "string" || !s.goal.trim()) return false;
  if (typeof s.scope !== "object" || s.scope === null) return false;
  const scope = s.scope as Record<string, unknown>;
  if (!Array.isArray(scope.in) || !Array.isArray(scope.out)) return false;
  if (!Array.isArray(s.done_criteria) || s.done_criteria.length === 0) return false;
  return true;
}

function missingFields(summary: Partial<BrainstormSummary>): string[] {
  const missing: string[] = [];
  if (!summary.title?.trim()) missing.push("title");
  if (!summary.goal?.trim()) missing.push("goal");
  if (!summary.scope?.in?.length && !summary.scope?.out?.length) missing.push("scope_in");
  if (!summary.done_criteria?.length) missing.push("done_criteria");
  return [...new Set(missing)];
}

export function brainstorm(input: {
  idea?: string;
  history?: BrainstormQA[];
  summary?: unknown;
}): BrainstormResult {
  if (isValidSummary(input.summary)) {
    return { phase: "summary", summary: input.summary };
  }

  const partial = (input.summary ?? {}) as Partial<BrainstormSummary>;
  const gaps = missingFields(partial);

  const questions = gaps.map((g) => FOCUS_QUESTIONS[g]).filter((q): q is string => Boolean(q));

  if (input.idea && !input.history?.length) {
    questions.unshift(`The user described: "${input.idea}"`);
  }

  if (questions.length === 0) {
    questions.push(FOCUS_QUESTIONS.goal!);
  }

  return { phase: "questions", questions };
}
