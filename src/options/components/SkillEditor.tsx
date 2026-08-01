import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { SkillRule } from "../../core/types";
import { Chip } from "./ui/Chip";
import { Section } from "./ui/Section";
import { ResetSection } from "./ui/ResetSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SkillEditorProps {
  skills: SkillRule[];
  onChange: (skills: SkillRule[]) => void;
  onReset: () => void;
}

function SkillRow({
  skill,
  onChange,
  onRemove,
}: {
  skill: SkillRule;
  onChange: (skill: SkillRule) => void;
  onRemove: () => void;
}) {
  const [aliasDraft, setAliasDraft] = useState("");

  const addAlias = () => {
    const trimmed = aliasDraft.trim();
    if (!trimmed) return;
    if (skill.aliases.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      setAliasDraft("");
      return;
    }
    onChange({ ...skill, aliases: [...skill.aliases, trimmed] });
    setAliasDraft("");
  };

  const removeAlias = (index: number) => {
    onChange({ ...skill, aliases: skill.aliases.filter((_, i) => i !== index) });
  };

  const requiredId = `skill-required-${skill.name}`;

  return (
    <div className="rounded-md border border-ink/10 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Input
          type="text"
          value={skill.name}
          onChange={(e) => onChange({ ...skill, name: e.target.value })}
          className="w-auto font-mono font-semibold"
        />
        <div className="ml-auto flex items-center gap-2">
          <Label htmlFor={requiredId} className="cursor-pointer text-xs text-ink/60">
            Required
          </Label>
          <Switch
            id={requiredId}
            checked={skill.required}
            onCheckedChange={(required) => onChange({ ...skill, required })}
          />
        </div>
        <Button variant="destructive" size="sm" onClick={onRemove}>
          <Trash2 />
          Remove skill
        </Button>
      </div>
      <div className="mb-2 flex flex-wrap gap-2">
        {skill.aliases.map((alias, i) => (
          <Chip key={`${alias}-${i}`} label={alias} onRemove={() => removeAlias(i)} />
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={aliasDraft}
          onChange={(e) => setAliasDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addAlias();
            }
          }}
          placeholder="Add an alias…"
          className="max-w-[220px] text-xs"
        />
        <Button variant="ghost" size="sm" className="text-xs" onClick={addAlias}>
          <Plus />
          Add alias
        </Button>
      </div>
    </div>
  );
}

export function SkillEditor({ skills, onChange, onReset }: SkillEditorProps) {
  const addSkill = () => {
    onChange([...skills, { name: "New skill", aliases: [], required: false }]);
  };

  const updateSkill = (index: number, next: SkillRule) => {
    onChange(skills.map((s, i) => (i === index ? next : s)));
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <Section
      title="Skills"
      description="A post matches once it's flagged as hiring AND names at least one of these — by name or by alias. Mark a skill Required to demand it specifically; with any Required skills set, all of them must be named and the rest are optional bonus chips."
      action={<ResetSection label="Reset skills to defaults" onReset={onReset} />}
    >
      <div className="mb-3 flex flex-col gap-2">
        {skills.map((skill, i) => (
          <SkillRow
            key={i}
            skill={skill}
            onChange={(next) => updateSkill(i, next)}
            onRemove={() => removeSkill(i)}
          />
        ))}
      </div>
      <Button variant="ghost" onClick={addSkill}>
        <Plus />
        Add skill
      </Button>
    </Section>
  );
}
