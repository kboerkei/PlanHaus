import * as React from "react"
import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "centered" | "wide"
}

export function PageLayout({ children, className, variant = "default" }: PageLayoutProps) {
  const layoutClasses = {
    default: "max-w-7xl mx-auto px-6 lg:px-8",
    centered: "max-w-4xl mx-auto px-6 lg:px-8",
    wide: "max-w-full mx-auto px-6 lg:px-8",
  }

  return (
    <div className={cn("min-h-screen bg-background page-enter", className)}>
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-primary/5 to-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-accent/5 to-primary/10 rounded-full blur-2xl animate-pulse" />
        
        <div className={cn("relative py-8", layoutClasses[variant])}>
          {children}
        </div>
      </div>
    </div>
  )
}

interface GridLayoutProps {
  children: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: "sm" | "md" | "lg" | "xl"
}

export function GridLayout({ children, className, cols = 12, gap = "lg" }: GridLayoutProps) {
  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-12",
  }

  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
    12: "grid-cols-12"
  }

  return (
    <div className={cn("grid", colClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  )
}

interface SectionProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export function Section({ children, className, title, subtitle, action }: SectionProps) {
  return (
    <section className={cn("space-y-6", className)}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            {title && (
              <h2 className="text-2xl font-serif font-semibold tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  )
}