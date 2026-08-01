import { describe, expect, it } from "vitest";
import { extractFacets } from "../core/facets";

describe("extractFacets", () => {
  it("returns all-null facets for text with no signal", () => {
    expect(extractFacets("Just sharing an update about our roadmap.")).toEqual({
      seniority: null,
      workMode: null,
      sponsorship: null,
      salary: null,
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

  it("extracts a salary range with k-suffixed amounts", () => {
    expect(extractFacets("Paying $120k-$150k depending on experience.").salary).toBe(
      "$120k-$150k",
    );
  });

  it("extracts a salary range with 'to' as the separator and one currency symbol", () => {
    expect(extractFacets("Budget is $90,000 to 110,000 for this role.").salary).toBe(
      "$90,000 to 110,000",
    );
  });

  it("extracts a single salary figure, not just ranges", () => {
    expect(extractFacets("Base salary of £55k plus equity.").salary).toBe("£55k");
  });

  it("returns null salary when no currency figure is present", () => {
    expect(extractFacets("Great compensation and benefits package.").salary).toBeNull();
  });
});
