import React from "react";
import { cn } from "@/lib/utils";
import { badgeVariants } from "@/design-system/components";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "outline";
}

const UnifiedBadge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        className={cn(
          badgeVariants.base,
          badgeVariants.variant[variant],
          className
        )}
        ref={ref}
        data-testid={`badge-${variant}`}
        {...props}
      />
    );
  }
);

UnifiedBadge.displayName = "UnifiedBadge";

export { UnifiedBadge, badgeVariants };