import { cva, type VariantProps } from "class-variance-authority";
import type { InputHTMLAttributes } from "react";

import { cn } from "../lib/cn";

export const inputVariants = cva(
  "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-fg placeholder:text-subtle transition-all duration-150 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      inputSize: {
        sm: "h-8 px-2.5 text-xs",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      inputSize: "md",
    },
  },
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">, VariantProps<typeof inputVariants> {}

export function Input({ className, inputSize, type = "text", ...props }: InputProps) {
  return <input type={type} className={cn(inputVariants({ inputSize }), className)} {...props} />;
}
