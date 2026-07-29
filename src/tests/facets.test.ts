import { describe, expect, it } from "vitest";
import { extractFacets } from "../core/facets";

describe("extractFacets", () => {
  it("returns all-null facets for text with no signal", () => {
    expect(extractFacets("Just sharing an update about our roadmap.")).toEqual({
      seniority: null,
      workMode: null,
      sponsorship: null,
    });
  });

  it("extracts seniority, work mode, and offered sponsorship", () => {
    const facets = extractFacets(
      "Hiring a Senior backend engineer, hybrid, visa sponsorship available.",
    );
    expect(facets.seniority).toBe("senior");
    expect(facets.workMode).toBe("hybrid");
    expect(facets.sponsorship).toBe("offered");
  });

  it("extracts not-offered sponsorship distinctly from offered", () => {
    const facets = extractFacets("Onsite role in NYC. Unfortunately we cannot sponsor visas.");
    expect(facets.workMode).toBe("onsite");
    expect(facets.sponsorship).toBe("not-offered");
  });

  it("prioritizes staff/lead over senior when both are present", () => {
    expect(extractFacets("Staff+ / Senior engineer welcome to apply").seniority).toBe("staff");
  });

  it("recognizes junior and entry-level phrasing", () => {
    expect(extractFacets("Great opportunity for a junior developer").seniority).toBe("junior");
    expect(extractFacets("Entry-level role, no experience required").seniority).toBe("junior");
  });

  it("recognizes remote over no mode mentioned", () => {
    expect(extractFacets("Fully remote position, work from anywhere").workMode).toBe("remote");
  });
});
