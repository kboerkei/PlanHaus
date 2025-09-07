// Design System Components Configuration
import { colors, typography, spacing, borderRadius, shadows, animation, componentVariants, breakpoints } from './tokens';

// Export all design tokens
export {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  componentVariants,
  breakpoints,
};

// Component-specific configurations
export const buttonVariants = componentVariants.button;
export const cardVariants = componentVariants.card;
export const inputVariants = componentVariants.input;

// Missing exports that were causing errors
export const badgeVariants = {
  base: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  default: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
  primary: "bg-primary-100 text-primary-800 hover:bg-primary-200",
  secondary: "bg-secondary-100 text-secondary-800 hover:bg-secondary-200",
  success: "bg-semantic-success-100 text-semantic-success-800",
  warning: "bg-semantic-warning-100 text-semantic-warning-800",
  error: "bg-semantic-error-100 text-semantic-error-800",
  outline: "border border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50",
  wedding: "bg-rose-100 text-rose-800 hover:bg-rose-200",
  champagne: "bg-champagne-100 text-champagne-800 hover:bg-champagne-200",
};

export const spinnerVariants = {
  base: "animate-spin rounded-full border-solid border-current border-r-transparent",
  size: {
    xs: "h-3 w-3 border",
    sm: "h-4 w-4 border",
    default: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-2",
    xl: "h-12 w-12 border-2"
  },
  variant: {
    primary: "text-primary-600",
    secondary: "text-secondary-600",
    neutral: "text-neutral-600",
    white: "text-white",
    rose: "text-rose-600",
    champagne: "text-champagne-600"
  }
};

export const formFieldVariants = {
  base: "space-y-2",
  label: "text-sm font-medium text-neutral-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  description: "text-sm text-neutral-600",
  error: "text-sm text-semantic-error-600 font-medium"
};

// Utility functions for design system
export const getColor = (colorPath: string) => {
  const path = colorPath.split('.');
  let current: any = colors;
  
  for (const key of path) {
    if (current[key] === undefined) {
      console.warn(`Color not found: ${colorPath}`);
      return colors.neutral[500];
    }
    current = current[key];
  }
  
  return current;
};

export const getSpacing = (size: keyof typeof spacing) => spacing[size];
export const getBorderRadius = (size: keyof typeof borderRadius) => borderRadius[size];
export const getShadow = (size: keyof typeof shadows) => shadows[size];

// Helper function to combine variant classes
export const getVariantClasses = (
  variants: Record<string, any>,
  selectedVariant: string,
  size?: string,
  additionalClasses?: string
) => {
  const baseClasses = variants.base || '';
  const variantClasses = variants.variant?.[selectedVariant] || '';
  const sizeClasses = size && variants.size?.[size] || '';
  
  return [baseClasses, variantClasses, sizeClasses, additionalClasses].filter(Boolean).join(' ');
};