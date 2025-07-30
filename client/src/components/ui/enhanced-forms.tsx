import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { Label } from "./label";
import { Alert, AlertDescription } from "./alert";
import { CheckCircle2, AlertCircle, Eye, EyeOff, Search } from "lucide-react";
import { useDebounce } from "@/hooks/usePerformance";

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helpText?: string;
  icon?: React.ReactNode;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
}

export const EnhancedInput = memo(({ 
  label, 
  error, 
  success, 
  helpText, 
  icon, 
  validation,
  className,
  onChange,
  value,
  type = "text",
  ...props 
}: EnhancedInputProps) => {
  const [internalValue, setInternalValue] = useState(value || "");
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const validateValue = (val: string) => {
    if (!validation || !touched) return null;

    if (validation.required && !val.trim()) {
      return "This field is required";
    }
    if (validation.minLength && val.length < validation.minLength) {
      return `Minimum ${validation.minLength} characters required`;
    }
    if (validation.maxLength && val.length > validation.maxLength) {
      return `Maximum ${validation.maxLength} characters allowed`;
    }
    if (validation.pattern && !validation.pattern.test(val)) {
      return "Invalid format";
    }
    if (validation.custom) {
      return validation.custom(val);
    }
    return null;
  };

  useEffect(() => {
    const errorMsg = validateValue(String(internalValue));
    setLocalError(errorMsg);
  }, [internalValue, touched, validation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    props.onBlur?.(e);
  };

  const finalError = error || localError;
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
          {validation?.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        
        <Input
          {...props}
          type={inputType}
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            "transition-all duration-200",
            icon && "pl-10",
            isPassword && "pr-10",
            finalError && "border-red-500 focus:border-red-500",
            success && "border-green-500 focus:border-green-500",
            className
          )}
        />
        
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}
        
        {success && !finalError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}
        
        {finalError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {finalError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {finalError}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        {success && !finalError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Alert className="py-2 border-green-200 bg-green-50 text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {success}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        {helpText && !finalError && !success && (
          <p className="text-xs text-muted-foreground">
            {helpText}
          </p>
        )}
      </AnimatePresence>
    </div>
  );
});

EnhancedInput.displayName = "EnhancedInput";

// Enhanced Search Input with debouncing
interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  className?: string;
}

export const SearchInput = memo(({ 
  placeholder = "Search...", 
  onSearch, 
  debounceMs = 300,
  className 
}: SearchInputProps) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={cn("pl-10", className)}
      />
    </div>
  );
});

SearchInput.displayName = "SearchInput";

// Auto-save Form Wrapper
interface AutoSaveFormProps {
  children: React.ReactNode;
  onSave: (data: any) => Promise<void>;
  saveDelay?: number;
  className?: string;
}

export const AutoSaveForm = memo(({ 
  children, 
  onSave, 
  saveDelay = 2000,
  className 
}: AutoSaveFormProps) => {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [formData, setFormData] = useState({});
  const debouncedData = useDebounce(formData, saveDelay);

  useEffect(() => {
    if (Object.keys(debouncedData).length > 0 && saveStatus !== "saving") {
      setSaveStatus("saving");
      onSave(debouncedData)
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("error"))
        .finally(() => {
          setTimeout(() => setSaveStatus("idle"), 2000);
        });
    }
  }, [debouncedData, onSave, saveStatus]);

  return (
    <div className={cn("relative", className)}>
      <div>
        {children}
      </div>
      
      <AnimatePresence>
        {saveStatus !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 right-2"
          >
            <div className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              saveStatus === "saving" && "bg-blue-100 text-blue-800",
              saveStatus === "saved" && "bg-green-100 text-green-800",
              saveStatus === "error" && "bg-red-100 text-red-800"
            )}>
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "saved" && "Saved"}
              {saveStatus === "error" && "Error saving"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

AutoSaveForm.displayName = "AutoSaveForm";

// Enhanced Textarea
interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  maxLength?: number;
}

export const EnhancedTextarea = memo(({ 
  label, 
  error, 
  helpText, 
  maxLength,
  className,
  value,
  onChange,
  ...props 
}: EnhancedTextareaProps) => {
  const [internalValue, setInternalValue] = useState(value || "");
  const currentLength = internalValue.toString().length;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (!maxLength || newValue.length <= maxLength) {
      setInternalValue(newValue);
      onChange?.(e);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      
      <Textarea
        {...props}
        value={internalValue}
        onChange={handleChange}
        className={cn(
          "transition-all duration-200",
          error && "border-red-500 focus:border-red-500",
          className
        )}
      />
      
      <div className="flex justify-between text-xs">
        <div>
          {error && (
            <span className="text-red-500">{error}</span>
          )}
          {helpText && !error && (
            <span className="text-muted-foreground">{helpText}</span>
          )}
        </div>
        {maxLength && (
          <span className={cn(
            "text-muted-foreground",
            currentLength > maxLength * 0.9 && "text-orange-500",
            currentLength === maxLength && "text-red-500"
          )}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

EnhancedTextarea.displayName = "EnhancedTextarea";