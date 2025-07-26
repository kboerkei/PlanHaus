import { forwardRef, memo } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AccessibleButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  touchOptimized?: boolean;
}

const AccessibleButton = memo(forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ children, loading, loadingText, ariaLabel, ariaDescribedBy, touchOptimized = true, className, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading}
        className={cn(
          // Base accessibility styles
          'focus:ring-2 focus:ring-offset-2 focus:ring-rose-500',
          'transition-all duration-200',
          
          // Touch optimization for mobile
          touchOptimized && [
            'min-h-[44px] min-w-[44px]', // Minimum touch target size
            'active:scale-95 md:active:scale-100', // Touch feedback on mobile only
            'touch-manipulation' // Prevent double-tap zoom
          ],
          
          // High contrast mode support
          'high-contrast:border-2 high-contrast:border-solid',
          
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2 
            className="mr-2 h-4 w-4 animate-spin" 
            aria-hidden="true"
          />
        )}
        <span className={loading ? 'sr-only sm:not-sr-only' : ''}>
          {loading && loadingText ? loadingText : children}
        </span>
        {loading && (
          <span className="sr-only">Loading, please wait</span>
        )}
      </Button>
    );
  }
));

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;