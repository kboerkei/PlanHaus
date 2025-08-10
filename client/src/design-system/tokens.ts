// Design System Tokens for PlanHaus Wedding Planning App

// Color System - Wedding-themed palette
export const colors = {
  // Primary - Rose palette for wedding theme
  rose: {
    25: 'hsl(330, 100%, 98%)',
    50: 'hsl(330, 80%, 95%)',
    100: 'hsl(331, 73%, 91%)',
    200: 'hsl(333, 71%, 83%)',
    300: 'hsl(335, 69%, 73%)',
    400: 'hsl(336, 65%, 61%)',
    500: 'hsl(338, 60%, 50%)',
    600: 'hsl(340, 75%, 42%)',
    700: 'hsl(342, 80%, 35%)',
    800: 'hsl(344, 84%, 29%)',
    900: 'hsl(346, 87%, 24%)',
    950: 'hsl(349, 89%, 14%)',
  },
  
  // Secondary - Champagne/Gold accents
  champagne: {
    50: 'hsl(48, 100%, 96%)',
    100: 'hsl(48, 96%, 89%)',
    200: 'hsl(48, 97%, 77%)',
    300: 'hsl(45, 94%, 62%)',
    400: 'hsl(43, 89%, 50%)',
    500: 'hsl(37, 91%, 44%)',
    600: 'hsl(32, 91%, 37%)',
    700: 'hsl(26, 90%, 31%)',
    800: 'hsl(23, 84%, 27%)',
    900: 'hsl(22, 78%, 24%)',
    950: 'hsl(21, 91%, 14%)',
  },

  // Neutrals
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
    950: 'hsl(0, 0%, 4%)',
  },

  // Status colors
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
} as const;

// Typography
export const typography = {
  fontFamilies: {
    display: 'Playfair Display, serif',
    heading: 'DM Serif Display, serif',
    body: 'Inter, sans-serif',
    ui: 'DM Sans, sans-serif',
  },
  
  fontSizes: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },

  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// Spacing System (4px base unit)
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

// Shadows - Wedding-themed elegant shadows
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Wedding-specific shadows
  elegant: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
  glow: '0 0 20px rgba(251, 113, 133, 0.15)', // Rose glow
  champagne: '0 4px 20px rgba(217, 119, 6, 0.15)', // Champagne glow
} as const;

// Animation & Transitions
export const animation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Component Variants
export const componentVariants = {
  button: {
    wedding: {
      base: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-elegant',
      hover: 'from-rose-600 to-pink-600 shadow-lg',
      active: 'from-rose-700 to-pink-700',
      disabled: 'from-neutral-300 to-neutral-400 cursor-not-allowed',
    },
    champagne: {
      base: 'bg-gradient-to-r from-champagne-400 to-champagne-500 text-white shadow-champagne',
      hover: 'from-champagne-500 to-champagne-600 shadow-lg',
      active: 'from-champagne-600 to-champagne-700',
      disabled: 'from-neutral-300 to-neutral-400 cursor-not-allowed',
    },
    elegant: {
      base: 'bg-white border-2 border-rose-200 text-rose-700 shadow-elegant',
      hover: 'border-rose-300 shadow-lg bg-rose-25',
      active: 'border-rose-400 bg-rose-50',
      disabled: 'border-neutral-200 text-neutral-400 cursor-not-allowed',
    },
  },
  
  card: {
    default: {
      base: 'bg-white border border-neutral-200 shadow-base',
      hover: 'shadow-md border-neutral-300',
    },
    elegant: {
      base: 'bg-gradient-to-br from-white to-rose-25 border border-rose-100 shadow-elegant',
      hover: 'shadow-lg border-rose-200',
    },
    champagne: {
      base: 'bg-gradient-to-br from-white to-champagne-25 border border-champagne-100 shadow-champagne',
      hover: 'shadow-lg border-champagne-200',
    },
  },
  
  input: {
    default: {
      base: 'border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500',
      focus: 'border-rose-500 ring-2 ring-rose-500/20',
      error: 'border-error-500 ring-2 ring-error-500/20',
      disabled: 'bg-neutral-50 text-neutral-400 cursor-not-allowed',
    },
  },
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;