import React from "react";
import { cn } from "@/lib/utils";
import { spinnerVariants } from "@/design-system/components";

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "default" | "lg" | "xl";
  variant?: "primary" | "secondary" | "neutral" | "white";
  text?: string;
  centered?: boolean;
}

const UnifiedLoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ 
    className, 
    size = "default", 
    variant = "primary",
    text,
    centered = false,
    ...props 
  }, ref) => {
    const spinnerContent = (
      <>
        <div
          className={cn(
            spinnerVariants.base,
            spinnerVariants.size[size],
            spinnerVariants.variant[variant],
            className
          )}
          data-testid={`spinner-${variant}-${size}`}
        />
        {text && (
          <p className={cn(
            "text-sm font-medium mt-2",
            variant === "white" ? "text-white" : "text-neutral-600"
          )}>
            {text}
          </p>
        )}
      </>
    );

    if (centered) {
      return (
        <div 
          ref={ref}
          className={cn("flex flex-col items-center justify-center", className)}
          {...props}
        >
          {spinnerContent}
        </div>
      );
    }

    return (
      <div 
        ref={ref}
        className={cn("flex items-center", text ? "flex-col" : "", className)}
        {...props}
      >
        {spinnerContent}
      </div>
    );
  }
);

UnifiedLoadingSpinner.displayName = "UnifiedLoadingSpinner";

// Skeleton loading components
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  lines?: number; // For text skeleton
}

const UnifiedSkeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = "rectangular",
    width,
    height,
    lines = 1,
    style,
    ...props 
  }, ref) => {
    if (variant === "text" && lines > 1) {
      return (
        <div ref={ref} className={cn("space-y-2", className)} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-neutral-200 rounded h-4"
              style={{
                width: index === lines - 1 ? "75%" : "100%",
                ...style
              }}
              data-testid={`skeleton-text-line-${index}`}
            />
          ))}
        </div>
      );
    }

    const baseClasses = "animate-pulse bg-neutral-200";
    const variantClasses = {
      text: "rounded h-4 w-full",
      circular: "rounded-full",
      rectangular: "rounded-none",
      rounded: "rounded-lg"
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          className
        )}
        style={{
          width: width || (variant === "circular" ? height : undefined),
          height: height || (variant === "text" ? "1rem" : "2rem"),
          ...style
        }}
        data-testid={`skeleton-${variant}`}
        {...props}
      />
    );
  }
);

UnifiedSkeleton.displayName = "UnifiedSkeleton";

export { UnifiedLoadingSpinner, UnifiedSkeleton, spinnerVariants };