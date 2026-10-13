import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "../lib/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg hover:bg-primary-hover shadow-sm",
        secondary:
          "bg-surface-2 text-fg hover:bg-surface-hover border border-border-subtle hover:border-border",
        outline: "border border-border text-fg hover:bg-surface-2 hover:border-primary/40",
        ghost: "text-fg hover:bg-surface-2",
        glow: "bg-primary text-primary-fg hover:bg-primary-hover shadow-[0_0_22px_oklch(0.68_0.18_260/0.38)] hover:shadow-[0_0_30px_oklch(0.68_0.18_260/0.55)] active:scale-[0.98]",
        accent:
          "bg-accent text-accent-fg hover:bg-accent/90 shadow-[0_0_18px_oklch(0.75_0.16_195/0.25)] active:scale-[0.98]",
        danger: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base font-semibold",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
