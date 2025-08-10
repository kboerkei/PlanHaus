import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumbs({ items, className, showHome = true }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)} aria-label="Breadcrumb">
      {showHome && (
        <>
          <Link href="/dashboard" className="flex items-center hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
          {items.length > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          )}
        </>
      )}
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            {item.href && !item.current ? (
              <Link 
                href={item.href} 
                className={cn(
                  "hover:text-foreground transition-colors",
                  isLast && "text-foreground font-medium"
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(
                isLast || item.current ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            )}
            
            {!isLast && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// Step indicator for multi-step processes
interface StepIndicatorProps {
  steps: Array<{
    label: string;
    description?: string;
    completed?: boolean;
    current?: boolean;
  }>;
  className?: string;
}

export function StepIndicator({ steps, className }: StepIndicatorProps) {
  return (
    <nav className={cn("flex items-center justify-center", className)} aria-label="Progress">
      <ol className="flex items-center space-x-4">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                    step.completed
                      ? "border-primary bg-primary text-primary-foreground"
                      : step.current
                      ? "border-primary bg-background text-primary"
                      : "border-muted-foreground/25 bg-background text-muted-foreground"
                  )}
                >
                  {step.completed ? (
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className={cn(
                    "text-sm font-medium",
                    step.current ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
              
              {!isLast && (
                <div className="flex-1 h-px bg-muted-foreground/25 mx-4 mt-4" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}