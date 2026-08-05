import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-sm text-ink placeholder:text-ink/30",
      "transition-colors duration-150 hover:border-ink/25",
      "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
