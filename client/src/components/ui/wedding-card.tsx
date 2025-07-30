import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const weddingCardVariants = cva(
  "rounded-lg transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground shadow-sm border",
        wedding: "bg-white border border-blush/20 shadow-soft hover:shadow-medium backdrop-blur-sm",
        elegant: "bg-gradient-to-br from-cream/30 to-champagne/20 border border-blush/10 shadow-soft backdrop-blur-sm",
        floating: "bg-white/95 backdrop-blur-lg border border-white/20 shadow-strong hover:shadow-xl hover:-translate-y-1",
        glass: "bg-white/90 backdrop-blur-md border border-white/20 shadow-medium",
      },
      padding: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

export interface WeddingCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof weddingCardVariants> {}

const WeddingCard = React.forwardRef<HTMLDivElement, WeddingCardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(weddingCardVariants({ variant, padding, className }))}
      {...props}
    />
  )
)
WeddingCard.displayName = "WeddingCard"

const WeddingCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
WeddingCardHeader.displayName = "WeddingCardHeader"

const WeddingCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-serif font-semibold leading-none tracking-tight text-dusty-rose",
      className
    )}
    {...props}
  />
))
WeddingCardTitle.displayName = "WeddingCardTitle"

const WeddingCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
WeddingCardDescription.displayName = "WeddingCardDescription"

const WeddingCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
WeddingCardContent.displayName = "WeddingCardContent"

const WeddingCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
WeddingCardFooter.displayName = "WeddingCardFooter"

export {
  WeddingCard,
  WeddingCardHeader,
  WeddingCardFooter,
  WeddingCardTitle,
  WeddingCardDescription,
  WeddingCardContent,
}