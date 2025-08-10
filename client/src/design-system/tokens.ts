// Design System Tokens for PlanHaus Wedding Planning App
// Wedding-themed design system with elegant, romantic touches

export const tokens = {
  // Color System - Wedding-themed palette
  colors: {
    // Primary wedding colors
    primary: {
      50: "hsl(350, 100%, 98%)",
      100: "hsl(350, 100%, 95%)",
      200: "hsl(350, 100%, 90%)",
      300: "hsl(350, 100%, 82%)",
      400: "hsl(350, 100%, 71%)",
      500: "hsl(350, 84%, 60%)", // Main rose
      600: "hsl(350, 84%, 54%)",
      700: "hsl(350, 84%, 47%)",
      800: "hsl(350, 84%, 40%)",
      900: "hsl(350, 84%, 33%)",
      950: "hsl(350, 84%, 20%)"
    },

    // Secondary champagne/gold colors
    secondary: {
      50: "hsl(45, 56%, 97%)",
      100: "hsl(45, 56%, 94%)",
      200: "hsl(45, 56%, 87%)",
      300: "hsl(45, 56%, 77%)",
      400: "hsl(45, 56%, 65%)",
      500: "hsl(45, 56%, 53%)", // Champagne
      600: "hsl(45, 56%, 45%)",
      700: "hsl(45, 56%, 37%)",
      800: "hsl(45, 56%, 30%)",
      900: "hsl(45, 56%, 24%)",
      950: "hsl(45, 56%, 15%)"
    },

    // Neutral grays
    neutral: {
      0: "hsl(0, 0%, 100%)", // Pure white
      50: "hsl(20, 20%, 98%)",
      100: "hsl(20, 14%, 96%)",
      200: "hsl(20, 13%, 92%)",
      300: "hsl(20, 12%, 84%)",
      400: "hsl(20, 10%, 64%)",
      500: "hsl(20, 8%, 46%)",
      600: "hsl(20, 9%, 38%)",
      700: "hsl(20, 10%, 31%)",
      800: "hsl(20, 12%, 25%)",
      900: "hsl(20, 14%, 20%)",
      950: "hsl(20, 14%, 4%)"
    },

    // Semantic colors
    semantic: {
      success: {
        50: "hsl(142, 76%, 96%)",
        500: "hsl(142, 71%, 45%)",
        600: "hsl(142, 71%, 39%)",
        700: "hsl(142, 72%, 33%)"
      },
      warning: {
        50: "hsl(48, 96%, 95%)",
        500: "hsl(48, 96%, 53%)",
        600: "hsl(48, 96%, 47%)",
        700: "hsl(48, 96%, 41%)"
      },
      error: {
        50: "hsl(0, 86%, 97%)",
        500: "hsl(0, 84%, 60%)",
        600: "hsl(0, 84%, 54%)",
        700: "hsl(0, 84%, 47%)"
      },
      info: {
        50: "hsl(214, 100%, 97%)",
        500: "hsl(214, 100%, 50%)",
        600: "hsl(214, 100%, 44%)",
        700: "hsl(214, 100%, 38%)"
      }
    },

    // Background variants
    background: {
      primary: "hsl(0, 0%, 100%)",
      secondary: "hsl(20, 20%, 98%)",
      tertiary: "hsl(20, 14%, 96%)",
      muted: "hsl(20, 13%, 92%)",
      accent: "hsl(350, 100%, 98%)",
      card: "hsl(0, 0%, 100%)",
      popover: "hsl(0, 0%, 100%)",
      modal: "hsl(0, 0%, 100%)"
    },

    // Text colors
    text: {
      primary: "hsl(20, 14%, 4%)",
      secondary: "hsl(20, 10%, 31%)",
      tertiary: "hsl(20, 8%, 46%)",
      muted: "hsl(20, 10%, 64%)",
      placeholder: "hsl(20, 12%, 84%)",
      inverse: "hsl(0, 0%, 100%)",
      link: "hsl(350, 84%, 60%)",
      linkHover: "hsl(350, 84%, 54%)"
    },

    // Border colors
    border: {
      primary: "hsl(20, 13%, 92%)",
      secondary: "hsl(20, 12%, 84%)",
      muted: "hsl(20, 14%, 96%)",
      focus: "hsl(350, 84%, 60%)",
      error: "hsl(0, 84%, 60%)",
      success: "hsl(142, 71%, 45%)"
    }
  },

  // Typography System
  typography: {
    fontFamily: {
      display: ["Playfair Display", "serif"], // For headings
      heading: ["DM Serif Display", "serif"], // For subheadings
      body: ["Inter", "system-ui", "sans-serif"], // For body text
      ui: ["DM Sans", "system-ui", "sans-serif"] // For UI elements
    },
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.25rem" }],
      base: ["1rem", { lineHeight: "1.5rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "1.75rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      "5xl": ["3rem", { lineHeight: "1" }],
      "6xl": ["3.75rem", { lineHeight: "1" }]
    },
    fontWeight: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800"
    },
    lineHeight: {
      tight: "1.25",
      snug: "1.375",
      normal: "1.5",
      relaxed: "1.625",
      loose: "2"
    }
  },

  // Spacing System - 8px base grid
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem",  // 8px
    3: "0.75rem", // 12px
    4: "1rem",    // 16px
    5: "1.25rem", // 20px
    6: "1.5rem",  // 24px
    8: "2rem",    // 32px
    10: "2.5rem", // 40px
    12: "3rem",   // 48px
    16: "4rem",   // 64px
    20: "5rem",   // 80px
    24: "6rem",   // 96px
    32: "8rem",   // 128px
    40: "10rem",  // 160px
    48: "12rem",  // 192px
    56: "14rem",  // 224px
    64: "16rem"   // 256px
  },

  // Border Radius System
  radius: {
    none: "0",
    sm: "0.125rem",   // 2px
    default: "0.25rem", // 4px
    md: "0.375rem",   // 6px
    lg: "0.5rem",     // 8px
    xl: "0.75rem",    // 12px
    "2xl": "1rem",    // 16px
    "3xl": "1.5rem",  // 24px
    full: "9999px"
  },

  // Shadow System
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    default: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    
    // Wedding-themed elegant shadows
    elegant: "0 4px 20px -4px rgba(350, 84%, 60%, 0.15), 0 2px 8px -2px rgba(350, 84%, 60%, 0.08)",
    soft: "0 2px 12px -2px rgba(20, 14%, 4%, 0.08), 0 1px 4px -1px rgba(20, 14%, 4%, 0.04)",
    glow: "0 0 0 1px rgba(350, 84%, 60%, 0.05), 0 4px 16px -4px rgba(350, 84%, 60%, 0.2)",
    focus: "0 0 0 3px rgba(350, 84%, 60%, 0.12)"
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        sm: "2rem",     // 32px
        default: "2.5rem", // 40px
        lg: "3rem",     // 48px
        xl: "3.5rem"    // 56px
      },
      padding: {
        sm: "0.5rem 0.75rem",
        default: "0.625rem 1rem",
        lg: "0.75rem 1.5rem",
        xl: "1rem 2rem"
      },
      fontSize: {
        sm: "0.875rem",
        default: "1rem",
        lg: "1.125rem",
        xl: "1.25rem"
      }
    },
    input: {
      height: {
        sm: "2rem",
        default: "2.5rem",
        lg: "3rem"
      },
      padding: "0.625rem 0.75rem",
      fontSize: "1rem"
    },
    card: {
      padding: {
        sm: "1rem",
        default: "1.5rem",
        lg: "2rem",
        xl: "2.5rem"
      }
    }
  },

  // Animation/Transition tokens
  animation: {
    duration: {
      fast: "150ms",
      normal: "250ms",
      slow: "350ms",
      slower: "500ms"
    },
    easing: {
      ease: "ease",
      easeIn: "ease-in",
      easeOut: "ease-out",
      easeInOut: "ease-in-out",
      spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
    }
  },

  // Z-index layers
  zIndex: {
    hide: -1,
    auto: "auto",
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  }
} as const;

