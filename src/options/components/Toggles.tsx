import { Section } from "./ui/Section";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TogglesProps {
  enabled: boolean;
  collapseMisses: boolean;
  onChangeEnabled: (value: boolean) => void;
  onChangeCollapseMisses: (value: boolean) => void;
}

function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div>
        <Label htmlFor={id} className="block cursor-pointer text-sm font-medium text-ink">
          {label}
        </Label>
        <span className="block text-xs text-ink/60">{description}</span>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} className="mt-1 shrink-0" />
    </div>
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
      <div className="divide-y divide-ink/10">
        <Toggle
          id="toggle-enabled"
          label="Enable Shortlist"
          description="Master switch — turns highlighting and collapsing off across the feed."
          checked={enabled}
          onChange={onChangeEnabled}
        />
        <Toggle
          id="toggle-collapse"
          label="Collapse non-matching posts"
          description="When off, posts that don't match are left alone instead of collapsed to a strip."
          checked={collapseMisses}
          onChange={onChangeCollapseMisses}
        />
      </div>
    </Section>
  );
}
