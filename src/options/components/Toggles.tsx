import { Section } from "./ui/Section";

interface TogglesProps {
  enabled: boolean;
  collapseMisses: boolean;
  onChangeEnabled: (value: boolean) => void;
  onChangeCollapseMisses: (value: boolean) => void;
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-2">
      <span>
        <span className="block text-sm font-medium text-ink dark:text-paper">{label}</span>
        <span className="block text-xs text-ink/60 dark:text-paper/60">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      />
    </label>
  );
}

export function Toggles({
  enabled,
  collapseMisses,
  onChangeEnabled,
  onChangeCollapseMisses,
}: TogglesProps) {
  return (
    <Section title="General">
      <div className="divide-y divide-ink/10 dark:divide-paper/10">
        <Toggle
          label="Enable Shortlist"
          description="Master switch — turns highlighting and collapsing off across the feed."
          checked={enabled}
          onChange={onChangeEnabled}
        />
        <Toggle
          label="Collapse non-matching posts"
          description="When off, posts that don't match are left alone instead of collapsed to a strip."
          checked={collapseMisses}
          onChange={onChangeCollapseMisses}
        />
      </div>
    </Section>
  );
}
