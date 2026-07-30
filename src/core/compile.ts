import type { Ruleset } from "./types";
import { boundedPattern, NEVER_MATCH } from "./phrase";

export interface CompiledPhraseList {
  /** Single alternation regex — the fast path used on every post. */
  combined: RegExp;
  /** Individual compiled phrases, in list order — used by explain() to
   * report which specific phrase fired. */
  items: { phrase: string; regex: RegExp }[];
}

export interface CompiledSkill {
  name: string;
  combined: RegExp;
  items: { phrase: string; regex: RegExp }[];
}

export interface CompiledRuleset {
  hiring: CompiledPhraseList;
  exclude: CompiledPhraseList;
  locations: CompiledPhraseList;
  skills: CompiledSkill[];
}

function compilePhraseList(phrases: string[]): CompiledPhraseList {
  const items = phrases.map((phrase) => ({
    phrase,
    regex: new RegExp(boundedPattern(phrase), "i"),
  }));
  const combined =
    phrases.length === 0
      ? NEVER_MATCH
      : new RegExp(phrases.map(boundedPattern).join("|"), "i");
  return { combined, items };
}

export function compileRuleset(ruleset: Ruleset): CompiledRuleset {
  return {
    hiring: compilePhraseList(ruleset.hiringPhrases),
    exclude: compilePhraseList(ruleset.excludePhrases),
    locations: compilePhraseList(ruleset.locations),
    skills: ruleset.skills.map((skill) => {
      // A skill's name is implicitly its own alias.
      const phrases = [skill.name, ...skill.aliases];
      const { combined, items } = compilePhraseList(phrases);
      return { name: skill.name, combined, items };
    }),
  };
}

/** Memoized against the ruleset reference — the content script and options
 * tester both hold one ruleset object at a time and replace it wholesale
 * when settings change, so reference equality is a cheap, correct cache key. */
export function memoizeCompileRuleset() {
  let lastRuleset: Ruleset | null = null;
  let lastCompiled: CompiledRuleset | null = null;
  return (ruleset: Ruleset): CompiledRuleset => {
    if (ruleset !== lastRuleset || !lastCompiled) {
      lastCompiled = compileRuleset(ruleset);
      lastRuleset = ruleset;
    }
    return lastCompiled;
  };
}

export const getCompiledRuleset = memoizeCompileRuleset();
