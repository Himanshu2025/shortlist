import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-accent text-ink font-semibold shadow-sm shadow-accent/30 hover:brightness-95",
        ghost: "bg-transparent text-ink/70 border border-ink/15 hover:border-ink/25 hover:bg-ink/5",
        destructive: "bg-transparent text-red-700 hover:bg-red-50",
        subtle: "bg-transparent text-ink/50 hover:text-ink",
      },
      size: {
        default: "h-8 px-3",
        sm: "h-7 px-2 text-xs",
        icon: "h-7 w-7 shrink-0",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
