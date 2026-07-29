import type { CompiledRuleset, CompiledPhraseList } from "./compile";
import type { FeedPost, MatchExplanation, Verdict } from "./types";
import { extractFacets } from "./facets";

/** Gate 1: is this someone hiring? Hiring language in the post body, or a
 * recruiter/talent headline, counts as a candidate — unless the post reads
 * as a congratulations/announcement, which the exclude list kills without
 * needing semantics ("congrats on landing your new React role"). */
export function isJobPost(post: FeedPost, compiled: CompiledRuleset): boolean {
  const looksLikeHiring =
    compiled.hiring.combined.test(post.text) ||
    compiled.recruiter.combined.test(post.authorHeadline);
  if (!looksLikeHiring) return false;
  return !compiled.exclude.combined.test(post.text);
}

/** Gate 2: does it name any skill from the ruleset? */
export function matchSkills(text: string, compiled: CompiledRuleset): string[] {
  return compiled.skills
    .filter((skill) => skill.combined.test(text))
    .map((skill) => skill.name);
}

export function matchLocations(text: string, compiled: CompiledRuleset): string[] {
  return compiled.locations.items
    .filter((item) => item.regex.test(text))
    .map((item) => item.phrase);
}

function firstHit(list: CompiledPhraseList, text: string): string | null {
  return list.items.find((item) => item.regex.test(text))?.phrase ?? null;
}

export function explainMatch(
  text: string,
  authorHeadline: string,
  compiled: CompiledRuleset,
): MatchExplanation {
  return {
    hiringPhraseHit: firstHit(compiled.hiring, text),
    recruiterTermHit: firstHit(compiled.recruiter, authorHeadline),
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
  const explanation = explainMatch(post.text, post.authorHeadline, compiled);

  return {
    isJobPost: jobPost,
    matchedSkills,
    matchedLocations,
    facets,
    explanation,
    isMatch: jobPost && matchedSkills.length > 0,
  };
}
