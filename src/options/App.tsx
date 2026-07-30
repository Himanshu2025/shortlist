import { ListFilter } from "lucide-react";
import { useSettings } from "./useSettings";
import {
  DEFAULT_SKILLS,
  DEFAULT_LOCATIONS,
  DEFAULT_HIRING_PHRASES,
  DEFAULT_EXCLUDE_PHRASES,
} from "../core/defaults";
import { Toggles } from "./components/Toggles";
import { FilterSentence } from "./components/FilterSentence";
import { SkillEditor } from "./components/SkillEditor";
import { PhraseList } from "./components/PhraseList";
import { Tester } from "./components/Tester";
import { ImportExport } from "./components/ImportExport";

export function App() {
  const { settings, update, replace } = useSettings();

  if (!settings) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink/50">
        Loading…
      </div>
    );
  }

  const { ruleset } = settings;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex max-w-2xl flex-col gap-5 px-6 py-10">
        <header className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-ink shadow-sm">
            <ListFilter className="size-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold">Shortlist</h1>
            <p className="text-sm text-ink/60">
              Highlights hiring posts that mention your skills, collapses the rest. Nothing here
              leaves your browser.
            </p>
          </div>
        </header>

        <FilterSentence skills={ruleset.skills} locations={ruleset.locations} />

        <Toggles
          enabled={settings.enabled}
          collapseMisses={settings.collapseMisses}
          onChangeEnabled={(value) => update((s) => ({ ...s, enabled: value }))}
          onChangeCollapseMisses={(value) => update((s) => ({ ...s, collapseMisses: value }))}
        />

        <SkillEditor
          skills={ruleset.skills}
          onChange={(skills) => update((s) => ({ ...s, ruleset: { ...s.ruleset, skills } }))}
          onReset={() =>
            update((s) => ({ ...s, ruleset: { ...s.ruleset, skills: DEFAULT_SKILLS } }))
          }
        />

        <PhraseList
          title="Locations"
          description="Tracked and shown as a chip when a post mentions one — doesn't hide posts about other locations."
          phrases={ruleset.locations}
          onChange={(locations) =>
            update((s) => ({ ...s, ruleset: { ...s.ruleset, locations } }))
          }
          onReset={() =>
            update((s) => ({ ...s, ruleset: { ...s.ruleset, locations: DEFAULT_LOCATIONS } }))
          }
          placeholder="Add a location…"
        />

        <PhraseList
          title="Hiring phrases"
          description="Gate 1: a post needs one of these in its body to be considered a hiring post at all — regardless of who's posting it."
          phrases={ruleset.hiringPhrases}
          onChange={(hiringPhrases) =>
            update((s) => ({ ...s, ruleset: { ...s.ruleset, hiringPhrases } }))
          }
          onReset={() =>
            update((s) => ({
              ...s,
              ruleset: { ...s.ruleset, hiringPhrases: DEFAULT_HIRING_PHRASES },
            }))
          }
          placeholder="e.g. now recruiting"
        />

        <PhraseList
          title="Exclude phrases"
          description="If any of these appear in the post, it's never treated as hiring — this is what kills 'congrats on your new React role'."
          phrases={ruleset.excludePhrases}
          onChange={(excludePhrases) =>
            update((s) => ({ ...s, ruleset: { ...s.ruleset, excludePhrases } }))
          }
          onReset={() =>
            update((s) => ({
              ...s,
              ruleset: { ...s.ruleset, excludePhrases: DEFAULT_EXCLUDE_PHRASES },
            }))
          }
          placeholder="e.g. proud to announce"
        />

        <Tester ruleset={ruleset} />

        <ImportExport
          ruleset={ruleset}
          onImport={(nextRuleset) => replace({ ...settings, ruleset: nextRuleset })}
        />
      </div>
    </div>
  );
}
