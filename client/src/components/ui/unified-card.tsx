import React from "react";
import { cn } from "@/lib/utils";
import { cardVariants } from "@/design-system/components";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elegant" | "soft" | "outline" | "ghost" | "interactive";
  size?: "sm" | "default" | "lg" | "xl";
  asChild?: boolean;
}

const UnifiedCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default",
    children,
    ...props 
  }, ref) => {
    return (
      <div
        className={cn(
          cardVariants.base,
          cardVariants.variant[variant],
          cardVariants.size[size],
          className
        )}
        ref={ref}
        data-testid={`card-${variant}-${size}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

UnifiedCard.displayName = "UnifiedCard";

// Card sub-components
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 pb-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-xl font-semibold leading-tight tracking-tight text-neutral-900", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-neutral-600 leading-relaxed", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("", className)} // No default padding, let size variant handle it
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-6", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { 
  UnifiedCard, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  cardVariants 
};