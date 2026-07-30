export interface SkillRule {
  /** Canonical display name. Also implicitly its own alias. */
  name: string;
  /** Additional phrases that count as this skill (e.g. "js" for "JavaScript"). */
  aliases: string[];
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
}

export interface MatchExplanation {
  hiringPhraseHit: string | null;
  excludePhraseHit: string | null;
  matchedSkills: string[];
  matchedLocations: string[];
}

export interface Verdict {
  isJobPost: boolean;
  matchedSkills: string[];
  matchedLocations: string[];
  facets: Facets;
  explanation: MatchExplanation;
  /** True when the post is a job post AND names at least one wanted skill. */
  isMatch: boolean;
}
