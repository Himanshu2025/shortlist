import { describe, expect, it } from "vitest";
import type { Ruleset } from "../core/types";
import { DEFAULT_RULESET } from "../core/defaults";
import { compileRuleset } from "../core/compile";
import { evaluatePost, isJobPost, matchSkills } from "../core/match";
import {
  CONGRATS_REACT_POST,
  FOUNDER_CURLY_QUOTE_POST,
  HIRING_NO_WANTED_SKILL_POST,
  HIRING_REACT_POST,
  NODE_HYPHEN_COMPOUND_POST,
  NODE_JS_MENTION_POST,
  NON_HIRING_POST,
  REACTIVE_FALSE_POSITIVE_POST,
  SENIORITY_AND_REMOTE_POST,
} from "./fixtures/posts";

// DEFAULT_RULESET ships with an empty skill list (see core/defaults.ts) —
// deliberately, so a fresh install isn't seeded with someone else's tech
// stack. These tests need real skills to exercise matchSkills/evaluatePost
// against, so they supply their own rather than depending on product
// defaults that are meant to change independently of test behavior.
const TEST_SKILLS: Ruleset["skills"] = [
  { name: "React", aliases: ["react.js", "reactjs"], required: false },
  { name: "TypeScript", aliases: ["ts"], required: false },
  { name: "Node.js", aliases: ["node", "nodejs"], required: false },
  { name: "GraphQL", aliases: [], required: false },
];

const compiled = compileRuleset({ ...DEFAULT_RULESET, skills: TEST_SKILLS });

describe("isJobPost", () => {
  it("flags a post with an explicit hiring phrase", () => {
    expect(isJobPost(HIRING_REACT_POST, compiled)).toBe(true);
  });

  it("rejects a congratulations post even when it mentions a skill and 'role'", () => {
    // This is the case the exclude list exists for: "congrats on landing
    // your new React role" must not be treated as a hiring post.
    expect(isJobPost(CONGRATS_REACT_POST, compiled)).toBe(false);
  });

  it("flags a hiring post regardless of who's posting it — no author/headline signal required", () => {
    expect(isJobPost(FOUNDER_CURLY_QUOTE_POST, compiled)).toBe(true);
  });

  it("matches a hiring phrase even when the post uses a typographic apostrophe", () => {
    // Regression test: LinkedIn renders "We're" as "We’re" (curly '),
    // but the default phrase list is typed with a straight one.
    expect(FOUNDER_CURLY_QUOTE_POST.text).toContain("’");
    expect(isJobPost(FOUNDER_CURLY_QUOTE_POST, compiled)).toBe(true);
  });

  it("rejects an ordinary post with no hiring signal", () => {
    expect(isJobPost(NON_HIRING_POST, compiled)).toBe(false);
  });

  it("still flags hiring posts that don't name a wanted skill", () => {
    expect(isJobPost(HIRING_NO_WANTED_SKILL_POST, compiled)).toBe(true);
  });
});

describe("matchSkills", () => {
  it("matches a skill by its canonical name", () => {
    expect(matchSkills(HIRING_REACT_POST.text, compiled)).toContain("React");
  });

  it("does not match 'react' inside 'reactive' or 'reaction'", () => {
    const skills = matchSkills(REACTIVE_FALSE_POSITIVE_POST.text, compiled);
    expect(skills).not.toContain("React");
  });

  it("does not match a bare alias inside a hyphenated compound", () => {
    const skills = matchSkills(NODE_HYPHEN_COMPOUND_POST.text, compiled);
    expect(skills).not.toContain("Node.js");
  });

  it("matches 'Node.js' as written in running text", () => {
    const skills = matchSkills(NODE_JS_MENTION_POST.text, compiled);
    expect(skills).toContain("Node.js");
  });

  it("returns no skills for a post that names none of them", () => {
    expect(matchSkills(HIRING_NO_WANTED_SKILL_POST.text, compiled)).toEqual([]);
  });
});

