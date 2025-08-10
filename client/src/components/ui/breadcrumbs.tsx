import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumbs({ items, className, showHome = true }: BreadcrumbsProps) {
  const allItems = showHome ? [{ label: 'Home', href: '/' }, ...items] : items;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex", className)}>
      <ol role="list" className="flex items-center space-x-2 text-sm">
        {allItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight 
                className="h-4 w-4 text-neutral-400 mr-2" 
                aria-hidden="true" 
              />
            )}
            
            {index === 0 && showHome && (
              <Home 
                className="h-4 w-4 text-neutral-500 mr-1" 
                aria-hidden="true" 
              />
            )}
            
            {item.current || !item.href ? (
              <span 
                className={cn(
                  "font-medium",
                  item.current ? "text-rose-600" : "text-neutral-900"
                )}
                aria-current={item.current ? "page" : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link href={item.href}>
                <a 
                  className="text-neutral-500 hover:text-rose-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 rounded"
                  tabIndex={0}
                >
                  {item.label}
                </a>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Hook for automatic breadcrumb generation
export function useBreadcrumbs(currentPath: string): BreadcrumbItem[] {
  return React.useMemo(() => {
    const pathSegments = currentPath.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Generate breadcrumbs based on path segments
    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      const isLast = index === pathSegments.length - 1;
      
      // Convert segment to readable label
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        label,
        href: isLast ? undefined : href,
        current: isLast,
      });
    });

    return breadcrumbs;
  }, [currentPath]);
}