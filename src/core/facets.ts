import type { Facets, Seniority, WorkMode } from "./types";

// Fixed English vocabulary, not user data, so these are plain precompiled
// regexes rather than phrase-list compilations. Order is priority: the
// first pattern that matches wins when a post mentions more than one term.
const SENIORITY_PATTERNS: [Seniority, RegExp][] = [
  ["staff", /\bstaff\b/i],
  ["lead", /\blead\b/i],
  ["senior", /\b(senior|sr\.?)\b/i],
  ["mid", /\bmid[\s-]?(level|senior)\b/i],
  ["junior", /\b(junior|jr\.?|entry[\s-]?level|graduate)\b/i],
];

const WORK_MODE_PATTERNS: [WorkMode, RegExp][] = [
  ["remote", /\bremote\b/i],
  ["hybrid", /\bhybrid\b/i],
  ["onsite", /\b(on-?site|in[\s-]?office)\b/i],
];

const SPONSORSHIP_NOT_OFFERED =
  /\b(no (visa )?sponsorship|unable to sponsor|not able to sponsor|does(?:n'?t| not) sponsor|cannot sponsor|can'?t sponsor)\b/i;
const SPONSORSHIP_OFFERED =
  /\b(visa sponsorship (available|offered|provided)|will sponsor|sponsorship available|we sponsor|sponsorship (?:is )?(?:offered|provided))\b/i;

export function extractFacets(text: string): Facets {
  const seniority =
    SENIORITY_PATTERNS.find(([, regex]) => regex.test(text))?.[0] ?? null;
  const workMode =
    WORK_MODE_PATTERNS.find(([, regex]) => regex.test(text))?.[0] ?? null;

  let sponsorship: Facets["sponsorship"] = null;
  if (SPONSORSHIP_NOT_OFFERED.test(text)) {
    sponsorship = "not-offered";
  } else if (SPONSORSHIP_OFFERED.test(text)) {
    sponsorship = "offered";
  }

  return { seniority, workMode, sponsorship };
}
