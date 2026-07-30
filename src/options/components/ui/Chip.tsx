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
          className="ml-0.5 rounded-sm p-0.5 text-ink/40 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <X className="size-3" />
        </button>
      )}
    </Badge>
  );
}
