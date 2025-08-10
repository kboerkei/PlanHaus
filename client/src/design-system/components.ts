// Component Design System - Unified patterns for buttons, inputs, cards
// Uses design tokens for consistent styling across the app

import { tokens, componentVariants } from './tokens';
import { cn } from '@/lib/utils';

// Button Component Variants
export const buttonVariants = {
  // Wedding-themed button styles
  wedding: {
    base: "inline-flex items-center justify-center font-medium transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
    
    // Size variants
    size: {
      sm: "h-8 px-3 text-sm rounded-md min-w-[64px]",
      default: "h-10 px-4 py-2 text-base rounded-lg min-w-[80px]",
      lg: "h-12 px-6 text-lg rounded-xl min-w-[96px]",
      xl: "h-14 px-8 text-xl rounded-2xl min-w-[112px]",
      icon: "h-10 w-10 rounded-lg p-0"
    },

    // Style variants
    variant: {
      primary: [
        "bg-gradient-to-r from-rose-500 to-rose-600 text-white",
        "hover:from-rose-600 hover:to-rose-700 hover:shadow-lg",
        "active:from-rose-700 active:to-rose-800 active:scale-[0.98]",
        "focus-visible:ring-rose-500 focus-visible:ring-offset-2",
        "disabled:from-neutral-300 disabled:to-neutral-300 disabled:text-neutral-500",
        "shadow-md transition-all duration-200"
      ].join(" "),

      secondary: [
        "bg-champagne text-rose-800 border border-rose-200",
        "hover:bg-champagne/80 hover:border-rose-300 hover:shadow-md",
        "active:bg-champagne/60 active:scale-[0.98]",
        "focus-visible:ring-rose-500 focus-visible:ring-offset-2",
        "disabled:bg-neutral-100 disabled:text-neutral-400 disabled:border-neutral-200"
      ].join(" "),

      outline: [
        "border-2 border-rose-300 text-rose-700 bg-transparent",
        "hover:bg-rose-50 hover:border-rose-400 hover:text-rose-800",
        "active:bg-rose-100 active:border-rose-500 active:scale-[0.98]",
        "focus-visible:ring-rose-500 focus-visible:ring-offset-2",
        "disabled:border-neutral-300 disabled:text-neutral-400"
      ].join(" "),

      ghost: [
        "text-rose-700 bg-transparent border-transparent",
        "hover:bg-rose-50 hover:text-rose-800",
        "active:bg-rose-100 active:scale-[0.98]",
        "focus-visible:ring-rose-500 focus-visible:ring-offset-2",
        "disabled:text-neutral-400"
      ].join(" "),

      elegant: [
        "bg-white border border-rose-200 text-rose-800 shadow-elegant",
        "hover:bg-rose-50 hover:border-rose-300 hover:shadow-lg",
        "active:bg-rose-100 active:scale-[0.98]",
        "focus-visible:ring-rose-500 focus-visible:ring-offset-2",
        "disabled:bg-neutral-50 disabled:border-neutral-200 disabled:text-neutral-400"
      ].join(" "),

      destructive: [
        "bg-red-500 text-white",
        "hover:bg-red-600 hover:shadow-md",
        "active:bg-red-700 active:scale-[0.98]",
        "focus-visible:ring-red-500 focus-visible:ring-offset-2",
        "disabled:bg-neutral-300 disabled:text-neutral-500"
      ].join(" ")
    },

    // Loading state
    loading: "opacity-75 cursor-not-allowed pointer-events-none"
  }
};

