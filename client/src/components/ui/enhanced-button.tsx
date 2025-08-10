import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from "@/components/ui/button";

// Enhanced button variants for wedding theme
const weddingVariants = {
  wedding: "bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 hover:shadow-lg active:from-rose-700 active:to-rose-800 active:scale-[0.98] focus-visible:ring-rose-500 shadow-md transition-all duration-200",
  elegant: "bg-white border border-rose-200 text-rose-800 shadow-elegant hover:bg-rose-50 hover:border-rose-300 hover:shadow-lg active:bg-rose-100 active:scale-[0.98] focus-visible:ring-rose-500",
  champagne: "bg-champagne text-rose-800 border border-rose-200 hover:bg-champagne/80 hover:border-rose-300 hover:shadow-md active:bg-champagne/60 active:scale-[0.98] focus-visible:ring-rose-500"
};

export interface EnhancedButtonProps extends ShadcnButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "wedding" | "elegant" | "champagne";
  loading?: boolean;
  loadingText?: string;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default",
    loading = false,
    loadingText,
    disabled,
    children,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    
    // Use wedding variants if specified
    const customVariant = variant as keyof typeof weddingVariants;
    const isWeddingVariant = Object.keys(weddingVariants).includes(variant);
    
    return (
      <ShadcnButton
        className={cn(
          isWeddingVariant && weddingVariants[customVariant],
          loading && "opacity-75 cursor-not-allowed pointer-events-none",
          // Ensure proper hover/focus/active states
          "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          // Disabled states
          "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
          // Touch-friendly sizing
          "min-h-[44px]",
          className
        )}
        variant={isWeddingVariant ? "default" : variant}
        size={size}
        ref={ref}
        disabled={isDisabled}
        data-testid={`button-${variant}-${size}${loading ? "-loading" : ""}`}
        {...props}
      >
        {loading && (
          <Loader2 
            className={cn(
              "animate-spin",
              size === "sm" ? "h-3 w-3" : 
              size === "lg" ? "h-5 w-5" :
              size === "icon" ? "h-4 w-4" : "h-4 w-4",
              children && "mr-2"
            )} 
          />
        )}
        {loading && loadingText ? loadingText : children}
      </ShadcnButton>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton };