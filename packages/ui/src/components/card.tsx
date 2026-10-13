import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn";

export const cardVariants = cva("rounded-card text-fg border p-5 transition-all duration-200", {
  variants: {
    variant: {
      default: "border-border bg-surface",
      elevated: "border-border-subtle bg-surface-elevated shadow-lg shadow-black/20",
      glass: "border-border/60 bg-surface/80 backdrop-blur-md shadow-md",
      interactive:
        "border-border bg-surface hover:border-primary/50 hover:bg-surface-hover hover:shadow-lg hover:shadow-primary/5 cursor-pointer",
      gradient:
        "relative border-border bg-gradient-to-b from-surface-2 to-surface hover:border-primary/40",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant }), className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-muted text-sm", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pt-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center pt-4", className)} {...props} />;
}
