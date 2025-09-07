import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Enhanced form validation and user feedback for Phase 2

// Real-time form validation hook
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema: Record<keyof T, (value: any) => string | null>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isValid, setIsValid] = useState(false);

  // Validate all fields
  const validateAll = (vals: T) => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let valid = true;

    Object.keys(validationSchema).forEach((key) => {
      const fieldKey = key as keyof T;
      const error = validationSchema[fieldKey](vals[fieldKey]);
      if (error) {
        newErrors[fieldKey] = error;
        valid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(valid);
    return valid;
  };

  // Update field value
  const setValue = (field: keyof T, value: any) => {
    const newValues = { ...values, [field]: value };
    setValues(newValues);

    // Validate field if touched
    if (touched[field]) {
      const error = validationSchema[field](value);
      setErrors(prev => ({
        ...prev,
        [field]: error || undefined
      }));
    }
  };

  // Mark field as touched
  const setTouchedField = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field
    const error = validationSchema[field](values[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error || undefined
    }));
  };

  // Reset form
  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsValid(false);
  };

  // Validate on mount
  useEffect(() => {
    validateAll(values);
  }, []);

  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setTouchedField,
    reset,
    validateAll: () => validateAll(values)
  };
};

// Enhanced form field with validation
export const ValidatedFormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  placeholder,
  className,
  ...props
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <motion.div
        className="relative"
        animate={{
          scale: isFocused ? 1.02 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blush-500 focus:ring-offset-2',
            isFocused ? 'border-blush-500' : 'border-blush-200',
            error && touched ? 'border-red-500' : '',
            className
          )}
          {...props}
        />
        
        {/* Success indicator */}
        {!error && touched && value && (
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && touched && (
          <motion.p
            className="text-sm text-red-600 flex items-center space-x-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced textarea with validation
export const ValidatedTextarea = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  placeholder,
  rows = 4,
  maxLength,
  className,
  ...props
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <motion.div
        className="relative"
        animate={{
          scale: isFocused ? 1.02 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-blush-500 focus:ring-offset-2',
            isFocused ? 'border-blush-500' : 'border-blush-200',
            error && touched ? 'border-red-500' : '',
            className
          )}
          {...props}
        />
        
        {/* Character count */}
        {maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {value.length}/{maxLength}
          </div>
        )}
      </motion.div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && touched && (
          <motion.p
            className="text-sm text-red-600 flex items-center space-x-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced select with validation
export const ValidatedSelect = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  options,
  placeholder,
  className,
  ...props
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <motion.div
        className="relative"
        animate={{
          scale: isFocused ? 1.02 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          className={cn(
            'w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-blush-500 focus:ring-offset-2',
            'bg-white',
            isFocused ? 'border-blush-500' : 'border-blush-200',
            error && touched ? 'border-red-500' : '',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </motion.div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && touched && (
          <motion.p
            className="text-sm text-red-600 flex items-center space-x-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// Form validation summary
export const FormValidationSummary = ({
  errors,
  touched,
  className
}: {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  className?: string;
}) => {
  const visibleErrors = Object.keys(errors).filter(key => touched[key] && errors[key]);

  if (visibleErrors.length === 0) return null;

  return (
    <motion.div
      className={cn(
        'bg-red-50 border border-red-200 rounded-lg p-4',
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h3 className="text-sm font-medium text-red-800">
          Please fix the following errors:
        </h3>
      </div>
      
      <ul className="list-disc list-inside space-y-1">
        {visibleErrors.map((key) => (
          <li key={key} className="text-sm text-red-700">
            {errors[key]}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

// Auto-save indicator
export const AutoSaveIndicator = ({
  isSaving,
  lastSaved,
  className
}: {
  isSaving: boolean;
  lastSaved?: Date;
  className?: string;
}) => {
  return (
    <motion.div
      className={cn(
        'flex items-center space-x-2 text-sm',
        isSaving ? 'text-amber-600' : 'text-green-600',
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {isSaving ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full"
          />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>
            {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'All changes saved'}
          </span>
        </>
      )}
    </motion.div>
  );
}; 