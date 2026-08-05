import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ChipProps {
  label: string;
  onRemove?: () => void;
  active?: boolean;
}

export function Chip({ label, onRemove, active }: ChipProps) {
  return (
    <Badge variant={active ? "accent" : "outline"} className={cn(onRemove && "pr-1")}>
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="ml-0.5 rounded-sm p-0.5 text-ink/40 transition-colors duration-150 hover:bg-ink/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <X className="size-3" />
        </button>
      )}
    </Badge>
  );
}
