import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
    className?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  };
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  illustration?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  badge,
  illustration,
  className,
  compact = false,
}: EmptyStateProps) {
  const renderAction = (action: EmptyStateProps['primaryAction'], isPrimary = true) => {
    if (!action) return null;

    if (action.href) {
      return (
        <Button
          asChild
          variant={action.variant || (isPrimary ? "default" : "outline")}
          className={action.className}
        >
          <a href={action.href}>{action.label}</a>
        </Button>
      );
    }

    return (
      <Button
        onClick={action.onClick}
        variant={action.variant || (isPrimary ? "default" : "outline")}
        className={action.className}
      >
        {action.label}
      </Button>
    );
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      compact ? "py-8 px-4" : "py-16 px-6",
      className
    )}>
      {/* Illustration or Icon */}
      <div className={cn(
        "flex items-center justify-center rounded-full bg-muted mb-6",
        compact ? "h-16 w-16" : "h-24 w-24"
      )}>
        {illustration || (Icon && (
          <Icon className={cn(
            "text-muted-foreground",
            compact ? "h-6 w-6" : "h-8 w-8"
          )} />
        ))}
      </div>

      {/* Badge */}
      {badge && (
        <Badge 
          variant={badge.variant || "secondary"} 
          className="mb-4"
        >
          {badge.label}
        </Badge>
      )}

      {/* Title */}
      <h3 className={cn(
        "font-semibold text-foreground mb-2",
        compact ? "text-lg" : "text-xl"
      )}>
        {title}
      </h3>

      {/* Description */}
      <p className={cn(
        "text-muted-foreground mb-6 max-w-md",
        compact ? "text-sm" : "text-base"
      )}>
        {description}
      </p>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center space-x-3">
          {renderAction(primaryAction, true)}
          {renderAction(secondaryAction, false)}
        </div>
      )}
    </div>
  );
}

// Predefined empty states for common scenarios
export const EmptyStates = {
  noTasks: {
    title: "No tasks yet",
    description: "Create your first wedding task to start organizing your timeline and stay on track.",
    primaryAction: {
      label: "Add First Task",
      className: "gradient-blush-rose text-white",
    },
    secondaryAction: {
      label: "Browse Templates",
      variant: "outline" as const,
    },
  },
  
  noGuests: {
    title: "Your guest list awaits",
    description: "Add your first guests to start managing RSVPs, meal preferences, and seating arrangements.",
    primaryAction: {
      label: "Add First Guest",
      className: "gradient-blush-rose text-white",
    },
    secondaryAction: {
      label: "Import from CSV",
      variant: "outline" as const,
    },
  },
  
  noVendors: {
    title: "Find your perfect vendors",
    description: "Add vendors to keep track of quotes, contracts, and booking status for your wedding services.",
    primaryAction: {
      label: "Add First Vendor",
      className: "gradient-blush-rose text-white",
    },
    secondaryAction: {
      label: "Browse Recommendations",
      variant: "outline" as const,
    },
  },
  
  noBudgetItems: {
    title: "Start tracking your budget",
    description: "Add your first budget items to monitor expenses and stay within your wedding budget.",
    primaryAction: {
      label: "Add Budget Item",
      className: "gradient-blush-rose text-white",
    },
    secondaryAction: {
      label: "Set Budget Categories",
      variant: "outline" as const,
    },
  },
  
  noInspiration: {
    title: "Build your inspiration board",
    description: "Save photos, colors, and ideas that inspire your wedding vision. Create a beautiful mood board to share with vendors.",
    primaryAction: {
      label: "Add Inspiration",
      className: "gradient-blush-rose text-white",
    },
    secondaryAction: {
      label: "Import from Pinterest",
      variant: "outline" as const,
    },
  },

  searchEmpty: {
    title: "No results found",
    description: "We couldn't find anything matching your search. Try adjusting your filters or search terms.",
    primaryAction: {
      label: "Clear Filters",
      variant: "outline" as const,
    },
  },

  errorState: {
    title: "Something went wrong",
    description: "We encountered an error while loading your data. Please try refreshing the page or contact support if the problem continues.",
    primaryAction: {
      label: "Retry",
      variant: "default" as const,
    },
    secondaryAction: {
      label: "Contact Support",
      variant: "outline" as const,
    },
  },
} as const;