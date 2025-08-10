import { memo, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "wouter";

interface BreadcrumbProps {
  children: React.ReactNode;
  className?: string;
}

interface BreadcrumbItemProps {
  href?: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}

interface BreadcrumbSeparatorProps {
  className?: string;
}

const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ children, className, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="breadcrumb"
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </nav>
  )
);

const BreadcrumbItem = memo(({ href, active, children, className }: BreadcrumbItemProps) => {
  const baseClasses = cn(
    "transition-colors hover:text-foreground",
    active && "text-foreground font-medium",
    className
  );

  if (href && !active) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <span className={baseClasses} aria-current={active ? "page" : undefined}>
      {children}
    </span>
  );
});

const BreadcrumbSeparator = memo(({ className }: BreadcrumbSeparatorProps) => (
  <ChevronRight className={cn("h-4 w-4", className)} />
));

const BreadcrumbHome = memo(({ href = "/", className }: { href?: string; className?: string }) => (
  <Link href={href} className={cn("transition-colors hover:text-foreground", className)} aria-label="Go to home page">
    <Home className="h-4 w-4" />
    <span className="sr-only">Home</span>
  </Link>
));

Breadcrumb.displayName = "Breadcrumb";
BreadcrumbItem.displayName = "BreadcrumbItem";
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
BreadcrumbHome.displayName = "BreadcrumbHome";

export { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbHome };