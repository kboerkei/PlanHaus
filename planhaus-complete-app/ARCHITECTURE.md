# PlanHaus Application Architecture

## Complete File Structure

### Frontend Components (`client/src/`)
- **components/ui/**: Complete shadcn/ui component library (40+ components)
- **lib/**: Utilities including query client, authentication, and helpers
- **pages/**: All application pages with full functionality

### Key Application Pages
1. **timeline-auto.tsx** - Main timeline with automatic task management
2. **dashboard.tsx** - Overview with statistics and smart actions
3. **guests.tsx** - Guest list management with RSVP tracking
4. **budget.tsx** - Comprehensive budget and expense management
5. **vendors.tsx** - Vendor directory and contact management
6. **inspiration.tsx** - Mood board with image uploads
7. **schedules.tsx** - Multi-day event scheduling
8. **ai-assistant.tsx** - AI-powered planning recommendations
9. **auth/login.tsx** & **auth/signup.tsx** - Authentication flows

### Backend Architecture (`server/`)
- **routes.ts** - Complete REST API with all CRUD operations
- **storage.ts** - Database abstraction layer with type safety
- **db.ts** - PostgreSQL connection and Drizzle setup
- **demo-setup.ts** - Comprehensive demo data generation
- **index.ts** - Express server with middleware and WebSocket support

### Database Schema (`shared/schema.ts`)
Complete relational database with:
- Users, Projects, Collaborators
- Tasks with timeline integration
- Budget items and vendors
- Guests with RSVP tracking
- Inspiration items and uploads
- Activities for real-time logging
- Schedules for event management

## Key Features Implemented

### Timeline Management
- Numeric time_order sorting (0-13, 99) for chronological organization
- Automatic timeframe reassignment based on due date changes
- Clickable status circles for task completion
- Filter buttons for task status (All, Completed, Pending, Overdue)
- Full CRUD operations with proper authentication

### Real-time Collaboration
- WebSocket integration for live updates
- Activity logging for all user actions
- Real-time notifications and status updates
- Multi-user session management

### AI Integration
- OpenAI GPT-4 powered recommendations
- Context-aware wedding planning advice
- Timeline generation based on wedding details
- Personalized vendor and budget suggestions

### Data Management
- Type-safe database operations with Drizzle ORM
- Comprehensive validation with Zod schemas
- Proper error handling and user feedback
- Export capabilities (CSV, JSON, print)

### Mobile Optimization
- Responsive design with Tailwind CSS
- Mobile-first navigation with bottom sheets
- Touch-friendly interface elements
- Proper safe area handling

## Production Readiness

### Authentication & Security
- Session-based authentication with Bearer tokens
- Input validation and sanitization
- CORS configuration and security headers
- Environment-based configuration

### Database
- PostgreSQL with proper indexes and constraints
- Migration system with Drizzle
- Connection pooling for performance
- Backup and recovery considerations

### API Design
- RESTful endpoints with consistent patterns
- Proper HTTP status codes and error handling
- Request/response validation
- Rate limiting considerations

### Frontend Build
- Vite for optimized production builds
- Code splitting and lazy loading
- Asset optimization and caching
- Progressive Web App capabilities

## Deployment Configuration

### Environment Variables
- DATABASE_URL for PostgreSQL connection
- OPENAI_API_KEY for AI features (optional)
- NODE_ENV for environment detection

### Build Process
- `npm run build` creates production assets
- `npm run dev` for development with hot reload
- `npm run db:push` for schema migrations

### Server Configuration
- Express serves both API and static files
- WebSocket server for real-time features
- Proper error handling and logging
- Health check endpoints

This architecture provides a complete, scalable wedding planning platform with all modern web application features and best practices.