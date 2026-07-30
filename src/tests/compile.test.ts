import { describe, expect, it } from "vitest";
import type { Ruleset } from "../core/types";
import { compileRuleset } from "../core/compile";
import { matchSkills } from "../core/match";

function rulesetWith(overrides: Partial<Ruleset>): Ruleset {
  return {
    skills: [],
    locations: [],
    hiringPhrases: [],
    excludePhrases: [],
    ...overrides,
  };
}

describe("compileRuleset", () => {
  it("escapes regex special characters in phrases", () => {
    // Unescaped, "C++" is invalid regex — "+" applied to "+" throws
    // "Nothing to repeat" when the pattern compiles. Reaching the
    // assertions at all proves escaping happened.
    const compiled = compileRuleset(
      rulesetWith({ skills: [{ name: "C++", aliases: [] }] }),
    );
    expect(matchSkills("Looking for a C++ developer", compiled)).toContain("C++");
    expect(matchSkills("just the letter c on its own", compiled)).toEqual([]);
  });

  it("collapses internal whitespace in multi-word phrases to match line-wrapped text", () => {
    const compiled = compileRuleset(
      rulesetWith({ hiringPhrases: ["we're looking for"] }),
    );
    const wrapped = { urn: "1", text: "we're   looking\nfor  engineers", authorName: "" };
    expect(compiled.hiring.combined.test(wrapped.text)).toBe(true);
  });

  it("treats a skill's own name as an implicit alias", () => {
    const compiled = compileRuleset(
      rulesetWith({ skills: [{ name: "Go", aliases: ["golang"] }] }),
    );
    expect(matchSkills("I love Go development", compiled)).toContain("Go");
    expect(matchSkills("built entirely in Golang", compiled)).toContain("Go");
  });

  it("word-boundary guards prevent 'react' from matching 'reactive'", () => {
    const compiled = compileRuleset(
      rulesetWith({ skills: [{ name: "React", aliases: [] }] }),
    );
    expect(matchSkills("we use reactive extensions", compiled)).toEqual([]);
    expect(matchSkills("we use React daily", compiled)).toContain("React");
  });

  it("an empty phrase list never matches, even the empty string", () => {
    const compiled = compileRuleset(rulesetWith({}));
    expect(compiled.hiring.combined.test("")).toBe(false);
    expect(compiled.hiring.combined.test("anything at all")).toBe(false);
  });
});
