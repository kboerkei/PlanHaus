import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./client/src/**/*.{js,ts,jsx,tsx,mdx}",
    "./client/index.html",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Dynamic colors for charts and status indicators
    'bg-rose-500', 'bg-rose-600', 'bg-rose-700',
    'bg-purple-500', 'bg-purple-600', 'bg-purple-700',
    'bg-blue-500', 'bg-blue-600', 'bg-blue-700',
    'bg-green-500', 'bg-green-600', 'bg-green-700',
    'bg-orange-500', 'bg-orange-600', 'bg-orange-700',
    'bg-red-500', 'bg-red-600', 'bg-red-700',
    'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700',
    'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-700',
    'bg-pink-500', 'bg-pink-600', 'bg-pink-700',
    'bg-teal-500', 'bg-teal-600', 'bg-teal-700',
    // Border colors for dynamic elements
    'border-rose-500', 'border-purple-500', 'border-blue-500',
    'border-green-500', 'border-orange-500', 'border-red-500',
    // Text colors for status and priority
    'text-rose-600', 'text-purple-600', 'text-blue-600',
    'text-green-600', 'text-orange-600', 'text-red-600',
    // Wedding theme variations
    'bg-blush', 'bg-rose-gold', 'bg-champagne', 'bg-sage',
    'text-blush', 'text-rose-gold', 'text-champagne', 'text-sage',
    'border-blush', 'border-rose-gold', 'border-champagne', 'border-sage',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      // Typography
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      
      colors: {
        // Shadcn/UI base system
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          300: "hsl(var(--primary-300))",
          400: "hsl(var(--primary-400))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          800: "hsl(var(--primary-800))",
          900: "hsl(var(--primary-900))",
          950: "hsl(var(--primary-950))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "hsl(var(--accent-50))",
          100: "hsl(var(--accent-100))",
          200: "hsl(var(--accent-200))",
          300: "hsl(var(--accent-300))",
          400: "hsl(var(--accent-400))",
          500: "hsl(var(--accent-500))",
          600: "hsl(var(--accent-600))",
          700: "hsl(var(--accent-700))",
          800: "hsl(var(--accent-800))",
          900: "hsl(var(--accent-900))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)", 
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      
      boxShadow: {
        'elegant': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'glow': '0 0 0 1px rgb(255 255 255 / 0.05), 0 1px 1px rgb(0 0 0 / 0.075)',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' }
        }
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"), 
    require("@tailwindcss/typography"),
    // Custom plugin for reusable button and component classes
    function({ addComponents, theme }: any) {
      addComponents({
        // Primary button styles
        '.btn-primary': {
          backgroundColor: theme('colors.rose.600'),
          color: theme('colors.white'),
          padding: theme('spacing.3') + ' ' + theme('spacing.6'),
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          fontSize: theme('fontSize.sm'),
          lineHeight: theme('lineHeight.none'),
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: theme('colors.rose.700'),
            transform: 'translateY(-1px)',
            boxShadow: theme('boxShadow.md'),
          },
          '&:focus': {
            outline: 'none',
            ring: '2px solid ' + theme('colors.rose.500'),
            ringOffset: '2px',
          },
          '&:disabled': {
            backgroundColor: theme('colors.gray.300'),
            cursor: 'not-allowed',
            transform: 'none',
            boxShadow: 'none',
          },
        },
        // Secondary button styles
        '.btn-secondary': {
          backgroundColor: 'transparent',
          color: theme('colors.rose.600'),
          padding: theme('spacing.3') + ' ' + theme('spacing.6'),
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          fontSize: theme('fontSize.sm'),
          lineHeight: theme('lineHeight.none'),
          border: '1px solid ' + theme('colors.rose.300'),
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: theme('colors.rose.50'),
            borderColor: theme('colors.rose.400'),
            transform: 'translateY(-1px)',
          },
          '&:focus': {
            outline: 'none',
            ring: '2px solid ' + theme('colors.rose.500'),
            ringOffset: '2px',
          },
        },
        // Outline button styles
        '.btn-outline': {
          backgroundColor: 'transparent',
          color: theme('colors.gray.700'),
          padding: theme('spacing.3') + ' ' + theme('spacing.6'),
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          fontSize: theme('fontSize.sm'),
          lineHeight: theme('lineHeight.none'),
          border: '1px solid ' + theme('colors.gray.300'),
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: theme('colors.gray.50'),
            borderColor: theme('colors.gray.400'),
          },
          '&:focus': {
            outline: 'none',
            ring: '2px solid ' + theme('colors.gray.500'),
            ringOffset: '2px',
          },
        },
        // Card component styles
        '.card': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.lg'),
          padding: theme('spacing.6'),
          boxShadow: theme('boxShadow.soft'),
          border: '1px solid ' + theme('colors.gray.200'),
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: theme('boxShadow.medium'),
          },
        },
        // Glass card effect
        '.card-glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: theme('borderRadius.lg'),
          padding: theme('spacing.6'),
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
        // Wedding-themed components
        '.wedding-gradient': {
          background: 'linear-gradient(135deg, ' + theme('colors.rose.500') + ', ' + theme('colors.purple.600') + ')',
        },
        '.text-gradient': {
          background: 'linear-gradient(135deg, ' + theme('colors.rose.600') + ', ' + theme('colors.purple.600') + ')',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        // Animation helpers
        '.animate-fade-in': {
          animation: 'fade-in-up 0.8s ease-out',
        },
        '.animate-float': {
          animation: 'float 6s ease-in-out infinite',
        },
      });
    },
  ],
};

export default config;