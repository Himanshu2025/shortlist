import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-accent text-ink font-semibold hover:brightness-95",
  ghost:
    "bg-transparent text-ink/70 border border-ink/15 hover:bg-ink/5 dark:text-paper/70 dark:border-paper/20 dark:hover:bg-white/5",
  danger: "bg-transparent text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30",
};

export function Button({ variant = "ghost", className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        "rounded-md px-3 py-1.5 text-sm transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        VARIANT_CLASSES[variant],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
