import { Button } from "./Button";

interface ResetSectionProps {
  label?: string;
  onReset: () => void;
}

export function ResetSection({ label = "Reset to defaults", onReset }: ResetSectionProps) {
  return (
    <Button
      variant="ghost"
      className="text-xs"
      onClick={() => {
        if (window.confirm(`${label}? This replaces your edits in this section.`)) {
          onReset();
        }
      }}
    >
      {label}
    </Button>
  );
}
