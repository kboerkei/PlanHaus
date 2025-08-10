import React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/design-system/components";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "elegant" | "destructive";
  size?: "sm" | "default" | "lg" | "xl" | "icon";
  loading?: boolean;
  loadingText?: string;
  asChild?: boolean;
}

const UnifiedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "primary", 
    size = "default", 
    loading = false,
    loadingText,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <button
        className={cn(
          buttonVariants.wedding.base,
          buttonVariants.wedding.size[size],
          buttonVariants.wedding.variant[variant],
          loading && buttonVariants.wedding.loading,
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
        data-testid={`button-${variant}-${size}`}
      >
        {loading && (
          <Loader2 
            className={cn(
              "animate-spin",
              size === "sm" ? "h-3 w-3" : 
              size === "lg" ? "h-5 w-5" :
              size === "xl" ? "h-6 w-6" : "h-4 w-4",
              children && "mr-2"
            )} 
          />
        )}
        {loading && loadingText ? loadingText : children}
      </button>
    );
  }
);

UnifiedButton.displayName = "UnifiedButton";

export { UnifiedButton, buttonVariants };