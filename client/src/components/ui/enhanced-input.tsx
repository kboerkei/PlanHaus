import React from "react";
import { cn } from "@/lib/utils";
import { Input as ShadcnInput, InputProps as ShadcnInputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const inputVariants = {
  wedding: [
    "border-rose-200 focus-visible:ring-rose-500 focus-visible:border-rose-500",
    "hover:border-rose-300 transition-colors duration-200",
    "focus:ring-2 focus:ring-rose-500/20"
  ].join(" "),
  
  error: [
    "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500",
    "text-red-900 placeholder:text-red-400"
  ].join(" "),
  
  success: [
    "border-green-500 focus-visible:ring-green-500 focus-visible:border-green-500",
    "text-green-900"
  ].join(" ")
};

export interface EnhancedInputProps extends Omit<ShadcnInputProps, 'variant'> {
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

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
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
    const sizeClasses = {
      sm: "h-8 px-2 text-sm",
      default: "h-10 px-3",
      lg: "h-12 px-4 text-lg"
    };
    
    return (
      <div className="space-y-2">
        {label && (
          <Label 
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium text-neutral-700",
              required && "after:content-['*'] after:ml-0.5 after:text-red-500"
            )}
          >
            {label}
          </Label>
        )}
        
        {description && (
          <p className="text-sm text-neutral-600">
            {description}
          </p>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}
          
          <ShadcnInput
            id={inputId}
            className={cn(
              sizeClasses[inputSize],
              effectiveVariant !== "default" && inputVariants[effectiveVariant as keyof typeof inputVariants],
              leftIcon && "pl-10",
              (rightIcon || error || success) && "pr-10",
              // Enhanced focus and hover states
              "transition-all duration-200",
              // Touch-friendly minimum height
              "min-h-[44px]",
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
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
          
          {success && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 font-medium" data-testid="input-error">
            {error}
          </p>
        )}
        
        {success && (
          <p className="text-sm text-green-600 font-medium" data-testid="input-success">
            {success}
          </p>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";

export { EnhancedInput };