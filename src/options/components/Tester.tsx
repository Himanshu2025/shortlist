import { useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Ruleset } from "../../core/types";
import { getCompiledRuleset } from "../../core/compile";
import { evaluatePost } from "../../core/match";
import { Section } from "./ui/Section";
import { Chip } from "./ui/Chip";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TesterProps {
  ruleset: Ruleset;
}

const SAMPLE_TEXT =
  "We're hiring a Senior React engineer to join our team, remote-friendly (Melbourne preferred). DM me if interested!";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="w-32 shrink-0 font-medium text-ink/60">{label}</span>
      <span className="font-mono text-ink">{value}</span>
    </div>
  );
}

export function Tester({ ruleset }: TesterProps) {
  const [text, setText] = useState(SAMPLE_TEXT);

  const compiled = useMemo(() => getCompiledRuleset(ruleset), [ruleset]);
  const verdict = useMemo(
    () => evaluatePost({ urn: "tester", text, authorName: "" }, compiled),
    [compiled, text],
  );

  return (
    <Section
      title="Test against sample text"
      description="Paste a post to see exactly which rule fired — this is the same evaluator the feed uses."
    >
      <div className="mb-4 flex flex-col gap-1.5">
        <Label htmlFor="tester-text">Post text</Label>
        <Textarea id="tester-text" value={text} onChange={(e) => setText(e.target.value)} rows={4} />
      </div>

      <div className="rounded-xl border border-ink/8 bg-paper/60 p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold",
              verdict.isMatch ? "bg-accent text-ink" : "bg-ink/10 text-ink/60",
            )}
          >
            {verdict.isMatch ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
            {verdict.isMatch ? "Would highlight" : "Would collapse"}
          </span>
          <span className="text-xs text-ink/50">
            {verdict.isJobPost ? "Gate 1 (hiring): passed" : "Gate 1 (hiring): failed"} ·{" "}
            {verdict.matchedSkills.length > 0
              ? `Gate 2 (skills): ${verdict.matchedSkills.length} matched`
              : "Gate 2 (skills): none matched"}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <Row label="Hiring phrase" value={verdict.explanation.hiringPhraseHit ?? "(none)"} />
          <Row label="Exclude phrase" value={verdict.explanation.excludePhraseHit ?? "(none)"} />
          <Row
            label="Required skills"
            value={
              verdict.explanation.missingRequiredSkills.length === 0
                ? "(all present, or none configured)"
                : `missing ${verdict.explanation.missingRequiredSkills.join(", ")}`
            }
          />
          <Row label="Seniority" value={verdict.facets.seniority ?? "(none)"} />
          <Row label="Work mode" value={verdict.facets.workMode ?? "(none)"} />
          <Row label="Sponsorship" value={verdict.facets.sponsorship ?? "(none)"} />
          <Row label="Salary" value={verdict.facets.salary ?? "(none)"} />
        </div>

        {(verdict.matchedSkills.length > 0 || verdict.matchedLocations.length > 0) && (
          <>
            <Separator className="my-3" />
            <div className="flex flex-wrap gap-1.5">
              {verdict.matchedSkills.map((skill) => (
                <Chip key={skill} label={skill} active />
              ))}
              {verdict.matchedLocations.map((loc) => (
                <Chip key={loc} label={loc} />
              ))}
            </div>
          </>
        )}

        {verdict.explanation.excludePhraseHit && (
          <p className="mt-3 text-xs text-ink/50">
            Excluded because "{verdict.explanation.excludePhraseHit}" matched — this is what stops
            "congrats on your new React role" from being flagged as hiring.
          </p>
        )}

        {verdict.explanation.missingRequiredSkills.length > 0 && (
          <p className="mt-3 text-xs text-ink/50">
            Not a match — missing required skill
            {verdict.explanation.missingRequiredSkills.length > 1 ? "s" : ""}:{" "}
            {verdict.explanation.missingRequiredSkills.join(", ")}.
          </p>
        )}
      </div>
    </Section>
  );
}
