import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md hover:-translate-y-0.5",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/30 hover:shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm hover:-translate-y-0.5",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
        link: 
          "text-primary underline-offset-4 hover:underline",
        wedding:
          "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 hover:shadow-lg hover:-translate-y-1 dark:from-rose-600 dark:to-pink-600 dark:hover:from-rose-700 dark:hover:to-pink-700",
        blush:
          "bg-blush text-gray-800 hover:bg-blush/80 hover:shadow-md hover:-translate-y-0.5 dark:bg-blush dark:text-gray-100 dark:hover:bg-blush/90",
        elegant:
          "bg-gradient-to-r from-champagne to-rose-gold text-gray-800 hover:from-champagne/90 hover:to-rose-gold/90 hover:shadow-lg hover:-translate-y-1 dark:from-champagne/80 dark:to-rose-gold/80 dark:text-gray-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };