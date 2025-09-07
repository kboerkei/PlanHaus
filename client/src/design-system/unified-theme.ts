// Unified Design System for PlanHaus
// This ensures all pages have consistent styling, colors, animations, and typography

import { motion } from "framer-motion";

// ============================================================================
// COLOR SYSTEM - Unified Wedding Theme
// ============================================================================

export const colors = {
  // Primary Brand Colors
  primary: {
    50: 'hsl(345, 100%, 97%)',
    100: 'hsl(345, 95%, 92%)',
    200: 'hsl(345, 90%, 85%)',
    300: 'hsl(345, 85%, 75%)',
    400: 'hsl(345, 80%, 65%)',
    500: 'hsl(345, 75%, 55%)', // Main brand color
    600: 'hsl(345, 70%, 45%)',
    700: 'hsl(345, 65%, 35%)',
    800: 'hsl(345, 60%, 25%)',
    900: 'hsl(345, 55%, 15%)',
  },
  
  // Secondary Accent Colors
  secondary: {
    50: 'hsl(45, 100%, 96%)',
    100: 'hsl(45, 95%, 90%)',
    200: 'hsl(45, 90%, 80%)',
    300: 'hsl(45, 85%, 70%)',
    400: 'hsl(45, 80%, 60%)',
    500: 'hsl(45, 75%, 50%)', // Champagne gold
    600: 'hsl(45, 70%, 40%)',
    700: 'hsl(45, 65%, 30%)',
    800: 'hsl(45, 60%, 20%)',
    900: 'hsl(45, 55%, 10%)',
  },

  // Neutral Colors
  neutral: {
    0: 'hsl(0, 0%, 100%)',
    25: 'hsl(0, 0%, 98%)',
    50: 'hsl(0, 0%, 95%)',
    100: 'hsl(0, 0%, 90%)',
    200: 'hsl(0, 0%, 82%)',
    300: 'hsl(0, 0%, 71%)',
    400: 'hsl(0, 0%, 58%)',
    500: 'hsl(0, 0%, 45%)',
    600: 'hsl(0, 0%, 35%)',
    700: 'hsl(0, 0%, 26%)',
    800: 'hsl(0, 0%, 18%)',
    900: 'hsl(0, 0%, 9%)',
  },

  // Semantic Colors
  success: {
    50: 'hsl(138, 76%, 97%)',
    500: 'hsl(138, 62%, 47%)',
    600: 'hsl(138, 70%, 40%)',
  },
  warning: {
    50: 'hsl(54, 91%, 95%)',
    500: 'hsl(45, 93%, 47%)',
    600: 'hsl(32, 95%, 44%)',
  },
  error: {
    50: 'hsl(0, 86%, 97%)',
    500: 'hsl(0, 84%, 60%)',
    600: 'hsl(0, 72%, 51%)',
  },
  info: {
    50: 'hsl(210, 100%, 97%)',
    500: 'hsl(210, 84%, 60%)',
    600: 'hsl(210, 72%, 51%)',
  },
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const typography = {
  fonts: {
    heading: "'Playfair Display', Georgia, serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================================================
// SPACING SYSTEM
// ============================================================================

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
} as const;

// ============================================================================
// BORDER RADIUS SYSTEM
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// ============================================================================
// SHADOW SYSTEM
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  wedding: '0 12px 40px rgba(236, 72, 153, 0.15)',
  glow: '0 0 20px rgba(236, 72, 153, 0.3)',
} as const;

// ============================================================================
// ANIMATION SYSTEM
// ============================================================================

export const animations = {
  // Duration
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8,
  },
  
  // Easing
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  
  // Keyframes
  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    fadeInUp: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    fadeInDown: {
      from: { opacity: 0, transform: 'translateY(-20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    slideInLeft: {
      from: { opacity: 0, transform: 'translateX(-20px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
    slideInRight: {
      from: { opacity: 0, transform: 'translateX(20px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
    scaleIn: {
      from: { opacity: 0, transform: 'scale(0.95)' },
      to: { opacity: 1, transform: 'scale(1)' },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
  },
} as const;

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

export const componentVariants = {
  // Button variants
  button: {
    primary: {
      backgroundColor: colors.primary[500],
      color: 'white',
      '&:hover': {
        backgroundColor: colors.primary[600],
        transform: 'translateY(-1px)',
        boxShadow: shadows.lg,
      },
    },
    secondary: {
      backgroundColor: colors.secondary[500],
      color: 'white',
      '&:hover': {
        backgroundColor: colors.secondary[600],
        transform: 'translateY(-1px)',
        boxShadow: shadows.lg,
      },
    },
    outline: {
      border: `1px solid ${colors.primary[500]}`,
      color: colors.primary[500],
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: colors.primary[50],
        borderColor: colors.primary[600],
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.neutral[700],
      '&:hover': {
        backgroundColor: colors.neutral[100],
      },
    },
  },
  
  // Card variants
  card: {
    default: {
      backgroundColor: 'white',
      borderRadius: borderRadius.lg,
      boxShadow: shadows.md,
      border: `1px solid ${colors.neutral[200]}`,
    },
    elevated: {
      backgroundColor: 'white',
      borderRadius: borderRadius.lg,
      boxShadow: shadows.lg,
      border: `1px solid ${colors.neutral[200]}`,
      '&:hover': {
        boxShadow: shadows.xl,
        transform: 'translateY(-2px)',
      },
    },
    wedding: {
      backgroundColor: 'white',
      borderRadius: borderRadius.xl,
      boxShadow: shadows.wedding,
      border: `1px solid ${colors.primary[100]}`,
      '&:hover': {
        boxShadow: shadows.glow,
        transform: 'translateY(-2px)',
      },
    },
  },
  
  // Input variants
  input: {
    default: {
      border: `1px solid ${colors.neutral[300]}`,
      borderRadius: borderRadius.md,
      backgroundColor: 'white',
      '&:focus': {
        borderColor: colors.primary[500],
        boxShadow: `0 0 0 3px ${colors.primary[100]}`,
      },
    },
    wedding: {
      border: `1px solid ${colors.primary[200]}`,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.primary[50],
      '&:focus': {
        borderColor: colors.primary[500],
        backgroundColor: 'white',
        boxShadow: `0 0 0 3px ${colors.primary[100]}`,
      },
    },
  },
} as const;

// ============================================================================
// MOTION VARIANTS
// ============================================================================

export const motionVariants = {
  // Page transitions
  page: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  
  // Staggered children
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  
  // Fade in
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  
  // Slide up
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  
  // Scale in
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  // Hover effects
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const utils = {
  // Get color with opacity
  colorWithOpacity: (color: string, opacity: number) => {
    return color.replace(')', `, ${opacity})`).replace('hsl', 'hsla');
  },
  
  // Get responsive value
  responsive: (mobile: string, tablet: string, desktop: string) => ({
    '@media (min-width: 768px)': { value: tablet },
    '@media (min-width: 1024px)': { value: desktop },
    value: mobile,
  }),
  
  // Create gradient
  gradient: (direction: string, ...colors: string[]) => {
    return `linear-gradient(${direction}, ${colors.join(', ')})`;
  },
} as const;

// ============================================================================
// EXPORT ALL
// ============================================================================

export const unifiedTheme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  componentVariants,
  motionVariants,
  utils,
} as const;

export default unifiedTheme; 