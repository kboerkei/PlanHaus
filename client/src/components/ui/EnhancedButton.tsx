import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant hover:shadow-glow rounded-xl transform hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-elegant hover:shadow-glow rounded-xl",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-xl",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-input rounded-xl",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-xl",
        link: "text-primary underline-offset-4 hover:underline rounded-xl",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-elegant hover:shadow-glow rounded-xl",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-elegant hover:shadow-glow rounded-xl",
        wedding: "bg-gradient-to-r from-blush to-rose-gold text-white hover:from-blush/90 hover:to-rose-gold/90 shadow-wedding hover:shadow-wedding-lg rounded-xl transform hover:-translate-y-0.5",
        elegant: "bg-gradient-to-r from-champagne to-cream text-foreground hover:from-champagne/90 hover:to-cream/90 shadow-elegant hover:shadow-lg rounded-xl border border-champagne/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-12 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
        "mobile": "h-12 px-6 py-3 text-base", // Enhanced mobile size
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  success?: boolean
  error?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  ripple?: boolean
  pulse?: boolean
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading, 
    success,
    error,
    icon,
    iconPosition = 'left',
    ripple = true,
    pulse = false,
    children, 
    disabled, 
    onClick,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Enhanced accessibility for icon-only buttons
    const isIconOnly = size?.includes('icon') && !children
    const accessibilityProps = isIconOnly ? {
      'aria-label': props['aria-label'] || 'Button',
    } : {}

    // Ripple effect handler
    const handleRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple) return
      
      const button = event.currentTarget
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2
      
      const rippleElement = document.createElement('span')
      rippleElement.style.width = rippleElement.style.height = size + 'px'
      rippleElement.style.left = x + 'px'
      rippleElement.style.top = y + 'px'
      rippleElement.classList.add('ripple')
      
      button.appendChild(rippleElement)
      
      setTimeout(() => {
        rippleElement.remove()
      }, 600)
    }

    // Enhanced click handler
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) onClick(event)
      handleRipple(event)
    }

    // Determine button state
    const buttonState = loading ? 'loading' : success ? 'success' : error ? 'error' : 'default'
    
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            pulse && "animate-pulse",
            buttonState === 'success' && "bg-green-500 hover:bg-green-600",
            buttonState === 'error' && "bg-red-500 hover:bg-red-600",
            "relative overflow-hidden"
          )}
          ref={ref}
          disabled={disabled || loading}
          onClick={handleClick}
          {...accessibilityProps}
          {...props}
        >
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit"
              >
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit"
              >
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}
            
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit"
              >
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && !success && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              {icon && iconPosition === 'left' && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {icon}
                </motion.span>
              )}
              
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {children}
              </motion.span>
              
              {icon && iconPosition === 'right' && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {icon}
                </motion.span>
              )}
            </motion.div>
          )}
        </Comp>
      </motion.div>
    )
  }
)

EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton, buttonVariants }

// Ripple effect styles
const rippleStyles = `
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
  }

  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`

// Inject ripple styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = rippleStyles
  document.head.appendChild(style)
} 