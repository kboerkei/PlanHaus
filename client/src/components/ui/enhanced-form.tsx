import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, required, error, hint, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      >
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          {label}
          {required && (
            <span className="text-rose-500 text-sm" aria-label="required">*</span>
          )}
        </Label>
        {children}
        {hint && !error && (
          <p className="text-xs text-gray-500 mt-1">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1" role="alert">
            <span className="inline-block w-3 h-3 rounded-full bg-red-100 flex items-center justify-center">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            </span>
            {error}
          </p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          "h-11 px-4 py-3 text-sm border-gray-200 focus:border-blush focus:ring-blush/20 transition-colors duration-200",
          "placeholder:text-gray-400",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
    )
  }
)
EnhancedInput.displayName = "EnhancedInput"

interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const EnhancedTextarea = React.forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        className={cn(
          "min-h-[80px] px-4 py-3 text-sm border-gray-200 focus:border-blush focus:ring-blush/20 transition-colors duration-200 resize-none",
          "placeholder:text-gray-400",
          error && "border-red-300 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
    )
  }
)
EnhancedTextarea.displayName = "EnhancedTextarea"

interface EnhancedSelectProps {
  children: React.ReactNode
  error?: boolean
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

const EnhancedSelect = React.forwardRef<HTMLButtonElement, EnhancedSelectProps>(
  ({ className, error, children, placeholder, ...props }, ref) => {
    return (
      <Select {...props}>
        <SelectTrigger
          ref={ref}
          className={cn(
            "h-11 px-4 py-3 text-sm border-gray-200 focus:border-blush focus:ring-blush/20 transition-colors duration-200",
            "data-[placeholder]:text-gray-400",
            error && "border-red-300 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {children}
        </SelectContent>
      </Select>
    )
  }
)
EnhancedSelect.displayName = "EnhancedSelect"

const FormRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
    {children}
  </div>
)

const FormSection: React.FC<{ 
  title?: string
  description?: string
  children: React.ReactNode
  className?: string 
}> = ({ 
  title, 
  description, 
  children, 
  className 
}) => (
  <div className={cn("space-y-4", className)}>
    {title && (
      <div className="border-b border-gray-100 pb-3 mb-6">
        <h3 className="text-lg font-serif font-semibold text-gray-800">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
    )}
    <div className="space-y-4">
      {children}
    </div>
  </div>
)

export {
  FormField,
  EnhancedInput,
  EnhancedTextarea,
  EnhancedSelect,
  FormRow,
  FormSection
}