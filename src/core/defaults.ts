import type { Ruleset } from "./types";

// Seed values only — every field here is editable (add/remove/reset per
// section) from the options page. Nothing in matching.ts hardcodes these.
// Skills start empty deliberately: they're a personal stack, not a
// universal default, and shipping someone else's opinionated tech list
// (React, TypeScript, ...) as the out-of-the-box behavior isn't the right
// first impression for a public listing. The hiring/exclude phrase lists
// stay populated so gate 1 still does something meaningful before a user
// adds their own skills.
export const DEFAULT_SKILLS: Ruleset["skills"] = [];

export const DEFAULT_LOCATIONS: string[] = ["Remote", "Melbourne", "Sydney"];

export const DEFAULT_HIRING_PHRASES: string[] = [
  "hiring",
  "we're looking for",
  "we are looking for",
  "open role",
  "open roles",
  "now recruiting",
  "join our team",
  "apply here",
  "apply now",
  "DM me",
  "drop your CV",
  "drop your resume",
];

export const DEFAULT_EXCLUDE_PHRASES: string[] = [
  "congrats",
  "congratulations",
  "excited to share",
  "excited to announce",
  "excited to start",
  "thrilled to",
  "proud to announce",
  "new chapter",
  "I'm joining",
];

export const DEFAULT_RULESET: Ruleset = {
  skills: DEFAULT_SKILLS,
  locations: DEFAULT_LOCATIONS,
  hiringPhrases: DEFAULT_HIRING_PHRASES,
  excludePhrases: DEFAULT_EXCLUDE_PHRASES,
};
