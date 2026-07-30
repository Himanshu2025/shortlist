import { Filter } from "lucide-react";
import type { SkillRule } from "../../core/types";

function joinOr(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} or ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, or ${items[items.length - 1]}`;
}

interface FilterSentenceProps {
  skills: SkillRule[];
  locations: string[];
}

/** Locations are tracked and shown as a chip when a post mentions them,
 * same as seniority/work mode — they don't gate the match. Only skills
 * (found in a post already flagged as hiring) decide what's highlighted,
 * so the sentence says exactly that and nothing more. */
export function FilterSentence({ skills, locations }: FilterSentenceProps) {
  const skillNames = skills.map((s) => s.name).filter(Boolean);

  const sentence =
    skillNames.length === 0
      ? "No skills configured — every hiring post will be highlighted. Add a skill below to start filtering."
      : `Showing posts hiring for ${joinOr(skillNames)}` +
        (locations.length > 0 ? `, flagging mentions of ${joinOr(locations)}` : "") +
        ".";

  return (
    <p className="flex items-start gap-2 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-2.5 text-sm text-ink">
      <Filter className="mt-0.5 size-4 shrink-0 text-accent" />
      <span>{sentence}</span>
    </p>
  );
}
