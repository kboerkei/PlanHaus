import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, Search, Calendar, DollarSign, User, Mail, Phone, MapPin } from "lucide-react"

const inputVariants = cva(
  "flex w-full rounded-xl border bg-background px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:border-ring",
        wedding: "border-blush/30 focus-visible:border-blush shadow-wedding focus-visible:shadow-wedding-lg",
        elegant: "border-champagne/40 focus-visible:border-champagne shadow-elegant",
        error: "border-destructive focus-visible:border-destructive",
        success: "border-green-500 focus-visible:border-green-500",
      },
      size: {
        default: "h-12",
        sm: "h-10 px-3 py-2",
        lg: "h-14 px-6 py-4 text-base",
        mobile: "h-14 px-4 py-3 text-base", // Enhanced mobile size
      },
      icon: {
        none: "",
        left: "pl-12",
        right: "pr-12",
        both: "px-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      icon: "none",
    },
  }
)

export interface EnhancedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof VariantProps<typeof inputVariants>>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
  showPasswordToggle?: boolean
  inputMode?: "text" | "email" | "tel" | "url" | "numeric" | "decimal" | "search"
  autoComplete?: string
  pattern?: string
  min?: string | number
  max?: string | number
  step?: string | number
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    variant, 
    size, 
    icon,
    label,
    error,
    success,
    helperText,
    leftIcon,
    rightIcon,
    loading = false,
    showPasswordToggle = false,
    type = "text",
    disabled,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const inputId = id || React.useId()
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    // Enhanced input type handling
    const inputType = showPasswordToggle && type === "password" 
      ? (showPassword ? "text" : "password") 
      : type

    // Enhanced accessibility attributes
    const accessibilityProps = {
      id: inputId,
      "aria-invalid": error ? "true" : "false",
      "aria-describedby": error ? errorId : helperText ? helperId : undefined,
      "aria-required": props.required,
      "aria-disabled": disabled,
    } as const

    // Enhanced focus handlers
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(event)
    }

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(event)
    }

    // Enhanced mobile input mode
    const getInputMode = () => {
      if (props.inputMode) return props.inputMode
      
      switch (type) {
        case "email":
          return "email"
        case "tel":
          return "tel"
        case "number":
          return "numeric"
        case "search":
          return "search"
        default:
          return "text"
      }
    }

    return (
      <div className="space-y-2">
        {label && (
          <motion.label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium text-foreground",
              error && "text-destructive",
              success && "text-green-600"
            )}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </motion.label>
        )}

        <div className="relative">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Left Icon */}
            {leftIcon && (
              <motion.div
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {leftIcon}
              </motion.div>
            )}

            {/* Input Field */}
            <input
              ref={ref}
              type={inputType}
              className={cn(
                inputVariants({ variant, size, icon }),
                className
              )}
              disabled={disabled || loading}
              inputMode={getInputMode()}
              {...accessibilityProps}
              {...props}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />

            {/* Right Icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-muted-foreground"
                  >
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  </motion.div>
                )}

                {showPasswordToggle && type === "password" && !loading && (
                  <motion.button
                    key="password-toggle"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </motion.button>
                )}

                {rightIcon && !loading && !showPasswordToggle && (
                  <motion.div
                    key="right-icon"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground"
                  >
                    {rightIcon}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Focus Ring Animation */}
            {isFocused && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: `linear-gradient(45deg, hsl(var(--blush)/0.1), hsl(var(--rose-gold)/0.1))`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.div>
        </div>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              id={errorId}
              className="flex items-center space-x-2 text-sm text-destructive"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-1 h-1 bg-destructive rounded-full" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && !error && (
            <motion.div
              key="success"
              className="flex items-center space-x-2 text-sm text-green-600"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-1 h-1 bg-green-600 rounded-full" />
              <span>{success}</span>
            </motion.div>
          )}

          {helperText && !error && !success && (
            <motion.div
              key="helper"
              id={helperId}
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {helperText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

EnhancedInput.displayName = "EnhancedInput"

// Pre-configured input types for common use cases
export const EmailInput = React.forwardRef<HTMLInputElement, Omit<EnhancedInputProps, 'type' | 'leftIcon'>>(
  (props, ref) => (
    <EnhancedInput
      ref={ref}
      type="email"
      leftIcon={<Mail size={16} />}
      inputMode="email"
      autoComplete="email"
      {...props}
    />
  )
)

export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<EnhancedInputProps, 'type' | 'showPasswordToggle'>>(
  (props, ref) => (
    <EnhancedInput
      ref={ref}
      type="password"
      showPasswordToggle
      autoComplete="current-password"
      {...props}
    />
  )
)

export const SearchInput = React.forwardRef<HTMLInputElement, Omit<EnhancedInputProps, 'type' | 'leftIcon'>>(
  (props, ref) => (
    <EnhancedInput
      ref={ref}
      type="search"
      leftIcon={<Search size={16} />}
      inputMode="search"
      {...props}
    />
  )
)

export const PhoneInput = React.forwardRef<HTMLInputElement, Omit<EnhancedInputProps, 'type' | 'leftIcon'>>(
  (props, ref) => (
    <EnhancedInput
      ref={ref}
      type="tel"
      leftIcon={<Phone size={16} />}
      inputMode="tel"
      autoComplete="tel"
      {...props}
    />
  )
)

export const DateInput = React.forwardRef<HTMLInputElement, Omit<EnhancedInputProps, 'type' | 'leftIcon'>>(
  (props, ref) => (
    <EnhancedInput
      ref={ref}
      type="date"
      leftIcon={<Calendar size={16} />}
      {...props}
    />
  )
)

export const NumberInput = React.forwardRef<HTMLInputElement, Omit<EnhancedInputProps, 'type' | 'leftIcon'>>(
  (props, ref) => (
    <EnhancedInput
      ref={ref}
      type="number"
      leftIcon={<DollarSign size={16} />}
      inputMode="numeric"
      {...props}
    />
  )
)

export const NameInput = React.forwardRef<HTMLInputElement, Omit<EnhancedInputProps, 'type' | 'leftIcon'>>(
  (props, ref) => (
    <EnhancedInput
      ref={ref}
      type="text"
      leftIcon={<User size={16} />}
      autoComplete="name"
      {...props}
    />
  )
)

export const AddressInput = React.forwardRef<HTMLInputElement, Omit<EnhancedInputProps, 'type' | 'leftIcon'>>(
  (props, ref) => (
    <EnhancedInput
      ref={ref}
      type="text"
      leftIcon={<MapPin size={16} />}
      autoComplete="street-address"
      {...props}
    />
  )
)

export { EnhancedInput, inputVariants } 