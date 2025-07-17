# PlanHaus - Complete Wedding Planning Application

## Overview
PlanHaus is a comprehensive AI-powered wedding planning application that helps couples organize their entire wedding planning process. Built with modern web technologies, it features real-time collaboration, intelligent timeline management, budget tracking, guest management, and AI-powered recommendations.

## Features

### Core Planning Tools
- **Smart Timeline**: Automatically organized wedding tasks with chronological sorting (12+ months before to post-wedding)
- **Budget Management**: Comprehensive expense tracking with categories and vendor management
- **Guest List**: RSVP tracking, dietary restrictions, and guest information management
- **Vendor Directory**: Contact management and booking status tracking
- **Inspiration Board**: Mood board creation with image uploads and Pinterest integration
- **Schedule Management**: Multi-day event scheduling for wedding weekend activities

### Advanced Features
- **AI Assistant**: Intelligent wedding planning recommendations and advice
- **Real-time Collaboration**: WebSocket-powered live updates for multiple users
- **Smart Actions Dashboard**: Context-aware quick actions and urgent task detection
- **Automatic Task Management**: Tasks automatically move between timeframes based on due dates
- **Progress Tracking**: Visual progress indicators and completion statistics
- **Export Capabilities**: CSV, JSON, and print options for all data

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for state management
- **Wouter** for routing
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Drizzle ORM** with PostgreSQL
- **WebSocket** for real-time features
- **OpenAI API** for AI recommendations

### Database
- **PostgreSQL** with Neon serverless configuration
- **Drizzle ORM** for type-safe database operations
- **Schema-first** approach with shared types

## Project Structure

```
planhaus-complete-app/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── lib/           # Utility functions and configurations
│   │   ├── pages/         # Application pages/routes
│   │   └── index.tsx      # Application entry point
│   └── index.html
├── server/                # Backend Express application
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database operations
│   ├── db.ts            # Database connection
│   ├── demo-setup.ts    # Demo data creation
│   └── index.ts         # Server entry point
├── shared/               # Shared TypeScript types and schemas
│   └── schema.ts        # Database schema and type definitions
├── package.json         # Dependencies and scripts
├── vite.config.ts      # Vite configuration
├── tailwind.config.ts  # Tailwind CSS configuration
├── drizzle.config.ts   # Database ORM configuration
└── tsconfig.json       # TypeScript configuration
```

## Installation and Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key (optional, for AI features)

### Environment Variables
Create a `.env` file in the root directory:

```env
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key_optional
```

### Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npm run db:push
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open http://localhost:5000 in your browser

## Key Files and Components

### Timeline Management (`client/src/pages/timeline-auto.tsx`)
- Chronological task organization using numeric time_order field (0-13, 99)
- Automatic timeframe reassignment when due dates change
- Clickable status circles for task completion
- Stats cards for filtering tasks (Total, Completed, Pending, Overdue)
- Edit and delete functionality with proper authentication

### Database Schema (`shared/schema.ts`)
Comprehensive schema covering:
- Users and authentication
- Wedding projects with collaboration
- Tasks with timeline integration
- Budget items and vendor management
- Guest lists with RSVP tracking
- Activities and real-time logging
- Inspiration items and file uploads

### API Routes (`server/routes.ts`)
RESTful endpoints for:
- Authentication and user management
- Project CRUD operations
- Task management with timeline integration
- Budget and expense tracking
- Guest list management
- Vendor directory operations
- Real-time activity logging

## Demo Data
The application includes comprehensive demo data featuring "Emma & Jake's Austin Farmhouse Wedding" with:
- 75% complete wedding planning progress
- $45,000 realistic budget with detailed expenses
- 85-person guest list with wedding party and family
- Austin-based vendor directory
- Complete wedding weekend schedule
- Farmhouse-themed inspiration board

## Authentication
- Session-based authentication for demo purposes
- Demo login button for easy access
- Easily upgradeable to JWT or database sessions for production

## AI Integration
- OpenAI GPT-4 powered wedding planning recommendations
- Context-aware suggestions based on wedding details
- Timeline generation and budget allocation advice
- Personalized vendor recommendations

## Real-time Features
- WebSocket connections for live collaboration
- Activity streams showing real-time project updates
- Instant notifications for task completions and changes
- Multi-user editing with conflict resolution

## Production Deployment
- Frontend builds to optimized static assets
- Express server handles both API and static file serving
- PostgreSQL database with proper migrations
- Environment-based configuration for different stages

## Contributing
This is a complete, production-ready wedding planning application with all major features implemented and thoroughly tested.

## License
All rights reserved - PlanHaus Wedding Planning Application