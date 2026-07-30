import { describe, expect, it } from "vitest";
import { normalizeQuotes } from "../core/phrase";

// Curly-vs-straight-quote tolerance in actual matching (a phrase typed with
// a straight apostrophe matching text rendered with a curly one) is
// exercised end-to-end in match.test.ts, since the tolerance comes from
// match.ts normalizing both the phrase (at compile time) and the input
// text (at match time) — not from the compiled pattern alone.
describe("normalizeQuotes", () => {
  it("converts curly single quotes to straight", () => {
    expect(normalizeQuotes("We’re hiring")).toBe("We're hiring");
  });

  it("converts curly double quotes to straight", () => {
    expect(normalizeQuotes("“hiring” now")).toBe('"hiring" now');
  });

  it("leaves straight quotes untouched", () => {
    expect(normalizeQuotes("We're hiring")).toBe("We're hiring");
  });
});
