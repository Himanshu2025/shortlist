import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Skills/phrases render as monospace — they're literal query tokens, so
// mono is semantically right here, not decorative.
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-xs",
  {
    variants: {
      variant: {
        outline: "border-ink/15 bg-white text-ink",
        accent: "border-accent bg-accent/10 font-semibold text-ink",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