// Input Component Variants
export const inputVariants = {
  base: [
    "flex w-full rounded-lg border bg-white px-3 py-2 text-base",
    "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "placeholder:text-neutral-400 transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50"
  ].join(" "),

  size: {
    sm: "h-8 px-2 text-sm rounded-md",
    default: "h-10 px-3 text-base rounded-lg",
    lg: "h-12 px-4 text-lg rounded-xl"
  },

  variant: {
    default: [
      "border-neutral-300",
      "focus-visible:ring-primary-500 focus-visible:border-primary-500",
      "hover:border-neutral-400"
    ].join(" "),

    wedding: [
      "border-rose-200",
      "focus-visible:ring-rose-500 focus-visible:border-rose-500",
      "hover:border-rose-300"
    ].join(" "),

    error: [
      "border-red-500 text-red-700",
      "focus-visible:ring-red-500 focus-visible:border-red-500",
      "placeholder:text-red-400"
    ].join(" "),

    success: [
      "border-green-500 text-green-700",
      "focus-visible:ring-green-500 focus-visible:border-green-500"
    ].join(" ")
  }
};

// Card Component Variants
export const cardVariants = {
  base: [
    "rounded-xl bg-white text-neutral-900 transition-all duration-200"
  ].join(" "),

  variant: {
    default: "border border-neutral-200 shadow-sm hover:shadow-md",
    
    elegant: [
      "border border-rose-100 shadow-elegant",
      "bg-gradient-to-br from-white to-rose-50/30",
      "hover:shadow-lg hover:border-rose-200"
    ].join(" "),

    soft: [
      "border border-neutral-200 shadow-soft",
      "hover:shadow-md hover:border-neutral-300"
    ].join(" "),

    outline: [
      "border-2 border-rose-200",
      "hover:border-rose-300 hover:shadow-sm"
    ].join(" "),

    ghost: [
      "border-transparent bg-rose-50/50",
      "hover:bg-rose-50 hover:shadow-sm"
    ].join(" "),

    interactive: [
      "border border-neutral-200 shadow-sm cursor-pointer",
      "hover:shadow-md hover:border-rose-200 hover:-translate-y-0.5",
      "active:translate-y-0 active:shadow-sm"
    ].join(" ")
  },

  size: {
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
    xl: "p-10"
  }
};

// Badge/Chip Component Variants
export const badgeVariants = {
  base: [
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
    "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  ].join(" "),

  variant: {
    default: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
    
    primary: "bg-primary-100 text-primary-800 hover:bg-primary-200",
    
    secondary: "bg-secondary-100 text-secondary-800 hover:bg-secondary-200",
    
    success: "bg-semantic-success-100 text-semantic-success-800",
    
    warning: "bg-semantic-warning-100 text-semantic-warning-800",
    
    error: "bg-semantic-error-100 text-semantic-error-800",
    
    outline: "border border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50"
  }
};

// Loading Spinner Component
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
    white: "text-white"
  }
};

// Form Field Wrapper Variants
export const formFieldVariants = {
  base: "space-y-2",
  
  label: [
    "text-sm font-medium text-neutral-700",
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  ].join(" "),
  
  description: "text-sm text-neutral-600",
  
  error: "text-sm text-semantic-error-600 font-medium"
};

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
  
  return cn(baseClasses, variantClasses, sizeClasses, additionalClasses);
};

// State Management for Interactive Components
export const interactionStates = {
  // Focus states
  focus: {
    ring: "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500",
    outline: "focus-visible:outline-none"
  },

  // Hover states
  hover: {
    lift: "hover:-translate-y-0.5 hover:shadow-lg",
    glow: "hover:shadow-glow",
    scale: "hover:scale-105",
    subtle: "hover:bg-opacity-80"
  },

  // Active/pressed states
  active: {
    press: "active:scale-[0.98]",
    depress: "active:translate-y-0.5",
    darken: "active:brightness-95"
  },

  // Disabled states
  disabled: {
    opacity: "disabled:opacity-50",
    cursor: "disabled:cursor-not-allowed",
    events: "disabled:pointer-events-none",
    full: "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
  }
};

export default {
  buttonVariants,
  inputVariants,
  cardVariants,
  badgeVariants,
  spinnerVariants,
  formFieldVariants,
  getVariantClasses,
  interactionStates
};