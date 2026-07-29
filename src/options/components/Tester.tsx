import { useMemo, useState } from "react";
import type { Ruleset } from "../../core/types";
import { getCompiledRuleset } from "../../core/compile";
import { evaluatePost } from "../../core/match";
import { Section } from "./ui/Section";
import { Chip } from "./ui/Chip";

interface TesterProps {
  ruleset: Ruleset;
}

const SAMPLE_TEXT =
  "We're hiring a Senior React engineer to join our team, remote-friendly (Melbourne preferred). DM me if interested!";
const SAMPLE_HEADLINE = "Technical Recruiter at Acme";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="w-32 shrink-0 font-medium text-ink/60 dark:text-paper/60">{label}</span>
      <span className="font-mono text-ink dark:text-paper">{value}</span>
    </div>
  );
}

export function Tester({ ruleset }: TesterProps) {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [headline, setHeadline] = useState(SAMPLE_HEADLINE);

  const compiled = useMemo(() => getCompiledRuleset(ruleset), [ruleset]);
  const verdict = useMemo(
    () =>
      evaluatePost(
        { urn: "tester", text, authorName: "", authorHeadline: headline },
        compiled,
      ),
    [compiled, text, headline],
  );

  return (
    <Section
      title="Test against sample text"
      description="Paste a post and headline to see exactly which rule fired — this is the same evaluator the feed uses."
    >
      <div className="mb-3 flex flex-col gap-2">
        <label className="text-xs font-medium text-ink/60 dark:text-paper/60">
          Post text
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent dark:border-paper/20 dark:bg-white/5 dark:text-paper"
          />
        </label>
        <label className="text-xs font-medium text-ink/60 dark:text-paper/60">
          Author headline (optional)
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="mt-1 w-full rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent dark:border-paper/20 dark:bg-white/5 dark:text-paper"
          />
        </label>
      </div>

      <div className="rounded-md border border-ink/10 p-3 dark:border-paper/10">
        <div className="mb-3 flex items-center gap-2">
          <span
            className={[
              "rounded-md px-2 py-1 text-xs font-semibold",
              verdict.isMatch
                ? "bg-accent text-ink"
                : "bg-ink/10 text-ink/60 dark:bg-white/10 dark:text-paper/60",
            ].join(" ")}
          >
            {verdict.isMatch ? "Would highlight" : "Would collapse"}
          </span>
          <span className="text-xs text-ink/50 dark:text-paper/50">
            {verdict.isJobPost ? "Gate 1 (hiring): passed" : "Gate 1 (hiring): failed"} ·{" "}
            {verdict.matchedSkills.length > 0
              ? `Gate 2 (skills): ${verdict.matchedSkills.length} matched`
              : "Gate 2 (skills): none matched"}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <Row label="Hiring phrase" value={verdict.explanation.hiringPhraseHit ?? "(none)"} />
          <Row label="Recruiter term" value={verdict.explanation.recruiterTermHit ?? "(none)"} />
          <Row label="Exclude phrase" value={verdict.explanation.excludePhraseHit ?? "(none)"} />
          <Row label="Seniority" value={verdict.facets.seniority ?? "(none)"} />
          <Row label="Work mode" value={verdict.facets.workMode ?? "(none)"} />
          <Row label="Sponsorship" value={verdict.facets.sponsorship ?? "(none)"} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {verdict.matchedSkills.map((skill) => (
            <Chip key={skill} label={skill} active />
          ))}
          {verdict.matchedLocations.map((loc) => (
            <Chip key={loc} label={loc} />
          ))}
        </div>

        {verdict.explanation.excludePhraseHit && (
          <p className="mt-3 text-xs text-ink/50 dark:text-paper/50">
            Excluded because "{verdict.explanation.excludePhraseHit}" matched — this is what stops
            "congrats on your new React role" from being flagged as hiring.
          </p>
        )}
      </div>
    </Section>
  );
}