describe("evaluatePost", () => {
  it("is a match when both gates pass", () => {
    const verdict = evaluatePost(HIRING_REACT_POST, compiled);
    expect(verdict.isJobPost).toBe(true);
    expect(verdict.matchedSkills).toContain("React");
    expect(verdict.isMatch).toBe(true);
  });

  it("is not a match when gate 1 fails, regardless of skill mentions", () => {
    const verdict = evaluatePost(CONGRATS_REACT_POST, compiled);
    expect(verdict.isJobPost).toBe(false);
    expect(verdict.isMatch).toBe(false);
    expect(verdict.explanation.excludePhraseHit).not.toBeNull();
  });

  it("is not a match when gate 1 passes but no skill is named", () => {
    const verdict = evaluatePost(HIRING_NO_WANTED_SKILL_POST, compiled);
    expect(verdict.isJobPost).toBe(true);
    expect(verdict.matchedSkills).toEqual([]);
    expect(verdict.isMatch).toBe(false);
  });

  it("extracts facets alongside the match", () => {
    const verdict = evaluatePost(SENIORITY_AND_REMOTE_POST, compiled);
    expect(verdict.facets.seniority).toBe("staff");
    expect(verdict.facets.workMode).toBe("remote");
    expect(verdict.facets.sponsorship).toBe("offered");
    expect(verdict.matchedSkills).toContain("TypeScript");
  });

  it("matches a founder's hiring post on skills, same as any other author", () => {
    const verdict = evaluatePost(FOUNDER_CURLY_QUOTE_POST, compiled);
    expect(verdict.matchedSkills).toEqual(expect.arrayContaining(["React", "TypeScript"]));
    expect(verdict.isMatch).toBe(true);
  });
});

describe("required skills (AND semantics)", () => {
  function rulesetWithSkills(skills: { name: string; aliases: string[]; required: boolean }[]) {
    return compileRuleset({
      skills,
      locations: [],
      hiringPhrases: ["hiring"],
      excludePhrases: [],
    });
  }

  it("matches once every required skill is named, even if an optional one isn't mentioned", () => {
    const rc = rulesetWithSkills([
      { name: "TypeScript", aliases: ["ts"], required: true },
      { name: "GraphQL", aliases: [], required: false },
    ]);
    const post = { urn: "r1", text: "We're hiring a TypeScript engineer.", authorName: "" };
    const verdict = evaluatePost(post, rc);
    expect(verdict.isMatch).toBe(true);
    expect(verdict.explanation.missingRequiredSkills).toEqual([]);
  });

  it("rejects the post when a required skill is missing, even if another skill matched", () => {
    const rc = rulesetWithSkills([
      { name: "TypeScript", aliases: ["ts"], required: true },
      { name: "React", aliases: [], required: false },
    ]);
    const post = { urn: "r2", text: "We're hiring a React engineer.", authorName: "" };
    const verdict = evaluatePost(post, rc);
    expect(verdict.isMatch).toBe(false);
    expect(verdict.explanation.missingRequiredSkills).toEqual(["TypeScript"]);
  });

  it("demands ALL required skills, not just one of them", () => {
    const rc = rulesetWithSkills([
      { name: "TypeScript", aliases: [], required: true },
      { name: "GraphQL", aliases: [], required: true },
    ]);
    const post = { urn: "r3", text: "We're hiring a TypeScript engineer.", authorName: "" };
    const verdict = evaluatePost(post, rc);
    expect(verdict.isMatch).toBe(false);
    expect(verdict.explanation.missingRequiredSkills).toEqual(["GraphQL"]);
  });

  it("falls back to OR-any-skill when no skill is marked required", () => {
    const rc = rulesetWithSkills([
      { name: "TypeScript", aliases: [], required: false },
      { name: "React", aliases: [], required: false },
    ]);
    const post = { urn: "r4", text: "We're hiring a React engineer.", authorName: "" };
    expect(evaluatePost(post, rc).isMatch).toBe(true);
  });
});

describe("match snippet", () => {
  it("builds an excerpt around the first matched skill, with correct highlight offsets", () => {
    const verdict = evaluatePost(HIRING_REACT_POST, compiled);
    expect(verdict.snippet).not.toBeNull();
    const { text, highlightStart, highlightEnd } = verdict.snippet!;
    expect(text.slice(highlightStart, highlightEnd)).toBe("React");
  });

  it("is null when the post isn't a match", () => {
    expect(evaluatePost(CONGRATS_REACT_POST, compiled).snippet).toBeNull();
  });
});
