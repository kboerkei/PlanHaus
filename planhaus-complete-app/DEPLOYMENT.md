# PlanHaus Deployment Guide

## Quick Start (Local Development)

### 1. Prerequisites
```bash
# Ensure you have Node.js 18+ installed
node --version

# Install PostgreSQL or use a cloud provider like Neon
```

### 2. Environment Setup
Create `.env` file in the root directory:
```env
# Required: PostgreSQL connection string
DATABASE_URL=postgresql://username:password@localhost:5432/planhaus

# Optional: OpenAI API key for AI features
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Development mode
NODE_ENV=development
```

### 3. Installation
```bash
# Install all dependencies
npm install

# Set up database schema
npm run db:push

# Start development server
npm run dev
```

### 4. Access Application
- Open http://localhost:5000
- Click "Demo Login" for instant access
- Or create a new account via signup

## Production Deployment

### Cloud Database (Recommended)
Use Neon PostgreSQL for serverless deployment:
```env
DATABASE_URL=postgresql://user:pass@region.neon.tech/planhaus?sslmode=require
```

### Environment Variables for Production
```env
DATABASE_URL=your_production_postgresql_url
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
```

### Build and Deploy
```bash
# Create production build
npm run build

# Start production server
npm start
```

### Platform-Specific Deployment

#### Replit (Current Platform)
- Already configured with workflows
- Use "Deploy" button in Replit interface
- Environment variables managed in Replit secrets

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway deploy
```

#### Heroku
```bash
# Create Heroku app
heroku create planhaus-app

# Set environment variables
heroku config:set DATABASE_URL=your_db_url
heroku config:set OPENAI_API_KEY=your_key

# Deploy
git push heroku main
```

## Database Configuration

### Schema Migration
```bash
# Push schema changes to database
npm run db:push

# Generate migration files (if needed)
npm run db:generate
```

### Demo Data Setup
The application automatically creates demo data on first run:
- Demo user account
- Austin farmhouse wedding project
- Complete task timeline
- Sample budget and guests
- Vendor directory

### Production Database Considerations
- Enable connection pooling for performance
- Set up regular backups
- Configure SSL connections
- Monitor query performance
- Set up database monitoring

## Security Checklist

### Environment Variables
- ✅ DATABASE_URL configured
- ✅ OPENAI_API_KEY secured (optional)
- ✅ NODE_ENV set to "production"

### Database Security
- ✅ SSL connections enabled
- ✅ Connection pooling configured
- ✅ Access controls in place
- ✅ Regular backups scheduled

### Application Security
- ✅ Input validation with Zod schemas
- ✅ SQL injection protection via Drizzle ORM
- ✅ CORS configuration
- ✅ Rate limiting (recommended for production)

## Performance Optimization

### Frontend
- Static asset optimization via Vite
- Code splitting and lazy loading
- Image optimization for inspiration boards
- Progressive Web App features

### Backend
- Database connection pooling
- Query optimization with proper indexes
- Caching strategies for frequently accessed data
- WebSocket connection management

### Monitoring
- Application performance monitoring
- Database query performance
- Error tracking and logging
- User analytics (optional)

## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Test database connection
npm run db:push
```

#### Environment Variables
```bash
# Verify environment variables are loaded
node -e "console.log(process.env.DATABASE_URL)"
```

#### Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Support Resources
- Check application logs for detailed error messages
- Verify all environment variables are properly set
- Ensure database is accessible and schema is up to date
- Test API endpoints independently if needed

## Feature Flags

### AI Features
Set `OPENAI_API_KEY` to enable:
- AI timeline generation
- Intelligent recommendations
- Context-aware suggestions

### Demo Mode
Demo data is automatically created for development and testing

## Backup and Recovery

### Database Backups
```bash
# Create database backup
pg_dump $DATABASE_URL > planhaus_backup.sql

# Restore from backup
psql $DATABASE_URL < planhaus_backup.sql
```

### Application Data Export
Users can export their data via the application:
- CSV exports for all data types
- JSON exports for complete data
- Print-friendly formats

This deployment guide ensures a smooth transition from development to production for the complete PlanHaus wedding planning application.