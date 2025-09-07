import React from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '../../lib/utils';

// Base field wrapper
interface FieldWrapperProps {
  label: string;
  name: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({
  label,
  name,
  children,
  required = false,
  error,
  description,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Text Input
interface TextFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
  type?: 'text' | 'email' | 'password' | 'url';
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  name,
  placeholder,
  required = false,
  error,
  description,
  className,
  type = 'text',
}) => {
  const { register, formState: { errors } } = useFormContext();
  const fieldError = error || errors[name]?.message as string;

  return (
    <FieldWrapper
      label={label}
      name={name}
      required={required}
      error={fieldError}
      description={description}
      className={className}
    >
      <input
        {...register(name)}
        type={type}
        id={name}
        placeholder={placeholder}
        className={cn(
          "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
          fieldError && "border-red-300 focus:border-red-500 focus:ring-red-500"
        )}
      />
    </FieldWrapper>
  );
};

// Number Input
interface NumberFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  name,
  placeholder,
  required = false,
  error,
  description,
  className,
  min,
  max,
  step,
}) => {
  const { register, formState: { errors } } = useFormContext();
  const fieldError = error || errors[name]?.message as string;

  return (
    <FieldWrapper
      label={label}
      name={name}
      required={required}
      error={fieldError}
      description={description}
      className={className}
    >
      <input
        {...register(name, { valueAsNumber: true })}
        type="number"
        id={name}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={cn(
          "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
          fieldError && "border-red-300 focus:border-red-500 focus:ring-red-500"
        )}
      />
    </FieldWrapper>
  );
};

// Money Input
interface MoneyFieldProps {
  label: string;
  name: string;
  currency?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
}

export const MoneyField: React.FC<MoneyFieldProps> = ({
  label,
  name,
  currency = "USD",
  placeholder,
  required = false,
  error,
  description,
  className,
}) => {
  const { register, formState: { errors } } = useFormContext();
  const fieldError = error || errors[name]?.message as string;

  return (
    <FieldWrapper
      label={label}
      name={name}
      required={required}
      error={fieldError}
      description={description}
      className={className}
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">{currency === "USD" ? "$" : currency}</span>
        </div>
        <input
          {...register(name, { valueAsNumber: true })}
          type="number"
          id={name}
          placeholder={placeholder}
          min="0"
          step="0.01"
          className={cn(
            "block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
            fieldError && "border-red-300 focus:border-red-500 focus:ring-red-500"
          )}
        />
      </div>
    </FieldWrapper>
  );
};

// Select Input
interface SelectFieldProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  options,
  placeholder,
  required = false,
  error,
  description,
  className,
}) => {
  const { register, formState: { errors } } = useFormContext();
  const fieldError = error || errors[name]?.message as string;

  return (
    <FieldWrapper
      label={label}
      name={name}
      required={required}
      error={fieldError}
      description={description}
      className={className}
    >
      <select
        {...register(name)}
        id={name}
        className={cn(
          "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
          fieldError && "border-red-300 focus:border-red-500 focus:ring-red-500"
        )}
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
    </FieldWrapper>
  );
};

// MultiSelect Input
interface MultiSelectFieldProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  name,
  options,
  required = false,
  error,
  description,
  className,
}) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const fieldError = error || errors[name]?.message as string;
  const selectedValues = watch(name) || [];

  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v: string) => v !== value)
      : [...selectedValues, value];
    setValue(name, newValues);
  };

  return (
    <FieldWrapper
      label={label}
      name={name}
      required={required}
      error={fieldError}
      description={description}
      className={className}
    >
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </FieldWrapper>
  );
};

// Date Input
interface DateFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
  min?: string;
  max?: string;
}

export const DateField: React.FC<DateFieldProps> = ({
  label,
  name,
  required = false,
  error,
  description,
  className,
  min,
  max,
}) => {
  const { register, formState: { errors } } = useFormContext();
  const fieldError = error || errors[name]?.message as string;

  return (
    <FieldWrapper
      label={label}
      name={name}
      required={required}
      error={fieldError}
      description={description}
      className={className}
    >
      <input
        {...register(name)}
        type="date"
        id={name}
        min={min}
        max={max}
        className={cn(
          "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
          fieldError && "border-red-300 focus:border-red-500 focus:ring-red-500"
        )}
      />
    </FieldWrapper>
  );
};

// Date Range Input
interface DateRangeFieldProps {
  label: string;
  startName: string;
  endName: string;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
}

