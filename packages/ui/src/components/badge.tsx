import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border border-transparent transition-colors",
  {
    variants: {
      tone: {
        neutral: "bg-surface-2 text-muted border-border-subtle",
        info: "bg-primary/15 text-primary border-primary/25",
        brand:
          "bg-primary/20 text-primary border-primary/30 shadow-[0_0_12px_oklch(0.68_0.18_260/0.2)]",
        accent: "bg-accent/15 text-accent border-accent/25",
        success: "bg-success/15 text-success border-success/25",
        warning: "bg-warning/15 text-warning border-warning/25",
        danger: "bg-danger/15 text-danger border-danger/25",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 animate-pulse rounded-full",
            tone === "success" && "bg-success",
            tone === "warning" && "bg-warning",
            tone === "danger" && "bg-danger",
            tone === "brand" && "bg-primary",
            tone === "accent" && "bg-accent",
            (!tone || tone === "neutral" || tone === "info") && "bg-primary",
          )}
        />
      )}
      {children}
    </span>
  );
}
