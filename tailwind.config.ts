@import './styles/enhanced.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ===============================
   :ROOT VARIABLES – THEME COLORS
   =============================== */
:root {
  --background: hsl(0, 0%, 100%);
  --foreground: hsl(20, 14.3%, 4.1%);
  --muted: hsl(60, 4.8%, 95.9%);
  --muted-foreground: hsl(25, 5.3%, 44.7%);
  --primary: hsl(330, 81%, 85%);
  --primary-foreground: hsl(330, 30%, 25%);
  --rose-gold: hsl(12, 47%, 82%);
  --cream: hsl(60, 29%, 98%);
  --champagne: hsl(48, 87%, 55%);
  --soft-gold: hsl(45, 61%, 92%);
  --radius: 0.75rem;
  --ring: hsl(20, 14.3%, 4.1%);
}

/* Dark mode overrides */
.dark {
  --background: hsl(240, 10%, 3.9%);
  --foreground: hsl(0, 0%, 98%);
  --primary: hsl(330, 81%, 85%);
  --primary-foreground: hsl(330, 30%, 25%);
  --ring: hsl(240, 4.9%, 83.9%);
}

/* ===============================
   BASE STYLES
   =============================== */
@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply font-sans antialiased;
    background-color: var(--cream);
    color: var(--foreground);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    scroll-behavior: smooth;
  }
}

/* ===============================
   CUSTOM UTILITIES
   =============================== */
@layer utilities {
  /* Safe area padding */
  .safe-area-pt { padding-top: env(safe-area-inset-top); }
  .safe-area-pb { padding-bottom: max(env(safe-area-inset-bottom), 1rem); }
  .safe-area-pl { padding-left: env(safe-area-inset-left); }
  .safe-area-pr { padding-right: env(safe-area-inset-right); }

  /* Gradients & Shadows */
  .bg-gradient-blush { background: linear-gradient(135deg, var(--blush), var(--rose-gold)); }
  .bg-gradient-sunset { background: linear-gradient(135deg, #FF8A80, #FFAB91, #FFCC80); }
  .shadow-soft { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
  .shadow-medium { box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12); }
  .shadow-strong { box-shadow: 0 16px 40px rgba(0, 0, 0, 0.16); }

  /* Frosted glass effect */
  .glass-panel {
    backdrop-filter: blur(20px);
    background-color: rgba(255, 255, 255, 0.85);
  }

  /* Typography enhancements */
  .text-gradient {
    background: linear-gradient(135deg, var(--blush), var(--rose-gold));
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
  }

  .font-fancy {
    font-family: 'Playfair Display', Georgia, serif;
  }

  /* Animations */
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
  .animate-float { animation: float 6s ease-in-out infinite; }

  /* Countdowns / celebration effects */
  .glow-countdown {
    box-shadow: 0 0 20px rgba(244, 165, 185, 0.4),
                0 0 40px rgba(244, 165, 185, 0.2),
                0 0 60px rgba(244, 165, 185, 0.1);
  }

  /* Responsive spacing */
  @media (max-width: 768px) {
    .mobile-touch { min-height: 44px; min-width: 44px; }
    .mobile-padding { padding-left: 1rem; padding-right: 1rem; }
    .mobile-form { width: 100%; padding: 1rem; }
    .mobile-header { font-size: 1.25rem; line-height: 1.75rem; }
  }

  @media (min-width: 1024px) {
    .desktop-padding { padding: 2rem 3rem; }
    .desktop-lg-button { padding: 0.75rem 2rem; font-size: 1.125rem; }
  }

  @media (min-width: 1280px) {
    .xl-padding { padding: 3rem; }
    .xl-heading { font-size: 1.5rem; line-height: 2.25rem; }
  }
}
