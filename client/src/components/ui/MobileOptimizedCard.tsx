import { memo, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileOptimizedCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
  touchOptimized?: boolean;
  headerActions?: React.ReactNode;
}

const MobileOptimizedCard = memo(forwardRef<HTMLDivElement, MobileOptimizedCardProps>(
  ({ title, children, className, compact = false, touchOptimized = true, headerActions }, ref) => {
    return (
      <Card 
        ref={ref}
        className={cn(
          'w-full transition-all duration-200',
          compact ? 'p-2 sm:p-4' : 'p-3 sm:p-6',
          touchOptimized && 'hover:shadow-lg active:scale-[0.98] md:active:scale-100',
          className
        )}
      >
        {title && (
          <CardHeader className={cn(
            'flex flex-row items-center justify-between space-y-0',
            compact ? 'pb-2' : 'pb-4'
          )}>
            <CardTitle className={cn(
              'text-lg font-semibold',
              compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
            )}>
              {title}
            </CardTitle>
            {headerActions && (
              <div className="flex items-center space-x-2">
                {headerActions}
              </div>
            )}
          </CardHeader>
        )}
        <CardContent className={cn(
          compact ? 'p-2 sm:p-4' : 'p-3 sm:p-6',
          !title && 'pt-0'
        )}>
          {children}
        </CardContent>
      </Card>
    );
  }
));

MobileOptimizedCard.displayName = 'MobileOptimizedCard';

export default MobileOptimizedCard;