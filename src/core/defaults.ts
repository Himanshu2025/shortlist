import type { Ruleset } from "./types";

// Seed values only — every field here is editable (add/remove/reset per
// section) from the options page. Nothing in matching.ts hardcodes these.
export const DEFAULT_SKILLS: Ruleset["skills"] = [
  { name: "React", aliases: ["react.js", "reactjs"], required: false },
  { name: "TypeScript", aliases: ["ts"], required: false },
  { name: "JavaScript", aliases: ["js", "ecmascript"], required: false },
  { name: "Node.js", aliases: ["node", "nodejs"], required: false },
  { name: "Python", aliases: ["py"], required: false },
  { name: "Go", aliases: ["golang"], required: false },
  { name: "Rust", aliases: [], required: false },
  { name: "Kubernetes", aliases: ["k8s"], required: false },
  { name: "AWS", aliases: ["amazon web services"], required: false },
  { name: "GraphQL", aliases: [], required: false },
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
