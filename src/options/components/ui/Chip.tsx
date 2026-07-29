interface ChipProps {
  label: string;
  onRemove?: () => void;
  active?: boolean;
}

export function Chip({ label, onRemove, active }: ChipProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-xs",
        active
          ? "border-accent bg-accent/10 text-ink dark:text-paper font-semibold"
          : "border-ink/15 bg-white text-ink dark:border-paper/20 dark:bg-white/5 dark:text-paper",
      ].join(" ")}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="ml-0.5 rounded-sm text-ink/40 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent dark:text-paper/40 dark:hover:text-paper"
        >
          ×
        </button>
      )}
    </span>
  );
}
