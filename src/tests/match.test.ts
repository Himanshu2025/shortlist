import { describe, expect, it } from "vitest";
import { DEFAULT_RULESET } from "../core/defaults";
import { compileRuleset } from "../core/compile";
import { evaluatePost, isJobPost, matchSkills } from "../core/match";
import {
  CONGRATS_REACT_POST,
  HIRING_NO_WANTED_SKILL_POST,
  HIRING_REACT_POST,
  NODE_HYPHEN_COMPOUND_POST,
  NODE_JS_MENTION_POST,
  NON_HIRING_POST,
  REACTIVE_FALSE_POSITIVE_POST,
  RECRUITER_HEADLINE_NO_BODY_PHRASE_POST,
  SENIORITY_AND_REMOTE_POST,
} from "./fixtures/posts";

const compiled = compileRuleset(DEFAULT_RULESET);

describe("isJobPost", () => {
  it("flags a post with an explicit hiring phrase", () => {
    expect(isJobPost(HIRING_REACT_POST, compiled)).toBe(true);
  });

  it("rejects a congratulations post even when it mentions a skill and 'role'", () => {
    // This is the case the exclude list exists for: "congrats on landing
    // your new React role" must not be treated as a hiring post.
    expect(isJobPost(CONGRATS_REACT_POST, compiled)).toBe(false);
  });

  it("flags a post via recruiter headline even without a body hiring phrase", () => {
    expect(isJobPost(RECRUITER_HEADLINE_NO_BODY_PHRASE_POST, compiled)).toBe(true);
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

  it("reports which hiring phrase and recruiter term fired", () => {
    const verdict = evaluatePost(RECRUITER_HEADLINE_NO_BODY_PHRASE_POST, compiled);
    expect(verdict.explanation.recruiterTermHit).not.toBeNull();
  });
});
