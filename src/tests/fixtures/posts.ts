import type { FeedPost } from "../../core/types";

export const HIRING_REACT_POST: FeedPost = {
  urn: "urn:li:activity:1",
  text: "We're hiring a Senior React engineer to join our team! Remote-friendly, Melbourne preferred. Apply now or DM me.",
  authorName: "Jamie Lee",
};

export const CONGRATS_REACT_POST: FeedPost = {
  urn: "urn:li:activity:2",
  text: "Congrats to my teammate on landing her new React role — so excited to see where this takes her!",
  authorName: "Jamie Lee",
};

// Regression fixture for a real bug: LinkedIn renders a curly apostrophe
// ("We’re") rather than the straight one our default phrase list uses
// ("we're"), and this post's author has no "recruiter"-style title at all —
// it should still match on body text alone, from either signal.
export const FOUNDER_CURLY_QUOTE_POST: FeedPost = {
  urn: "urn:li:activity:3",
  text: "We’re looking for a Front End Developer for a 6 month contract in Melbourne. React / TypeScript / Next.js.",
  authorName: "Michael Boyd",
};

export const HIRING_NO_WANTED_SKILL_POST: FeedPost = {
  urn: "urn:li:activity:4",
  text: "We are looking for a Ruby on Rails developer to join our team, apply here.",
  authorName: "Sam Osei",
};

export const NON_HIRING_POST: FeedPost = {
  urn: "urn:li:activity:5",
  text: "Just published a blog post about how we scaled our React app to a million users. Would love your thoughts.",
  authorName: "Dana Wu",
};

export const REACTIVE_FALSE_POSITIVE_POST: FeedPost = {
  urn: "urn:li:activity:6",
  text: "We're hiring an engineer who can build reactive, event-driven systems and reason about reaction time under load.",
  authorName: "Lee Park",
};

export const NODE_HYPHEN_COMPOUND_POST: FeedPost = {
  urn: "urn:li:activity:7",
  text: "Hiring for our platform team — you'll own the some-node-service pipeline and our internal nodejs-tools cli.",
  authorName: "Lee Park",
};

export const NODE_JS_MENTION_POST: FeedPost = {
  urn: "urn:li:activity:8",
  text: "We're hiring a backend engineer experienced with Node.js and GraphQL. Apply now.",
  authorName: "Lee Park",
};

export const SENIORITY_AND_REMOTE_POST: FeedPost = {
  urn: "urn:li:activity:9",
  text: "We're hiring a Staff TypeScript engineer, fully remote, visa sponsorship available. Apply now.",
  authorName: "Lee Park",
};
