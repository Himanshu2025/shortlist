import type { Ruleset } from "./types";

// Seed values only — every field here is editable (add/remove/reset per
// section) from the options page. Nothing in matching.ts hardcodes these.
export const DEFAULT_SKILLS: Ruleset["skills"] = [
  { name: "React", aliases: ["react.js", "reactjs"] },
  { name: "TypeScript", aliases: ["ts"] },
  { name: "JavaScript", aliases: ["js", "ecmascript"] },
  { name: "Node.js", aliases: ["node", "nodejs"] },
  { name: "Python", aliases: ["py"] },
  { name: "Go", aliases: ["golang"] },
  { name: "Rust", aliases: [] },
  { name: "Kubernetes", aliases: ["k8s"] },
  { name: "AWS", aliases: ["amazon web services"] },
  { name: "GraphQL", aliases: [] },
];

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

export const DEFAULT_RECRUITER_TERMS: string[] = [
  "recruiter",
  "recruiting",
  "recruitment",
  "talent acquisition",
  "talent partner",
  "staffing",
  "TA",
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
  recruiterTerms: DEFAULT_RECRUITER_TERMS,
  excludePhrases: DEFAULT_EXCLUDE_PHRASES,
};
