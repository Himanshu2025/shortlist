import type { CompiledRuleset, CompiledPhraseList } from "./compile";
import type { FeedPost, MatchExplanation, Verdict } from "./types";
import { extractFacets } from "./facets";
import { normalizeQuotes } from "./phrase";

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

export function explainMatch(text: string, compiled: CompiledRuleset): MatchExplanation {
  return {
    hiringPhraseHit: firstHit(compiled.hiring, text),
    excludePhraseHit: firstHit(compiled.exclude, text),
    matchedSkills: matchSkills(text, compiled),
    matchedLocations: matchLocations(text, compiled),
  };
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

  return {
    isJobPost: jobPost,
    matchedSkills,
    matchedLocations,
    facets,
    explanation,
    isMatch: jobPost && matchedSkills.length > 0,
  };
}
