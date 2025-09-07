import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const skeletonVariants = cva(
  "animate-pulse rounded-md bg-muted",
  {
    variants: {
      variant: {
        default: "bg-muted",
        wedding: "bg-gradient-to-r from-blush/20 to-rose-gold/20",
        elegant: "bg-gradient-to-r from-champagne/30 to-cream/30",
        shimmer: "bg-gradient-to-r from-muted via-muted-foreground/20 to-muted",
      },
      size: {
        sm: "h-4",
        default: "h-6",
        lg: "h-8",
        xl: "h-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface EnhancedSkeletonProps
  extends Omit<HTMLMotionProps<"div">, keyof VariantProps<typeof skeletonVariants>>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number
  height?: string | number
  circle?: boolean
  shimmer?: boolean
  pulse?: boolean
}

const EnhancedSkeleton = React.forwardRef<HTMLDivElement, EnhancedSkeletonProps>(
  ({ 
    className, 
    variant, 
    size, 
    width, 
    height, 
    circle = false,
    shimmer = false,
    pulse = true,
    ...props 
  }, ref) => {
    const style = {
      width: width,
      height: height,
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          skeletonVariants({ variant, size }),
          circle && "rounded-full",
          shimmer && "skeleton-shimmer",
          pulse && "animate-pulse",
          className
        )}
        style={style}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        {...props}
      />
    )
  }
)

EnhancedSkeleton.displayName = "EnhancedSkeleton"

// Pre-configured skeleton components
export const SkeletonText = React.forwardRef<HTMLDivElement, Omit<EnhancedSkeletonProps, 'size'> & { width?: string | number }>(
  ({ className, width = "100%", ...props }, ref) => (
    <EnhancedSkeleton
      ref={ref}
      size="default"
      width={width}
      className={cn("mb-2", className)}
      {...props}
    />
  )
)

export const SkeletonTitle = React.forwardRef<HTMLDivElement, Omit<EnhancedSkeletonProps, 'size' | 'width'>>(
  ({ className, ...props }, ref) => (
    <EnhancedSkeleton
      ref={ref}
      size="lg"
      width="60%"
      className={cn("mb-4", className)}
      {...props}
    />
  )
)

export const SkeletonAvatar = React.forwardRef<HTMLDivElement, Omit<EnhancedSkeletonProps, 'circle'> & { size?: 'sm' | 'default' | 'lg' | 'xl' }>(
  ({ className, size = "default", ...props }, ref) => (
    <EnhancedSkeleton
      ref={ref}
      size={size}
      circle
      width={size === "sm" ? 32 : size === "lg" ? 64 : size === "xl" ? 96 : 48}
      height={size === "sm" ? 32 : size === "lg" ? 64 : size === "xl" ? 96 : 48}
      className={className}
      {...props}
    />
  )
)

export const SkeletonButton = React.forwardRef<HTMLDivElement, Omit<EnhancedSkeletonProps, 'size' | 'width' | 'height'> & { width?: number; height?: number }>(
  ({ className, width = 120, height = 40, ...props }, ref) => (
    <EnhancedSkeleton
      ref={ref}
      size="default"
      width={width}
      height={height}
      className={cn("rounded-lg", className)}
      {...props}
    />
  )
)

export const SkeletonCard = React.forwardRef<HTMLDivElement, EnhancedSkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card p-6 space-y-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center space-x-4">
        <SkeletonAvatar size="sm" />
        <div className="space-y-2 flex-1">
          <SkeletonText width="60%" />
          <SkeletonText width="40%" />
        </div>
      </div>
      <SkeletonText />
      <SkeletonText width="80%" />
      <div className="flex space-x-2">
        <SkeletonButton width={80} />
        <SkeletonButton width={100} />
      </div>
    </div>
  )
)

export const SkeletonList = React.forwardRef<HTMLDivElement, { count?: number } & EnhancedSkeletonProps>(
  ({ count = 3, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4", className)}
      {...props}
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-4 p-4 rounded-lg border bg-card"
        >
          <SkeletonAvatar size="sm" />
          <div className="space-y-2 flex-1">
            <SkeletonText width="70%" />
            <SkeletonText width="50%" />
          </div>
          <SkeletonButton width={60} />
        </motion.div>
      ))}
    </div>
  )
)

export const SkeletonTable = React.forwardRef<HTMLDivElement, { rows?: number; columns?: number } & EnhancedSkeletonProps>(
  ({ rows = 5, columns = 4, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    >
      {/* Header */}
      <div className="flex space-x-4 p-4 bg-muted/50 rounded-lg">
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonText key={index} width="100%" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div
          key={rowIndex}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: rowIndex * 0.05 }}
          className="flex space-x-4 p-4 border-b"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonText key={colIndex} width="100%" />
          ))}
        </motion.div>
      ))}
    </div>
  )
)

export const SkeletonDashboard = React.forwardRef<HTMLDivElement, EnhancedSkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-6", className)}
      {...props}
    >
      {/* Header */}
      <div className="space-y-4">
        <SkeletonTitle width="40%" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border bg-card"
            >
              <SkeletonText width="50%" />
              <SkeletonTitle width="80%" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* List */}
      <SkeletonList count={4} />
    </div>
  )
)

export const SkeletonForm = React.forwardRef<HTMLDivElement, EnhancedSkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-6", className)}
      {...props}
    >
      <SkeletonTitle width="50%" />
      
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <SkeletonText width="30%" />
            <SkeletonText width="100%" height={48} />
          </motion.div>
        ))}
      </div>

      <div className="flex space-x-4 pt-4">
        <SkeletonButton width={100} />
        <SkeletonButton width={80} />
      </div>
    </div>
  )
)

// Enhanced shimmer animation
const shimmerStyles = `
  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      hsl(var(--muted)) 25%,
      hsl(var(--muted-foreground)) 50%,
      hsl(var(--muted)) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  .skeleton-wedding {
    background: linear-gradient(
      90deg,
      hsl(var(--blush)/0.1) 25%,
      hsl(var(--rose-gold)/0.2) 50%,
      hsl(var(--blush)/0.1) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
`

// Inject shimmer styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = shimmerStyles
  document.head.appendChild(style)
}

export { EnhancedSkeleton, skeletonVariants } 