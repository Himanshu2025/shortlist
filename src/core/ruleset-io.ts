import type { Ruleset, SkillRule } from "./types";

// Settings portability, not post-data export: this round-trips the
// user's own ruleset (skills/aliases/phrases) as JSON. No post content
// ever passes through here.

export type RulesetImportResult =
  | { ok: true; ruleset: Ruleset }
  | { ok: false; error: string };

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isSkillRule(value: unknown): value is SkillRule {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate["name"] === "string" && isStringArray(candidate["aliases"]);
}

export function parseRulesetJson(raw: string): RulesetImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Not valid JSON." };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { ok: false, error: "Expected a JSON object." };
  }
  const candidate = parsed as Record<string, unknown>;

  if (!Array.isArray(candidate["skills"]) || !candidate["skills"].every(isSkillRule)) {
    return { ok: false, error: 'Invalid "skills" — expected [{ name, aliases: [] }].' };
  }
  if (!isStringArray(candidate["locations"])) {
    return { ok: false, error: 'Invalid "locations" — expected a string array.' };
  }
  if (!isStringArray(candidate["hiringPhrases"])) {
    return { ok: false, error: 'Invalid "hiringPhrases" — expected a string array.' };
  }
  if (!isStringArray(candidate["recruiterTerms"])) {
    return { ok: false, error: 'Invalid "recruiterTerms" — expected a string array.' };
  }
  if (!isStringArray(candidate["excludePhrases"])) {
    return { ok: false, error: 'Invalid "excludePhrases" — expected a string array.' };
  }

  return {
    ok: true,
    ruleset: {
      skills: candidate["skills"] as SkillRule[],
      locations: candidate["locations"] as string[],
      hiringPhrases: candidate["hiringPhrases"] as string[],
      recruiterTerms: candidate["recruiterTerms"] as string[],
      excludePhrases: candidate["excludePhrases"] as string[],
    },
  };
}

export function serializeRuleset(ruleset: Ruleset): string {
  return JSON.stringify(ruleset, null, 2);
}
