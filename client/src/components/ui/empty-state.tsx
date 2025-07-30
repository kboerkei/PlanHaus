import * as React from "react"
import { cn } from "@/lib/utils"
import { WeddingButton } from "./wedding-button"
import { Heart, Sparkles } from "lucide-react"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: "wedding" | "elegant" | "soft"
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  illustration?: boolean
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ 
    className, 
    icon, 
    title, 
    description, 
    action, 
    secondaryAction,
    illustration = true,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "empty-state-wedding",
          className
        )}
        {...props}
      >
        {/* Illustration or Icon */}
        <div className="relative">
          {illustration && (
            <div className="empty-illustration">
              {icon}
              {/* Add decorative elements */}
              <Heart className="w-4 h-4 text-rose-gold absolute -top-1 -right-1 animate-pulse" />
              <Sparkles className="w-3 h-3 text-blush absolute -bottom-1 -left-1 animate-pulse delay-300" />
            </div>
          )}
          {!illustration && icon && (
            <div className="w-16 h-16 text-blush/40 mb-4">
              {icon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2 max-w-md">
          <h3 className="font-serif text-xl text-gray-800 font-semibold">
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions */}
        {action && (
          <div className="flex flex-col items-center space-y-2 mt-6">
            <WeddingButton 
              variant={action.variant || "wedding"} 
              size="lg"
              onClick={action.onClick}
              className="min-w-[160px]"
            >
              {action.label}
            </WeddingButton>
            
            {secondaryAction && (
              <WeddingButton
                variant="ghost"
                size="sm"
                onClick={secondaryAction.onClick}
                className="text-gray-600 hover:text-gray-800"
              >
                {secondaryAction.label}
              </WeddingButton>
            )}
          </div>
        )}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState }