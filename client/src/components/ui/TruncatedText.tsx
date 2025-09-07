import React from 'react';
import { cn } from '@/lib/utils';

interface TruncatedTextProps {
  children: string;
  className?: string;
  maxLines?: 1 | 2;
  title?: string;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({
  children,
  className,
  maxLines = 1,
  title
}) => {
  const tooltipTitle = title || children;
  
  if (maxLines === 1) {
    return (
      <span
        className={cn('truncate', className)}
        title={tooltipTitle}
      >
        {children}
      </span>
    );
  }
  
  return (
    <span
      className={cn(
        'line-clamp-2 overflow-hidden break-words',
        className
      )}
      title={tooltipTitle}
    >
      {children}
    </span>
  );
}; 