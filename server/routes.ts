import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  insertUserSchema, insertWeddingProjectSchema, insertCollaboratorSchema,
  insertTaskSchema, insertGuestSchema, insertVendorSchema, insertBudgetItemSchema,
  insertTimelineEventSchema, insertInspirationItemSchema, insertActivitySchema,
  users
} from "@shared/schema";
import { 
  generateWeddingTimeline, generateBudgetBreakdown, generateVendorSuggestions,
  generatePersonalizedRecommendation, analyzeWeddingTheme 
} from "./services/openai";
import { initializeWebSocketService, websocketService } from "./services/websocket";

// Simple session storage for demo purposes
const sessions = new Map<string, { userId: number }>();

function generateSessionId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function requireAuth(req: any, res: any, next: any) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  req.userId = sessions.get(sessionId)!.userId;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize WebSocket service
  initializeWebSocketService(httpServer);

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      const sessionId = generateSessionId();
      sessions.set(sessionId, { userId: user.id });

      res.json({ 
        user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar },
        sessionId 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const sessionId = generateSessionId();
      sessions.set(sessionId, { userId: user.id });

      res.json({ 
        user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar },
        sessionId 
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        avatar: user.avatar 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/auth/profile", requireAuth, async (req: any, res) => {
    try {
      const { username, email, avatar } = req.body;
      const user = await storage.getUserById(req.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if email is being changed and if it's already taken
      if (email !== user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== user.id) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      // Update user in storage using direct database update
      await db.update(users).set({ username, email, avatar: avatar || null }).where(eq(users.id, user.id));
      const updatedUser = { ...user, username, email, avatar: avatar || null };

      res.json({ 
        id: updatedUser.id, 
        username: updatedUser.username, 
        email: updatedUser.email, 
        avatar: updatedUser.avatar 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Wedding projects
  app.get("/api/projects", requireAuth, async (req: any, res) => {
    try {
      const projects = await storage.getWeddingProjectsByUserId(req.userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", requireAuth, async (req: any, res) => {
    try {
      const projectData = insertWeddingProjectSchema.parse({
        ...req.body,
        createdBy: req.userId
      });
      
      const project = await storage.createWeddingProject(projectData);
      
      // Create activity
      await storage.createActivity({
        projectId: project.id,
        userId: req.userId,
        action: 'created project',
        target: 'project',
        targetId: project.id,
        details: { projectName: project.name }
      });

      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getWeddingProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user has access
      const collaborators = await storage.getCollaboratorsByProjectId(projectId);
      const hasAccess = project.createdBy === req.userId || 
        collaborators.some(collab => collab.userId === req.userId);

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // AI planning routes
  app.post("/api/projects/:id/ai/generate-timeline", requireAuth, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getWeddingProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const timeline = await generateWeddingTimeline({
        budget: parseFloat(project.budget || '0'),
        guestCount: project.guestCount || 100,
        date: project.date.toISOString(),
        venue: project.venue || undefined,
        theme: project.theme || undefined,
        style: project.style || undefined,
        preferences: project.description || undefined
      });

      // Convert timeline items to tasks
      const tasks = await Promise.all(timeline.map(async (item) => {
        const dueDate = new Date(project.date);
        dueDate.setDate(dueDate.getDate() - (item.week * 7));
        
        return await storage.createTask({
          projectId,
          title: item.title,
          description: item.description,
          category: item.category,
          priority: item.priority,
          status: 'pending',
          dueDate,
          createdBy: req.userId,
          assignedTo: null
        });
      }));

      // Create activity
      await storage.createActivity({
        projectId,
        userId: req.userId,
        action: 'generated AI timeline',
        target: 'timeline',
        details: { tasksCreated: tasks.length }
      });

      websocketService?.notifyActivity(projectId, {
        action: 'generated AI timeline',
        user: await storage.getUserById(req.userId),
        details: { tasksCreated: tasks.length }
      });

      res.json({ tasks, timeline });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate timeline" });
    }
  });

  app.post("/api/projects/:id/ai/generate-budget", requireAuth, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getWeddingProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const budgetBreakdown = await generateBudgetBreakdown({
        budget: parseFloat(project.budget || '0'),
        guestCount: project.guestCount || 100,
        date: project.date.toISOString(),
        venue: project.venue || undefined,
        theme: project.theme || undefined,
        style: project.style || undefined
      });

      // Create budget items
      const budgetItems = await Promise.all(budgetBreakdown.map(async (item) => {
        return await storage.createBudgetItem({
          projectId,
          category: item.category,
          item: item.category,
          estimatedCost: item.estimatedCost.toString(),
          actualCost: null,
          isPaid: false,
          notes: item.description,
          createdBy: req.userId,
          vendorId: null
        });
      }));

      // Create activity
      await storage.createActivity({
        projectId,
        userId: req.userId,
        action: 'generated AI budget',
        target: 'budget',
        details: { itemsCreated: budgetItems.length }
      });

      res.json({ budgetItems, breakdown: budgetBreakdown });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate budget" });
    }
  });

  app.post("/api/projects/:id/ai/recommendations", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getWeddingProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const tasks = await storage.getTasksByProjectId(projectId);
      const vendors = await storage.getVendorsByProjectId(projectId);
      const budgetItems = await storage.getBudgetItemsByProjectId(projectId);

      const recommendation = await generatePersonalizedRecommendation(
        {
          project,
          tasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          vendors: vendors.length,
          bookedVendors: vendors.filter(v => v.status === 'booked').length,
          budgetUsed: budgetItems.reduce((sum, item) => sum + (parseFloat(item.actualCost || '0')), 0),
          totalBudget: parseFloat(project.budget || '0'),
          daysUntilWedding: Math.ceil((project.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        },
        req.body.context || 'general planning progress'
      );

      res.json(recommendation);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Tasks
  app.get("/api/projects/:id/tasks", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const tasks = await storage.getTasksByProjectId(projectId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/projects/:id/tasks", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const taskData = insertTaskSchema.parse({
        ...req.body,
        projectId,
        createdBy: (req as any).userId
      });
      
      const task = await storage.createTask(taskData);
      
      // Create activity
      await storage.createActivity({
        projectId,
        userId: (req as any).userId,
        action: 'created task',
        target: 'task',
        targetId: task.id,
        details: { taskTitle: task.title }
      });

      websocketService?.notifyTaskUpdate(projectId, task, 'created', (req as any).userId);

      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = req.body;
      
      const task = await storage.updateTask(taskId, updates);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Create activity
      await storage.createActivity({
        projectId: task.projectId,
        userId: (req as any).userId,
        action: 'updated task',
        target: 'task',
        targetId: task.id,
        details: { taskTitle: task.title, updates }
      });

      websocketService?.notifyTaskUpdate(task.projectId, task, 'updated', (req as any).userId);

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.post("/api/tasks/:id/complete", requireAuth, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.completeTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Create activity
      await storage.createActivity({
        projectId: task.projectId,
        userId: (req as any).userId,
        action: 'completed task',
        target: 'task',
        targetId: task.id,
        details: { taskTitle: task.title }
      });

      websocketService?.notifyTaskUpdate(task.projectId, task, 'completed', (req as any).userId);

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  // Guests
  app.get("/api/projects/:id/guests", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const guests = await storage.getGuestsByProjectId(projectId);
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guests" });
    }
  });

  app.post("/api/projects/:id/guests", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const guestData = insertGuestSchema.parse({
        ...req.body,
        projectId,
        addedBy: (req as any).userId
      });
      
      const guest = await storage.createGuest(guestData);

      // Create activity
      await storage.createActivity({
        projectId,
        userId: (req as any).userId,
        action: 'added guest',
        target: 'guest',
        targetId: guest.id,
        details: { guestName: guest.name }
      });

      websocketService?.notifyGuestUpdate(projectId, guest, 'created', (req as any).userId);

      res.json(guest);
    } catch (error) {
      res.status(400).json({ message: "Invalid guest data" });
    }
  });

  // Vendors
  app.get("/api/projects/:id/vendors", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const vendors = await storage.getVendorsByProjectId(projectId);
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.post("/api/projects/:id/vendors", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const vendorData = insertVendorSchema.parse({
        ...req.body,
        projectId,
        addedBy: (req as any).userId
      });
      
      const vendor = await storage.createVendor(vendorData);

      // Create activity
      await storage.createActivity({
        projectId,
        userId: (req as any).userId,
        action: 'added vendor',
        target: 'vendor',
        targetId: vendor.id,
        details: { vendorName: vendor.name, category: vendor.category }
      });

      websocketService?.notifyVendorUpdate(projectId, vendor, 'created', (req as any).userId);

      res.json(vendor);
    } catch (error) {
      res.status(400).json({ message: "Invalid vendor data" });
    }
  });

  // Budget
  app.get("/api/projects/:id/budget", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const budgetItems = await storage.getBudgetItemsByProjectId(projectId);
      res.json(budgetItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budget" });
    }
  });

  app.post("/api/projects/:id/budget", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const budgetData = insertBudgetItemSchema.parse({
        ...req.body,
        projectId,
        createdBy: (req as any).userId
      });
      
      const budgetItem = await storage.createBudgetItem(budgetData);

      // Create activity
      await storage.createActivity({
        projectId,
        userId: (req as any).userId,
        action: 'added budget item',
        target: 'budget',
        targetId: budgetItem.id,
        details: { item: budgetItem.item, category: budgetItem.category }
      });

      websocketService?.notifyBudgetUpdate(projectId, budgetItem, 'created', (req as any).userId);

      res.json(budgetItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid budget data" });
    }
  });

  // Timeline events
  app.get("/api/projects/:id/timeline", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const events = await storage.getTimelineEventsByProjectId(projectId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timeline" });
    }
  });

  app.post("/api/projects/:id/timeline", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const eventData = insertTimelineEventSchema.parse({
        ...req.body,
        projectId,
        createdBy: (req as any).userId
      });
      
      const event = await storage.createTimelineEvent(eventData);

      // Create activity
      await storage.createActivity({
        projectId,
        userId: (req as any).userId,
        action: 'added timeline event',
        target: 'timeline',
        targetId: event.id,
        details: { eventTitle: event.title, date: event.date }
      });

      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid timeline event data" });
    }
  });

  // Inspiration
  app.get("/api/projects/:id/inspiration", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const items = await storage.getInspirationItemsByProjectId(projectId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspiration" });
    }
  });

  app.post("/api/projects/:id/inspiration", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const itemData = insertInspirationItemSchema.parse({
        ...req.body,
        projectId,
        addedBy: (req as any).userId
      });
      
      const item = await storage.createInspirationItem(itemData);

      // Create activity
      await storage.createActivity({
        projectId,
        userId: (req as any).userId,
        action: 'added inspiration',
        target: 'inspiration',
        targetId: item.id,
        details: { title: item.title, category: item.category }
      });

      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid inspiration data" });
    }
  });

  // Activities
  app.get("/api/projects/:id/activities", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const activities = await storage.getActivitiesByProjectId(projectId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Collaborators
  app.get("/api/projects/:id/collaborators", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const collaborators = await storage.getCollaboratorsByProjectId(projectId);
      res.json(collaborators);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collaborators" });
    }
  });

  app.post("/api/projects/:id/collaborators", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const collaboratorData = insertCollaboratorSchema.parse({
        ...req.body,
        projectId,
        invitedBy: (req as any).userId
      });
      
      const collaborator = await storage.addCollaborator(collaboratorData);
      res.json(collaborator);
    } catch (error) {
      res.status(400).json({ message: "Invalid collaborator data" });
    }
  });

  return httpServer;
}
