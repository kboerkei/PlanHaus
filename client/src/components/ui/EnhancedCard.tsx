import * as React from "react"
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-border bg-card",
        wedding: "card-wedding border-blush/20 bg-gradient-to-br from-white via-rose-50/30 to-champagne/20",
        elegant: "border-champagne/30 bg-gradient-to-br from-white to-cream/50 shadow-elegant",
        glass: "backdrop-blur-xl border-white/20 bg-white/80 shadow-lg",
        elevated: "shadow-lg hover:shadow-xl border-0 bg-white",
        minimal: "border-gray-100 bg-white shadow-sm",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        xl: "p-12",
        compact: "p-3",
      },
      interactive: {
        true: "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
    },
  }
)

export interface EnhancedCardProps
  extends Omit<HTMLMotionProps<"div">, keyof VariantProps<typeof cardVariants>>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode
  loading?: boolean
  skeleton?: boolean
  hover?: boolean
  pulse?: boolean
  glow?: boolean
  borderGradient?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'wedding' | 'elegant'
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    interactive = false,
    loading = false,
    skeleton = false,
    hover = false,
    pulse = false,
    glow = false,
    borderGradient = false,
    shadow,
    children, 
    onClick,
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)

    // Enhanced shadow classes
    const shadowClasses = {
      none: "",
      sm: "shadow-sm",
      md: "shadow-md", 
      lg: "shadow-lg",
      xl: "shadow-xl",
      wedding: "shadow-wedding",
      elegant: "shadow-elegant",
    }

    // Enhanced click handler with haptic feedback
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (onClick) {
        // Add haptic feedback for mobile
        if ('vibrate' in navigator) {
          navigator.vibrate(10)
        }
        onClick(event)
      }
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, interactive }),
          shadow && shadowClasses[shadow],
          hover && "hover:shadow-lg hover:-translate-y-1",
          pulse && "animate-pulse",
          glow && "shadow-glow",
          borderGradient && "border-gradient-wedding",
          className
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={interactive ? { scale: 1.02, y: -2 } : undefined}
        whileTap={interactive ? { scale: 0.98 } : undefined}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        {...props}
      >
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-blush border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {skeleton ? (
          <div className="space-y-3">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-4 w-5/6" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        )}

        {/* Border gradient animation */}
        {borderGradient && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: `linear-gradient(45deg, hsl(var(--blush)), hsl(var(--rose-gold)), hsl(var(--champagne)), hsl(var(--blush)))`,
              backgroundSize: '400% 400%',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        {/* Hover glow effect */}
        {glow && isHovered && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, hsl(var(--blush)/0.1) 0%, transparent 70%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </motion.div>
    )
  }
)

EnhancedCard.displayName = "EnhancedCard"

// Enhanced Card Header Component
export interface EnhancedCardHeaderProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  action?: React.ReactNode
}

const EnhancedCardHeader = React.forwardRef<HTMLDivElement, EnhancedCardHeaderProps>(
  ({ className, children, icon, badge, action, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn("flex items-start justify-between space-x-4", className)}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        {...props}
      >
        <div className="flex items-center space-x-3 flex-1">
          {icon && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="flex-shrink-0"
            >
              {icon}
            </motion.div>
          )}
          <div className="flex-1">
            {children}
            {badge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-2"
              >
                {badge}
              </motion.div>
            )}
          </div>
        </div>
        {action && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-shrink-0"
          >
            {action}
          </motion.div>
        )}
      </motion.div>
    )
  }
)

EnhancedCardHeader.displayName = "EnhancedCardHeader"

// Enhanced Card Content Component
export interface EnhancedCardContentProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode
  padding?: 'none' | 'sm' | 'default' | 'lg'
}

const EnhancedCardContent = React.forwardRef<HTMLDivElement, EnhancedCardContentProps>(
  ({ className, children, padding = 'default', ...props }, ref) => {
    const paddingClasses = {
      none: "",
      sm: "p-3",
      default: "p-6",
      lg: "p-8",
    }

    return (
      <motion.div
        ref={ref}
        className={cn(paddingClasses[padding], className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

EnhancedCardContent.displayName = "EnhancedCardContent"

// Enhanced Card Footer Component
export interface EnhancedCardFooterProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right' | 'between'
}

const EnhancedCardFooter = React.forwardRef<HTMLDivElement, EnhancedCardFooterProps>(
  ({ className, children, align = 'left', ...props }, ref) => {
    const alignClasses = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
      between: "justify-between",
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "flex items-center space-x-2 pt-6 border-t border-border/50",
          alignClasses[align],
          className
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

EnhancedCardFooter.displayName = "EnhancedCardFooter"

export { EnhancedCard, EnhancedCardHeader, EnhancedCardContent, EnhancedCardFooter } 