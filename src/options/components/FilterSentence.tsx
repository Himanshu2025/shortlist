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
function joinAnd(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function FilterSentence({ skills, locations }: FilterSentenceProps) {
  const requiredNames = skills.filter((s) => s.required).map((s) => s.name).filter(Boolean);
  const optionalNames = skills.filter((s) => !s.required).map((s) => s.name).filter(Boolean);
  const skillNames = [...requiredNames, ...optionalNames];

  let sentence: string;
  if (skillNames.length === 0) {
    sentence =
      "No skills configured — every hiring post will be highlighted. Add a skill below to start filtering.";
  } else if (requiredNames.length > 0) {
    sentence =
      `Showing posts hiring for ${joinAnd(requiredNames)}` +
      (optionalNames.length > 0 ? ` (bonus if it also mentions ${joinOr(optionalNames)})` : "") +
      (locations.length > 0 ? `, flagging mentions of ${joinOr(locations)}` : "") +
      ".";
  } else {
    sentence =
      `Showing posts hiring for ${joinOr(skillNames)}` +
      (locations.length > 0 ? `, flagging mentions of ${joinOr(locations)}` : "") +
      ".";
  }

  return (
    <p className="flex items-start gap-2 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3 text-sm leading-relaxed text-ink shadow-[0_1px_2px_rgba(28,25,23,0.03)]">
      <Filter className="mt-0.5 size-4 shrink-0 text-accent" />
      <span>{sentence}</span>
    </p>
  );
}
