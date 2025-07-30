import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const weddingButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        wedding: "bg-gradient-to-r from-blush to-rose-gold text-white hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-blush focus:ring-offset-2 shadow-md border-0",
        elegant: "bg-champagne hover:bg-muted-gold text-gray-800 border border-muted-gold/30 hover:border-muted-gold/50 hover:shadow-md",
        soft: "bg-cream border border-blush/20 hover:bg-blush/10 text-gray-700 hover:shadow-sm",
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
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
)

export interface WeddingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof weddingButtonVariants> {
  asChild?: boolean
}

const WeddingButton = React.forwardRef<HTMLButtonElement, WeddingButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(weddingButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
WeddingButton.displayName = "WeddingButton"

export { WeddingButton, weddingButtonVariants }