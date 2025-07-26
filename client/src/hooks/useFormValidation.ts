import { useState, useCallback } from 'react';
import { z } from 'zod';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((name: string, value: any): string => {
    const rule = validationRules[name];
    if (!rule) return '';

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${name} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value && !rule.required) return '';

    const stringValue = String(value);

    // Length validations
    if (rule.minLength && stringValue.length < rule.minLength) {
      return `${name} must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return `${name} must not exceed ${rule.maxLength} characters`;
    }

    // Email validation
    if (rule.email && !z.string().email().safeParse(stringValue).success) {
      return `${name} must be a valid email address`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return `${name} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) return customError;
    }

    return '';
  }, [validationRules]);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, validationRules]);

  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validate field on change if it was touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const setFieldTouched = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field when touched
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isFieldValid = useCallback((name: string): boolean => {
    return !errors[name];
  }, [errors]);

  const hasErrors = Object.values(errors).some(error => !!error);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateForm,
    resetForm,
    isFieldValid,
    hasErrors,
    isValid: !hasErrors
  };
}

// Pre-defined validation rules for common wedding planning forms
export const weddingValidationRules = {
  task: {
    title: { required: true, minLength: 1, maxLength: 200 },
    description: { maxLength: 1000 },
    priority: { required: true },
    dueDate: { 
      custom: (value: string) => {
        if (value && new Date(value) < new Date()) {
          return 'Due date cannot be in the past';
        }
        return null;
      }
    }
  },
  guest: {
    name: { required: true, minLength: 1, maxLength: 100 },
    email: { email: true, maxLength: 255 },
    phone: { 
      pattern: /^[\d\s\-\+\(\)]+$/,
      maxLength: 20 
    },
    group: { required: true }
  },
  budget: {
    item: { required: true, minLength: 1, maxLength: 100 },
    category: { required: true },
    estimatedCost: { 
      required: true,
      pattern: /^\d+(\.\d{2})?$/,
      custom: (value: string) => {
        const num = parseFloat(value);
        if (num < 0) return 'Cost cannot be negative';
        if (num > 1000000) return 'Cost seems unreasonably high';
        return null;
      }
    },
    actualCost: {
      pattern: /^\d+(\.\d{2})?$/,
      custom: (value: string) => {
        if (value && parseFloat(value) < 0) return 'Cost cannot be negative';
        return null;
      }
    }
  },
  vendor: {
    name: { required: true, minLength: 1, maxLength: 100 },
    category: { required: true },
    email: { email: true, maxLength: 255 },
    phone: { 
      pattern: /^[\d\s\-\+\(\)]+$/,
      maxLength: 20 
    },
    website: {
      custom: (value: string) => {
        if (value && !z.string().url().safeParse(value).success) {
          return 'Website must be a valid URL';
        }
        return null;
      }
    }
  }
};