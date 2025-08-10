import React from "react";
import { cn } from "@/lib/utils";
import { Card as ShadcnCard, CardProps as ShadcnCardProps } from "@/components/ui/card";

const cardVariants = {
  elegant: [
    "border border-rose-100 shadow-elegant",
    "bg-gradient-to-br from-white to-rose-50/30",
    "hover:shadow-lg hover:border-rose-200 transition-all duration-200"
  ].join(" "),
  
  soft: [
    "border border-neutral-200 shadow-soft",
    "hover:shadow-md hover:border-neutral-300 transition-all duration-200"
  ].join(" "),
  
  interactive: [
    "border border-neutral-200 shadow-sm cursor-pointer",
    "hover:shadow-md hover:border-rose-200 hover:-translate-y-0.5",
    "active:translate-y-0 active:shadow-sm transition-all duration-200"
  ].join(" "),
  
  outline: [
    "border-2 border-rose-200",
    "hover:border-rose-300 hover:shadow-sm transition-all duration-200"
  ].join(" "),
  
  ghost: [
    "border-transparent bg-rose-50/50",
    "hover:bg-rose-50 hover:shadow-sm transition-all duration-200"
  ].join(" ")
};

export interface EnhancedCardProps extends ShadcnCardProps {
  variant?: "default" | "elegant" | "soft" | "interactive" | "outline" | "ghost";
  size?: "sm" | "default" | "lg" | "xl";
  hover?: boolean;
  pressed?: boolean;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ 
    className, 
    variant = "default",
    size = "default",
    hover = false,
    pressed = false,
    children,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: "p-4",
      default: "p-6", 
      lg: "p-8",
      xl: "p-10"
    };

    return (
      <ShadcnCard
        className={cn(
          // Base styles
          "rounded-xl bg-white text-neutral-900",
          
          // Size classes
          sizeClasses[size],
          
          // Variant styles
          variant !== "default" && cardVariants[variant as keyof typeof cardVariants],
          
          // State classes
          hover && "transform hover:-translate-y-1 hover:scale-[1.02]",
          pressed && "scale-[0.98] shadow-sm",
          
          // Enhanced focus states for interactive cards
          variant === "interactive" && [
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
          ],
          
          className
        )}
        ref={ref}
        data-testid={`card-${variant}-${size}`}
        tabIndex={variant === "interactive" ? 0 : undefined}
        role={variant === "interactive" ? "button" : undefined}
        {...props}
      >
        {children}
      </ShadcnCard>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

export { EnhancedCard };