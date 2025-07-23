import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionHeaderVariants = cva(
  "space-y-2",
  {
    variants: {
      variant: {
        default: "",
        wedding: "text-center",
        minimal: "",
        elegant: "relative",
      },
      size: {
        sm: "",
        default: "",
        lg: "",
        xl: "",
      },
      alignment: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      alignment: "left",
    },
  }
);

const titleVariants = cva(
  "font-bold tracking-tight",
  {
    variants: {
      variant: {
        default: "text-foreground",
        wedding: "font-heading bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent dark:from-rose-400 dark:via-pink-400 dark:to-purple-400",
        minimal: "text-foreground",
        elegant: "font-heading text-foreground",
      },
      size: {
        sm: "text-lg sm:text-xl",
        default: "text-xl sm:text-2xl lg:text-3xl",
        lg: "text-2xl sm:text-3xl lg:text-4xl",
        xl: "text-3xl sm:text-4xl lg:text-5xl xl:text-6xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const subtitleVariants = cva(
  "text-muted-foreground",
  {
    variants: {
      size: {
        sm: "text-sm",
        default: "text-base sm:text-lg",
        lg: "text-lg sm:text-xl",
        xl: "text-xl sm:text-2xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface SectionHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionHeaderVariants> {
  title: string;
  subtitle?: string;
  showAccent?: boolean;
  accentColor?: "rose" | "blush" | "champagne" | "primary";
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({
    className,
    variant,
    size,
    alignment,
    title,
    subtitle,
    showAccent = false,
    accentColor = "rose",
    ...props
  }, ref) => {
    const accentColorClasses = {
      rose: "bg-gradient-to-r from-rose-400 to-pink-500",
      blush: "bg-gradient-to-r from-blush to-dusty-rose",
      champagne: "bg-gradient-to-r from-champagne to-rose-gold",
      primary: "bg-gradient-to-r from-primary to-primary/80",
    };

    return (
      <div
        ref={ref}
        className={cn(sectionHeaderVariants({ variant, alignment, className }))}
        {...props}
      >
        {variant === "elegant" && (
          <div className="absolute -inset-2 bg-gradient-to-r from-rose-400/10 via-pink-400/5 to-purple-400/10 rounded-lg blur-xl" />
        )}
        
        <div className="relative">
          <h2 className={cn(titleVariants({ variant, size }))}>
            {title}
          </h2>
          
          {subtitle && (
            <p className={cn(subtitleVariants({ size }))}>
              {subtitle}
            </p>
          )}
          
          {showAccent && (
            <div 
              className={cn(
                "mx-auto h-1 rounded-full mt-4",
                alignment === "center" ? "w-16 sm:w-24" : "w-12 sm:w-16",
                alignment === "right" && "ml-auto mr-0",
                alignment === "left" && "mr-auto ml-0",
                accentColorClasses[accentColor]
              )}
            />
          )}
        </div>
      </div>
    );
  }
);
SectionHeader.displayName = "SectionHeader";

export { SectionHeader, sectionHeaderVariants };