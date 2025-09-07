import express from 'express';
import authRoutes from './auth';
import projectRoutes from './projects';
import guestRoutes from './guests';
import budgetRoutes from './budget';
import taskRoutes from './tasks';
import vendorRoutes from './vendors';
import aiRoutes from './ai';
import activityRoutes from './activities';
import activityLogRoutes from './activity-log';
import exportRoutes from './export';
import importRoutes from './import';
import overviewRoutes from './overview';
import creativeDetailsRoutes from './creative-details';
import analyticsRoutes from './analytics';

export function registerRoutes(app: express.Application) {
  // Register all routes
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/guests', guestRoutes);
  app.use('/api/budget', budgetRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/vendors', vendorRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/export', exportRoutes);
  app.use('/api/import', importRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/activity-log', activityLogRoutes);
  app.use('/api/creative-details', creativeDetailsRoutes);
  app.use('/api/overview', overviewRoutes);
  app.use('/api/analytics', analyticsRoutes);

  return app;
} 