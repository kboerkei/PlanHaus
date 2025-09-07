import React from 'react';
import { cn } from '@/lib/utils';

interface CardHeaderProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  actions,
  className
}) => {
  return (
    <div className={cn('flex items-center justify-between pb-3', className)}>
      <div className="flex-1 min-w-0">
        {children}
      </div>
      {actions && (
        <div className="flex-shrink-0 ml-2">
          {actions}
        </div>
      )}
    </div>
  );
}; 