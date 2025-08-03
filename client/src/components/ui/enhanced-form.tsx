import { memo, forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";
import { Button } from "./button";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

interface EnhancedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'autoSave'> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  loading?: boolean;
  showPasswordToggle?: boolean;
  autoSave?: boolean;
  debounceMs?: number;
}

export const EnhancedInput = memo(forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    label, 
    error, 
    success, 
    hint, 
    loading, 
    showPasswordToggle, 
    type: initialType = "text",
    autoSave,
    debounceMs = 500,
    onChange,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasBeenFocused, setHasBeenFocused] = useState(false);
    
    const type = showPasswordToggle && initialType === "password" 
      ? (showPassword ? "text" : "password") 
      : initialType;

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    const showValidation = hasBeenFocused && (hasError || hasSuccess);

    return (
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <Label 
            htmlFor={props.id}
            className={cn(
              "text-sm font-medium transition-colors",
              hasError && "text-destructive",
              hasSuccess && "text-green-600"
            )}
          >
            {label}
          </Label>
        )}
        
        <div className="relative">
          <Input
            ref={ref}
            type={type}
            className={cn(
              "transition-all duration-200",
              "focus:ring-2 focus:ring-offset-2",
              hasError && "border-destructive focus:ring-destructive",
              hasSuccess && "border-green-500 focus:ring-green-500",
              isFocused && "ring-2 ring-primary/20",
              loading && "pr-10",
              showPasswordToggle && "pr-10",
              className
            )}
            onFocus={(e) => {
              setIsFocused(true);
              setHasBeenFocused(true);
              if (props.onFocus) props.onFocus(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              if (props.onBlur) props.onBlur(e);
            }}
            onChange={onChange}
            {...props}
          />
          
          {/* Loading indicator */}
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {/* Password toggle */}
          {showPasswordToggle && !loading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {/* Validation icon */}
          {showValidation && !loading && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {hasError ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
          )}
        </div>
        
        {/* Error/Success/Hint messages */}
        <AnimatePresence mode="wait">
          {(error || success || hint) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              )}
              {success && !error && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {success}
                </p>
              )}
              {hint && !error && !success && (
                <p className="text-sm text-muted-foreground">
                  {hint}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
));

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export const AutoSaveIndicator = memo(({ status, className }: AutoSaveIndicatorProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Saving...',
          className: 'text-blue-600'
        };
      case 'saved':
        return {
          icon: <CheckCircle2 className="h-3 w-3" />,
          text: 'Saved',
          className: 'text-green-600'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'Save failed',
          className: 'text-red-600'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  
  if (!config) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={cn(
          "flex items-center gap-1 text-xs",
          config.className,
          className
        )}
      >
        {config.icon}
        {config.text}
      </motion.div>
    </AnimatePresence>
  );
});

EnhancedInput.displayName = "EnhancedInput";
AutoSaveIndicator.displayName = "AutoSaveIndicator";