export const DateRangeField: React.FC<DateRangeFieldProps> = ({
  label,
  startName,
  endName,
  required = false,
  error,
  description,
  className,
}) => {
  const { register, formState: { errors } } = useFormContext();
  const startError = errors[startName]?.message as string;
  const endError = errors[endName]?.message as string;
  const fieldError = error || startError || endError;

  return (
    <FieldWrapper
      label={label}
      name={startName}
      required={required}
      error={fieldError}
      description={description}
      className={className}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor={startName} className="block text-xs font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            {...register(startName)}
            type="date"
            id={startName}
            className={cn(
              "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
              startError && "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
          />
        </div>
        <div>
          <label htmlFor={endName} className="block text-xs font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            {...register(endName)}
            type="date"
            id={endName}
            className={cn(
              "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
              endError && "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
          />
        </div>
      </div>
    </FieldWrapper>
  );
};

// Phone Input
interface PhoneFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  label,
  name,
  placeholder = "+1 (555) 123-4567",
  required = false,
  error,
  description,
  className,
}) => {
  const { register, formState: { errors } } = useFormContext();
  const fieldError = error || errors[name]?.message as string;

  return (
    <FieldWrapper
      label={label}
      name={name}
      required={required}
      error={fieldError}
      description={description}
      className={className}
    >
      <input
        {...register(name)}
        type="tel"
        id={name}
        placeholder={placeholder}
        className={cn(
          "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
          fieldError && "border-red-300 focus:border-red-500 focus:ring-red-500"
        )}
      />
    </FieldWrapper>
  );
};

// Email Input
interface EmailFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
}

export const EmailField: React.FC<EmailFieldProps> = ({
  label,
  name,
  placeholder = "email@example.com",
  required = false,
  error,
  description,
  className,
}) => {
  const { register, formState: { errors } } = useFormContext();
  const fieldError = error || errors[name]?.message as string;

  return (
    <FieldWrapper
      label={label}
      name={name}
      required={required}
      error={fieldError}
      description={description}
      className={className}
    >
      <input
        {...register(name)}
        type="email"
        id={name}
        placeholder={placeholder}
        className={cn(
          "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
          fieldError && "border-red-300 focus:border-red-500 focus:ring-red-500"
        )}
      />
    </FieldWrapper>
  );
};

// Toggle Input
interface ToggleFieldProps {
  label: string;
  name: string;
  description?: string;
  className?: string;
}

export const ToggleField: React.FC<ToggleFieldProps> = ({
  label,
  name,
  description,
  className,
}) => {
  const { register, watch } = useFormContext();
  const isChecked = watch(name);

  return (
    <FieldWrapper
      label={label}
      name={name}
      description={description}
      className={className}
    >
      <div className="flex items-center">
        <button
          type="button"
          role="switch"
          aria-checked={isChecked}
          onClick={() => register(name).onChange({ target: { name, value: !isChecked } as any })}
          className={cn(
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            isChecked ? "bg-blue-600" : "bg-gray-200"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              isChecked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
        <span className="ml-3 text-sm text-gray-700">{isChecked ? "Yes" : "No"}</span>
      </div>
    </FieldWrapper>
  );
};

// Chips Input
interface ChipsFieldProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  maxSelections?: number;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
}

export const ChipsField: React.FC<ChipsFieldProps> = ({
  label,
  name,
  options,
  maxSelections,
  required = false,
  error,
  description,
  className,
}) => {
  const { watch, setValue, formState: { errors } } = useFormContext();
  const fieldError = error || errors[name]?.message as string;
  const selectedValues = watch(name) || [];

  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v: string) => v !== value)
      : maxSelections && selectedValues.length >= maxSelections
      ? selectedValues
      : [...selectedValues, value];
    setValue(name, newValues);
  };

  return (
    <FieldWrapper
      label={label}
      name={name}
      required={required}
      error={fieldError}
      description={description}
      className={className}
    >
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          const isDisabled = Boolean(maxSelections && !isSelected && selectedValues.length >= maxSelections);
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              disabled={isDisabled}
              className={cn(
                "px-3 py-1 text-sm font-medium rounded-full border transition-colors",
                isSelected
                  ? "bg-blue-100 border-blue-300 text-blue-800"
                  : isDisabled
                  ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {maxSelections && (
        <p className="text-xs text-gray-500 mt-1">
          {selectedValues.length}/{maxSelections} selected
        </p>
      )}
    </FieldWrapper>
  );
};

// Textarea Input
interface TextareaFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  description?: string;
  className?: string;
  rows?: number;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  name,
  placeholder,
  required = false,
  error,
  description,
  className,
  rows = 3,
}) => {
  const { register, formState: { errors } } = useFormContext();
  const fieldError = error || errors[name]?.message as string;

  return (
    <FieldWrapper
      label={label}
      name={name}
      required={required}
      error={fieldError}
      description={description}
      className={className}
    >
      <textarea
        {...register(name)}
        id={name}
        rows={rows}
        placeholder={placeholder}
        className={cn(
          "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
          fieldError && "border-red-300 focus:border-red-500 focus:ring-red-500"
        )}
      />
    </FieldWrapper>
  );
}; 