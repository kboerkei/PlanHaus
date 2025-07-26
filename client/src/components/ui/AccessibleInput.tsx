import { forwardRef, memo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AccessibleInputProps extends Omit<InputProps, 'id'> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  id: string; // Make id required for accessibility
}

const AccessibleInput = memo(forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, error, hint, required, showPasswordToggle, id, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type;

    const errorId = error ? `${id}-error` : undefined;
    const hintId = hint ? `${id}-hint` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(' ');

    return (
      <div className="space-y-2">
        <Label 
          htmlFor={id}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            required && 'after:content-["*"] after:ml-1 after:text-red-500'
          )}
        >
          {label}
        </Label>
        
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type={inputType}
            required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy || undefined}
            className={cn(
              // Enhanced focus styles for accessibility
              'focus:ring-2 focus:ring-rose-500 focus:ring-offset-2',
              
              // Error styles
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              
              // Password input padding
              showPasswordToggle && 'pr-10',
              
              className
            )}
            {...props}
          />
          
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                'absolute right-3 top-1/2 transform -translate-y-1/2',
                'p-1 rounded-sm',
                'text-gray-500 hover:text-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2',
                'transition-colors duration-200'
              )}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
        
        {hint && (
          <p id={hintId} className="text-sm text-gray-600 dark:text-gray-400">
            {hint}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId}
            className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    );
  }
));

AccessibleInput.displayName = 'AccessibleInput';

export default AccessibleInput;