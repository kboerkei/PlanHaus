import React from "react";
import { cn } from "@/lib/utils";
import { inputVariants, formFieldVariants } from "@/design-system/components";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "wedding" | "error" | "success";
  inputSize?: "sm" | "default" | "lg";
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const UnifiedInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant = "default",
    inputSize = "default",
    label,
    description,
    error,
    success,
    required,
    leftIcon,
    rightIcon,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const effectiveVariant = error ? "error" : success ? "success" : variant;
    
    return (
      <div className={cn(formFieldVariants.base)}>
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              formFieldVariants.label,
              required && "after:content-['*'] after:ml-0.5 after:text-semantic-error-500"
            )}
          >
            {label}
          </label>
        )}
        
        {description && (
          <p className={formFieldVariants.description}>
            {description}
          </p>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            className={cn(
              inputVariants.base,
              inputVariants.size[inputSize],
              inputVariants.variant[effectiveVariant],
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            data-testid={`input-${effectiveVariant}-${inputSize}`}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
              {rightIcon}
            </div>
          )}
          
          {error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-semantic-error-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
          
          {success && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-semantic-success-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}
        </div>
        
        {error && (
          <p className={formFieldVariants.error} data-testid="input-error">
            {error}
          </p>
        )}
        
        {success && (
          <p className="text-sm text-semantic-success-600 font-medium" data-testid="input-success">
            {success}
          </p>
        )}
      </div>
    );
  }
);

UnifiedInput.displayName = "UnifiedInput";

export { UnifiedInput, inputVariants };