export interface SkillRule {
  /** Canonical display name. Also implicitly its own alias. */
  name: string;
  /** Additional phrases that count as this skill (e.g. "js" for "JavaScript"). */
  aliases: string[];
  /** When true, a post must name this skill to match, regardless of other
   * skill mentions — AND semantics instead of the default OR-any-skill. */
  required: boolean;
}

export interface Ruleset {
  skills: SkillRule[];
  locations: string[];
  hiringPhrases: string[];
  excludePhrases: string[];
}

export interface Settings {
  version: 1;
  enabled: boolean;
  collapseMisses: boolean;
  ruleset: Ruleset;
}

export interface FeedPost {
  /** A stable-enough per-post identity key extracted from the DOM (see
   * content/extract.ts:getUrn) — not necessarily a literal
   * `urn:li:activity:...` string, just named for what it's for. */
  urn: string;
  text: string;
  authorName: string;
}

export type Seniority = "junior" | "mid" | "senior" | "staff" | "lead" | null;
export type WorkMode = "remote" | "hybrid" | "onsite" | null;
export type Sponsorship = "offered" | "not-offered" | null;

export interface Facets {
  seniority: Seniority;
  workMode: WorkMode;
  sponsorship: Sponsorship;
  /** Raw matched text of a salary figure/range (e.g. "$120k-$150k"), kept
   * verbatim rather than normalized — display only, like the other facets. */
  salary: string | null;
}

export interface MatchExplanation {
  hiringPhraseHit: string | null;
  excludePhraseHit: string | null;
  matchedSkills: string[];
  matchedLocations: string[];
  /** Required skills (see SkillRule.required) that did NOT match — a
   * non-empty list here is why an otherwise-hiring post was rejected. */
  missingRequiredSkills: string[];
}

/** A short excerpt of the post text around the first matched skill, with
 * the matched substring's offsets — lets the UI show *where* it matched
 * without touching LinkedIn's own DOM nodes. */
export interface MatchSnippet {
  text: string;
  highlightStart: number;
  highlightEnd: number;
}

export interface Verdict {
  isJobPost: boolean;
  matchedSkills: string[];
  matchedLocations: string[];
  facets: Facets;
  explanation: MatchExplanation;
  snippet: MatchSnippet | null;
  /** True when the post is a job post, every required skill (if any) is
   * named, and at least one skill overall is named. */
  isMatch: boolean;
}
