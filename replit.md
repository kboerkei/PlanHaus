# Wedding Planning Application

## Overview

This is a full-stack AI-assisted wedding planning application called "PlanHaus." Its main purpose is to help couples plan their weddings with comprehensive tools, real-time collaboration, and AI-powered recommendations. The project aims to provide a smart, elegant, and personalized planning experience, serving as a central hub for all wedding preparations.

## Recent Changes (Updated August 3, 2025)

### Comprehensive UI/UX Enhancement Implementation
- **Complete Enhancement System**: Implemented all recommendations from UI/UX review documents including enhanced dashboard, AI-powered next steps, and breadcrumb navigation
- **Enhanced Design System**: Added wedding-themed color palette, shadow system, gradients, and micro-interactions throughout the application
- **Advanced UI Components**: Created QuickStatsBar, AINextStepsPanel, enhanced forms, skeleton loaders, and comprehensive error boundaries
- **TypeScript Resolution**: Achieved zero TypeScript errors across entire codebase with enhanced type safety and proper schema imports
- **Performance Optimization**: Added React.memo optimization, proper query caching, and mobile responsiveness improvements
- **Accessibility Compliance**: Implemented WCAG 2.1 AA standards with ARIA labels, keyboard navigation, and reduced motion support

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components (using Radix UI primitives)
- **State Management**: TanStack Query for server state and caching
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM
- **Real-time Communication**: Custom WebSocket implementation
- **AI Integration**: OpenAI API
- **Authentication**: Session-based with JWT for collaboration features

### Data Storage & Schema
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Comprehensive, covering Users, Wedding Projects, Collaborators, Tasks, Guests, Vendors, Budget Items, Timeline Events, Inspiration Items, and Activities.

### Key Features & Design Decisions
- **AI Services**: Timeline generation, budget breakdown, vendor recommendations, theme analysis, personalized advice.
- **Real-time Features**: Live collaboration, activity streams, notification system.
- **Monorepo Structure**: Shared schema between client and server for type safety.
- **Component Architecture**: shadcn/ui for accessible, customizable components.
- **UI/UX Decisions**: Elegant typography (Playfair Display, DM Serif Display, Inter, DM Sans), blush/pink gradient theme, glass morphism effects, comprehensive component library with variants (buttons, cards, headers), dark/light mode toggle.
- **Mobile Optimization**: Responsive design, touch-friendly interactions, bottom sheets for navigation, safe area handling.
- **Error Handling**: Comprehensive error boundaries, user-friendly error messages, loading states.
- **Performance**: Lazy loading, memoization, query deduplication, debounced operations, bundle optimization.
- **Accessibility**: WCAG compliance, ARIA labels, keyboard navigation, screen reader support, high contrast detection.
- **Collaboration**: Multi-user support with JWT authentication, role-based access control (admin, editor, viewer), team invitations, activity logging.
- **Guest Management**: Party size tracking for accurate RSVP counts.
- **Creative Details**: Expanded categories for personalized wedding details (signature drinks, signage, photos, songs, moodboard, DIY projects) with AI integration.
- **AI Assistant**: Unified chat and document analysis interface, personalized responses using user intake data, optimized prompt preprocessing.
- **Mood Board**: Interactive drag-and-drop mood board for inspiration items with image upload.
- **Modular Architecture**: Centralized Zod validation schemas, specialized data-fetching hooks (useVendors, useGuests, etc.), reusable components.

## External Dependencies

### Core Frameworks & Libraries
- React Ecosystem (React 18, React DOM, TanStack Query)
- UI Framework (Radix UI components, Tailwind CSS, shadcn/ui)
- Backend (Express.js, Drizzle ORM, WebSocket support)
- Development (Vite, TypeScript, PostCSS)

### Database & Storage
- @neondatabase/serverless (Serverless PostgreSQL driver)
- drizzle-orm (Type-safe ORM for PostgreSQL)
- connect-pg-simple (PostgreSQL session store)

### AI & External Services
- OpenAI (GPT-4o integration for AI planning features)
- date-fns (Date manipulation utilities)

### Form & Validation
- react-hook-form (Form state management)
- @hookform/resolvers (Form validation resolvers)
- zod (Schema validation and type inference)
- drizzle-zod (Database schema to Zod validation mapping)

### Other Utilities
- @dnd-kit (Drag and drop functionality)
- DOMPurify (HTML sanitization)
- canvas-confetti (Celebration animations)
- Recharts (Chart visualization)