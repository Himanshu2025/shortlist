import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Section({ title, description, action, children }: SectionProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white/60 p-5 dark:border-paper/10 dark:bg-white/[0.03]">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-ink dark:text-paper">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-ink/60 dark:text-paper/60">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
