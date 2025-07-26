import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { initializeWebSocketService } from "./services/websocket";
import { logInfo, logError } from "./utils/logger";
import { requireAuth } from "./middleware/auth";
import { validateBody } from "./utils/validation";
import { getOrCreateDefaultProject } from "./utils/projects";
import { RequestWithUser } from "./types/express";
import { 
  insertInspirationItemSchema, insertScheduleSchema, insertScheduleEventSchema, 
  insertIntakeDataSchema, insertWeddingOverviewSchema
} from "@shared/schema";

// Import security middleware
import { 
  apiLimiter, 
  authLimiter, 
  aiLimiter, 
  securityHeaders,
  preventSQLInjection 
} from "./middleware/security";
import { enhancedRequireAuth, startSessionCleanup } from "./middleware/enhanced-auth";

// Import modular routes
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import taskRoutes from "./routes/tasks";
import guestRoutes from "./routes/guests";
import vendorRoutes from "./routes/vendors";
import budgetRoutes from "./routes/budget";
import aiRoutes from "./routes/ai";
import aiSuggestionsRoutes from "./routes/ai-suggestions";
import uploadRoutes from "./routes/uploads";
import exportRoutes from "./routes/export";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize WebSocket service
  initializeWebSocketService(httpServer);

  // Start session cleanup service
  startSessionCleanup();

  // Apply security middleware conditionally
  if (process.env.NODE_ENV === 'production') {
    app.use(securityHeaders);
    app.use(preventSQLInjection);
  }

  // Register modular routes with basic auth for development
  app.use("/api/auth", authRoutes);
  app.use("/api/projects", requireAuth, projectRoutes);
  app.use("/api/tasks", requireAuth, taskRoutes);
  app.use("/api/guests", requireAuth, guestRoutes);
  app.use("/api/vendors", requireAuth, vendorRoutes);
  app.use("/api/budget-items", requireAuth, budgetRoutes);
  app.use("/api/ai", requireAuth, aiRoutes);
  app.use("/api/ai", requireAuth, aiSuggestionsRoutes);
  app.use("/api/upload", requireAuth, uploadRoutes);
  app.use("/api/export", requireAuth, exportRoutes);

  // Add simple dashboard stats endpoint
  app.get("/api/dashboard/stats", requireAuth, async (req: RequestWithUser, res) => {
    try {
      const project = await getOrCreateDefaultProject(req.userId);
      
      // Get all data for stats calculation
      const [tasks, guests, budget, vendors] = await Promise.all([
        storage.getTasksByProjectId(project.id),
        storage.getGuestsByProjectId(project.id),
        storage.getBudgetItemsByProjectId(project.id),
        storage.getVendorsByProjectId(project.id)
      ]);

      // Calculate stats
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalGuests = guests.length;
      const confirmedGuests = guests.filter(g => g.rsvpStatus === 'yes').length;
      const totalBudget = budget.reduce((sum, item) => sum + parseFloat(item.estimatedCost || '0'), 0);
      const spentBudget = budget.reduce((sum, item) => sum + parseFloat(item.actualCost || '0'), 0);
      const totalVendors = vendors.length;
      const bookedVendors = vendors.filter(v => v.status === 'booked').length;

      res.json({
        tasks: { total: totalTasks, completed: completedTasks },
        guests: { total: totalGuests, confirmed: confirmedGuests },
        budget: { total: totalBudget, spent: spentBudget },
        vendors: { total: totalVendors, booked: bookedVendors },
        daysUntilWedding: project.date ? Math.max(0, Math.ceil((new Date(project.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0
      });
    } catch (error) {
      logError('dashboard', error, { userId: req.userId });
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Add intake endpoint
  app.get("/api/intake", requireAuth, async (req: any, res) => {
    try {
      const intake = await storage.getIntakeDataByUserId(req.userId);
      res.json(intake || null);
    } catch (error) {
      logError('intake', error, { userId: req.userId });
      res.status(500).json({ message: "Failed to fetch intake data" });
    }
  });

  // Pinterest board import endpoint
  app.post('/api/pinterest/import-board', requireAuth, validateBody(z.object({
    boardUrl: z.string().url(),
    category: z.string().optional()
  })), async (req: RequestWithUser, res) => {
    try {
      const { boardUrl } = req.body;
      
      // Validate Pinterest URL - simplified and more flexible
      const pinterestUrlPattern = /^https?:\/\/(www\.)?pinterest\.[a-z]{2,}/i;
      
      if (!pinterestUrlPattern.test(boardUrl)) {
        return res.status(400).json({ 
          error: 'Invalid Pinterest board URL. Please provide a valid Pinterest board URL like: https://www.pinterest.com/username/board-name/' 
        });
      }

      // Extract board information from URL
      const urlParts = boardUrl.split('/');
      const username = urlParts[3];
      const boardName = urlParts[4];

      // Get current user's project
      const project = await getOrCreateDefaultProject(req.userId);
      
      // Return error explaining Pinterest API limitation
      logInfo('pinterest', 'Pinterest import attempt', { userId: req.userId, boardUrl });
      
      return res.status(400).json({ 
        error: 'Pinterest API integration requires official Pinterest Developer credentials and approval. For now, please manually add images from your Pinterest board using the "Add Inspiration" button and copy image URLs directly from Pinterest pins.',
        suggestion: 'To add images from Pinterest: 1) Open your Pinterest board, 2) Click on a pin, 3) Right-click the image and copy image address, 4) Use "Add Inspiration" button and paste the image URL'
      });

    } catch (error) {
      logError('pinterest', error, { userId: req.userId });
      res.status(500).json({ error: 'Failed to import Pinterest board' });
    }
  });

  // Inspiration routes
  app.get("/api/inspiration", requireAuth, async (req: RequestWithUser, res) => {
    try {
      const project = await getOrCreateDefaultProject(req.userId);
      const inspirationItems = await storage.getInspirationItemsByProjectId(project.id);
      res.json(inspirationItems);
    } catch (error) {
      logError('inspiration', error, { userId: req.userId });
      res.status(500).json({ message: "Failed to fetch inspiration items" });
    }
  });

  app.post("/api/inspiration", requireAuth, validateBody(insertInspirationItemSchema), async (req: RequestWithUser, res) => {
    try {
      const project = await getOrCreateDefaultProject(req.userId);
      const inspirationData = { ...req.body, projectId: project.id, addedBy: req.userId };
      const inspiration = await storage.createInspirationItem(inspirationData);
      
      logInfo('inspiration', `Inspiration item added: ${inspiration.title}`, { userId: req.userId });
      res.status(201).json(inspiration);
    } catch (error) {
      logError('inspiration', error, { userId: req.userId });
      res.status(500).json({ message: "Failed to add inspiration item" });
    }
  });

  app.put("/api/inspiration/:id", requireAuth, validateBody(insertInspirationItemSchema.partial()), async (req: RequestWithUser, res) => {
    try {
      const inspirationId = parseInt(req.params.id);
      const inspiration = await storage.getInspirationItemById(inspirationId);
      
      if (!inspiration) {
        return res.status(404).json({ message: "Inspiration item not found" });
      }

      // Verify access through project ownership
      const projects = await storage.getWeddingProjectsByUserId(req.userId);
      const hasAccess = projects.some(p => p.id === inspiration.projectId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedInspiration = await storage.updateInspirationItem(inspirationId, req.body);
      
      logInfo('inspiration', `Inspiration item updated: ${inspirationId}`, { userId: req.userId });
      res.json(updatedInspiration);
    } catch (error) {
      logError('inspiration', error, { userId: req.userId, inspirationId: req.params.id });
      res.status(500).json({ message: "Failed to update inspiration item" });
    }
  });

  app.delete("/api/inspiration/:id", requireAuth, async (req: RequestWithUser, res) => {
    try {
      const inspirationId = parseInt(req.params.id);
      const inspiration = await storage.getInspirationItemById(inspirationId);
      
      if (!inspiration) {
        return res.status(404).json({ message: "Inspiration item not found" });
      }

      // Verify access through project ownership
      const projects = await storage.getWeddingProjectsByUserId(req.userId);
      const hasAccess = projects.some(p => p.id === inspiration.projectId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteInspirationItem(inspirationId);
      
      logInfo('inspiration', `Inspiration item deleted: ${inspirationId}`, { userId: req.userId });
      res.json({ message: "Inspiration item deleted successfully" });
    } catch (error) {
      logError('inspiration', error, { userId: req.userId, inspirationId: req.params.id });
      res.status(500).json({ message: "Failed to delete inspiration item" });
    }
  });

  // Schedule routes
  app.get("/api/schedules", requireAuth, async (req: RequestWithUser, res) => {
    try {
      const project = await getOrCreateDefaultProject(req.userId);
      const schedules = await storage.getSchedulesByProjectId(project.id);
      res.json(schedules);
    } catch (error) {
      logError('schedules', error, { userId: req.userId });
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", requireAuth, validateBody(insertScheduleSchema), async (req: RequestWithUser, res) => {
    try {
      const project = await getOrCreateDefaultProject(req.userId);
      const scheduleData = { ...req.body, projectId: project.id };
      const schedule = await storage.createSchedule(scheduleData);
      
      logInfo('schedules', `Schedule created: ${schedule.name}`, { userId: req.userId });
      res.status(201).json(schedule);
    } catch (error) {
      logError('schedules', error, { userId: req.userId });
      res.status(500).json({ message: "Failed to create schedule" });
    }
  });

  app.put("/api/schedules/:id", requireAuth, validateBody(insertScheduleSchema.partial()), async (req: RequestWithUser, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const schedule = await storage.getScheduleById(scheduleId);
      
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }

      // Verify access through project ownership
      const projects = await storage.getWeddingProjectsByUserId(req.userId);
      const hasAccess = projects.some(p => p.id === schedule.projectId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedSchedule = await storage.updateSchedule(scheduleId, req.body);
      
      logInfo('schedules', `Schedule updated: ${scheduleId}`, { userId: req.userId });
      res.json(updatedSchedule);
    } catch (error) {
      logError('schedules', error, { userId: req.userId, scheduleId: req.params.id });
      res.status(500).json({ message: "Failed to update schedule" });
    }
  });

  app.delete("/api/schedules/:id", requireAuth, async (req: RequestWithUser, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const schedule = await storage.getScheduleById(scheduleId);
      
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }

      // Verify access through project ownership
      const projects = await storage.getWeddingProjectsByUserId(req.userId);
      const hasAccess = projects.some(p => p.id === schedule.projectId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteSchedule(scheduleId);
      
      logInfo('schedules', `Schedule deleted: ${scheduleId}`, { userId: req.userId });
      res.json({ message: "Schedule deleted successfully" });
    } catch (error) {
      logError('schedules', error, { userId: req.userId, scheduleId: req.params.id });
      res.status(500).json({ message: "Failed to delete schedule" });
    }
  });

  // Intake and overview routes
  app.post("/api/intake", requireAuth, validateBody(insertIntakeDataSchema), async (req: RequestWithUser, res) => {
    try {
      const intakeData = { ...req.body, userId: req.userId };
      const intake = await storage.createIntakeData(intakeData);
      
      logInfo('intake', 'Intake form completed', { userId: req.userId });
      res.status(201).json(intake);
    } catch (error) {
      logError('intake', error, { userId: req.userId });
      res.status(500).json({ message: "Failed to save intake data" });
    }
  });

  // Get intake data for current user
  app.get("/api/intake", requireAuth, async (req: RequestWithUser, res) => {
    try {
      const intake = await storage.getIntakeDataByUserId(req.userId);
      if (!intake) {
        return res.status(404).json({ message: "No intake data found" });
      }
      res.json(intake);
    } catch (error) {
      logError('intake', error, { userId: req.userId });
      res.status(500).json({ message: "Failed to fetch intake data" });
    }
  });

  app.get("/api/intake/:userId", requireAuth, async (req: RequestWithUser, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Users can only access their own intake data
      if (userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const intake = await storage.getIntakeDataByUserId(userId);
      res.json(intake);
    } catch (error) {
      logError('intake', error, { userId: req.userId });
      res.status(500).json({ message: "Failed to fetch intake data" });
    }
  });

  app.post("/api/overview", requireAuth, validateBody(insertWeddingOverviewSchema), async (req: RequestWithUser, res) => {
    try {
      const project = await getOrCreateDefaultProject(req.userId);
      const overviewData = { ...req.body, projectId: project.id };
      const overview = await storage.createWeddingOverview(overviewData);
      
      logInfo('overview', 'Wedding overview updated', { userId: req.userId });
      res.status(201).json(overview);
    } catch (error) {
      logError('overview', error, { userId: req.userId });
      res.status(500).json({ message: "Failed to save overview data" });
    }
  });

  return httpServer;
}