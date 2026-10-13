import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../lib/cn";
import { Badge, type BadgeProps } from "./badge";
import { Card } from "./card";

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  change?: string;
  changeTone?: BadgeProps["tone"];
  description?: string;
  icon?: ReactNode;
}

export function StatCard({
  className,
  label,
  value,
  change,
  changeTone = "success",
  description,
  icon,
  ...props
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)} {...props}>
      <div className="flex items-start justify-between">
        <p className="text-muted text-xs font-medium tracking-wide uppercase">{label}</p>
        {icon && <div className="text-muted bg-surface-2 rounded-lg p-2">{icon}</div>}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-fg text-2xl font-bold tracking-tight">{value}</span>
        {change && (
          <Badge tone={changeTone} className="text-xs">
            {change}
          </Badge>
        )}
      </div>
      {description && <p className="text-muted mt-2 text-xs">{description}</p>}
    </Card>
  );
}