// Type definitions for better TypeScript support
export type ColorToken = keyof typeof tokens.colors;
export type SpacingToken = keyof typeof tokens.spacing;
export type RadiusToken = keyof typeof tokens.radius;
export type ShadowToken = keyof typeof tokens.shadows;

// Helper functions for accessing tokens
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = tokens.colors;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

export const getSpacing = (token: SpacingToken) => tokens.spacing[token];
export const getRadius = (token: RadiusToken) => tokens.radius[token];
export const getShadow = (token: ShadowToken) => tokens.shadows[token];

// Component variants using design tokens
export const componentVariants = {
  button: {
    // Primary wedding button
    wedding: {
      base: "inline-flex items-center justify-center font-medium transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variants: {
        size: {
          sm: `h-8 px-3 text-sm rounded-md`,
          default: `h-10 px-4 py-2 rounded-lg`,
          lg: `h-12 px-6 text-lg rounded-xl`,
          xl: `h-14 px-8 text-xl rounded-2xl`
        },
        variant: {
          primary: `bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 active:from-rose-700 active:to-pink-700 shadow-md hover:shadow-lg`,
          secondary: `bg-champagne text-rose-900 hover:bg-champagne/80 border border-rose-200 hover:border-rose-300`,
          outline: `border-2 border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400 active:bg-rose-100`,
          ghost: `text-rose-700 hover:bg-rose-50 hover:text-rose-800 active:bg-rose-100`,
          elegant: `bg-white border border-rose-200 text-rose-800 hover:bg-rose-50 shadow-elegant hover:shadow-lg`,
        }
      }
    },
    
    // Standard button patterns
    standard: {
      base: "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variants: {
        size: {
          sm: `h-8 px-3 text-sm rounded`,
          default: `h-10 px-4 py-2 rounded-md`,
          lg: `h-11 px-8 rounded-md`,
          icon: `h-10 w-10 rounded-md`
        },
        variant: {
          default: `bg-primary text-primary-foreground hover:bg-primary/90`,
          destructive: `bg-destructive text-destructive-foreground hover:bg-destructive/90`,
          outline: `border border-input bg-background hover:bg-accent hover:text-accent-foreground`,
          secondary: `bg-secondary text-secondary-foreground hover:bg-secondary/80`,
          ghost: `hover:bg-accent hover:text-accent-foreground`,
          link: `text-primary underline-offset-4 hover:underline`
        }
      }
    }
  },

  card: {
    base: "rounded-xl border bg-card text-card-foreground",
    variants: {
      variant: {
        default: `shadow-sm`,
        elegant: `shadow-elegant border-rose-100 bg-gradient-to-br from-white to-rose-50/30`,
        soft: `shadow-soft border-neutral-200`,
        outline: `border-2 border-rose-200`,
        ghost: `border-transparent bg-rose-50/50`
      },
      size: {
        sm: `p-4`,
        default: `p-6`,
        lg: `p-8`,
        xl: `p-10`
      }
    }
  },

  input: {
    base: "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    variants: {
      variant: {
        default: `border-input focus-visible:ring-ring`,
        wedding: `border-rose-200 focus-visible:ring-rose-500 focus-visible:border-rose-500 hover:border-rose-300`,
        error: `border-error focus-visible:ring-error`,
        success: `border-success focus-visible:ring-success`
      },
      size: {
        sm: `h-8 px-2 text-sm`,
        default: `h-10 px-3`,
        lg: `h-12 px-4 text-lg`
      }
    }
  }
};

export default tokens;