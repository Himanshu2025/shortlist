import type { CompiledRuleset, CompiledPhraseList } from "./compile";
import type { FeedPost, MatchExplanation, MatchSnippet, Verdict } from "./types";
import { extractFacets } from "./facets";
import { normalizeQuotes } from "./phrase";

const SNIPPET_RADIUS = 60;

/** Locates the first hit of `regex` in `normalized` and slices a short
 * excerpt out of `original` around it. Both strings are the same length
 * (normalizeQuotes only ever swaps one char for another), so an offset
 * found in the normalized text maps directly onto the original — which is
 * what actually gets shown, curly quotes and all. */
function buildSnippet(original: string, normalized: string, regex: RegExp): MatchSnippet | null {
  const match = regex.exec(normalized);
  if (!match) return null;

  const start = match.index;
  const end = start + match[0].length;
  const from = Math.max(0, start - SNIPPET_RADIUS);
  const to = Math.min(original.length, end + SNIPPET_RADIUS);
  const prefix = from > 0 ? "…" : "";
  const suffix = to < original.length ? "…" : "";

  return {
    text: prefix + original.slice(from, to) + suffix,
    highlightStart: start - from + prefix.length,
    highlightEnd: end - from + prefix.length,
  };
}

/** Gate 1: is this someone hiring? Hiring language in the post body counts
 * as a candidate — regardless of who's posting it, a founder or engineer
 * writing "we're hiring" is just as real a signal as a recruiter — unless
 * the post reads as a congratulations/announcement, which the exclude list
 * kills without needing semantics ("congrats on landing your new React
 * role"). */
export function isJobPost(post: FeedPost, compiled: CompiledRuleset): boolean {
  const text = normalizeQuotes(post.text);
  if (!compiled.hiring.combined.test(text)) return false;
  return !compiled.exclude.combined.test(text);
}

/** Gate 2: does it name any skill from the ruleset? */
export function matchSkills(text: string, compiled: CompiledRuleset): string[] {
  const normalized = normalizeQuotes(text);
  return compiled.skills
    .filter((skill) => skill.combined.test(normalized))
    .map((skill) => skill.name);
}

export function matchLocations(text: string, compiled: CompiledRuleset): string[] {
  const normalized = normalizeQuotes(text);
  return compiled.locations.items
    .filter((item) => item.regex.test(normalized))
    .map((item) => item.phrase);
}

// Phrases are normalized at compile time (see phrase.ts); text is
// normalized here, at every point it gets tested against a compiled
// pattern — so quote-style differences between a typed phrase and
// LinkedIn's rendered text (or a user's pasted sample in the tester)
// can't cause a silent mismatch either way.
function firstHit(list: CompiledPhraseList, text: string): string | null {
  const normalized = normalizeQuotes(text);
  return list.items.find((item) => item.regex.test(normalized))?.phrase ?? null;
}

/** Skills flagged SkillRule.required must ALL be named for a match — AND
 * semantics for that subset. When at least one required skill exists and
 * all of them are named, that alone is sufficient (optional skills still
 * show as chips but aren't needed). With no required skills, behavior is
 * unchanged: any one matched skill (OR-any) is enough. */
function missingRequiredSkills(matchedSkills: string[], compiled: CompiledRuleset): string[] {
  return compiled.skills
    .filter((skill) => skill.required && !matchedSkills.includes(skill.name))
    .map((skill) => skill.name);
}

export function explainMatch(text: string, compiled: CompiledRuleset): MatchExplanation {
  const matchedSkills = matchSkills(text, compiled);
  return {
    hiringPhraseHit: firstHit(compiled.hiring, text),
    excludePhraseHit: firstHit(compiled.exclude, text),
    matchedSkills,
    matchedLocations: matchLocations(text, compiled),
    missingRequiredSkills: missingRequiredSkills(matchedSkills, compiled),
  };
}

/** First matched skill (ruleset order) that has a compiled pattern, used to
 * anchor the display snippet at the same location `matchSkills` found. */
function findSnippet(post: FeedPost, matchedSkills: string[], compiled: CompiledRuleset): MatchSnippet | null {
  const firstMatch = compiled.skills.find((skill) => matchedSkills.includes(skill.name));
  if (!firstMatch) return null;
  return buildSnippet(post.text, normalizeQuotes(post.text), firstMatch.combined);
}

/** Full pipeline for one post: both gates, facets, and the explanation
 * trail — used identically by the content script and the options-page
 * tester, so what the tester reports is exactly what the feed would do. */
export function evaluatePost(post: FeedPost, compiled: CompiledRuleset): Verdict {
  const jobPost = isJobPost(post, compiled);
  const matchedSkills = matchSkills(post.text, compiled);
  const matchedLocations = matchLocations(post.text, compiled);
  const facets = extractFacets(post.text);
  const explanation = explainMatch(post.text, compiled);
  const hasRequiredSkills = compiled.skills.some((skill) => skill.required);
  const allRequiredMatched = explanation.missingRequiredSkills.length === 0;
  const isMatch =
    jobPost && allRequiredMatched && (hasRequiredSkills || matchedSkills.length > 0);

  return {
    isJobPost: jobPost,
    matchedSkills,
    matchedLocations,
    facets,
    explanation,
    snippet: isMatch ? findSnippet(post, matchedSkills, compiled) : null,
    isMatch,
  };
}
