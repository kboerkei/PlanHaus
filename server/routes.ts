import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  insertUserSchema, insertWeddingProjectSchema, insertCollaboratorSchema,
  insertTaskSchema, insertGuestSchema, insertVendorSchema, insertVendorPaymentSchema,
  insertBudgetItemSchema, insertTimelineEventSchema, insertInspirationItemSchema, 
  insertActivitySchema, insertScheduleSchema, insertScheduleEventSchema, 
  insertIntakeDataSchema, users
} from "@shared/schema";
import { 
  generateWeddingTimeline, generateBudgetBreakdown, generateVendorSuggestions,
  generatePersonalizedRecommendation, analyzeWeddingTheme 
} from "./services/openai";
import { initializeWebSocketService, websocketService } from "./services/websocket";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";
// import pdfParse from "pdf-parse";

// Simple session storage for demo purposes
const sessions = new Map<string, { userId: number }>();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

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

  app.post("/api/auth/demo-login", async (req, res) => {
    try {
      const user = await storage.getUserByEmail("demo@example.com");
      
      if (!user) {
        return res.status(404).json({ message: "Demo user not found" });
      }

      const sessionId = generateSessionId();
      sessions.set(sessionId, { userId: user.id });

      res.json({ 
        user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar },
        sessionId 
      });
    } catch (error) {
      res.status(500).json({ message: "Demo login failed" });
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
        avatar: user.avatar,
        hasCompletedIntake: user.hasCompletedIntake || false
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // File upload endpoint for mood board images
  app.post("/api/upload", requireAuth, upload.array('images', 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const files = req.files as Express.Multer.File[];
      const urls = files.map(file => `/uploads/${file.filename}`);
      
      res.json({ urls });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // Pinterest board import endpoint
  app.post('/api/pinterest/import-board', requireAuth, async (req, res) => {
    try {
      const { boardUrl, category } = req.body;
      const userId = (req as any).userId;
      
      if (!boardUrl) {
        return res.status(400).json({ error: 'Pinterest board URL is required' });
      }

      // Validate Pinterest URL - simplified and more flexible
      const pinterestUrlPattern = /^https?:\/\/(www\.)?pinterest\.[a-z]{2,}/i;
      
      if (!pinterestUrlPattern.test(boardUrl)) {
        return res.status(400).json({ error: 'Invalid Pinterest board URL. Please provide a valid Pinterest board URL like: https://www.pinterest.com/username/board-name/' });
      }

      // Extract board information from URL
      const urlParts = boardUrl.split('/');
      const username = urlParts[3];
      const boardName = urlParts[4];

      // Get current user's projects
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      // Create a default project if none exists
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          name: "My Wedding",
          date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdBy: userId,
          budget: null,
          guestCount: null,
          theme: null,
          venue: null
        });
        projects = [defaultProject];
      }
      
      const currentProject = projects.find(p => p.name === "Emma & Jake's Wedding") || projects[0];
      
      // Note: This is a demo version - real Pinterest API would require authentication
      // For demonstration, we'll create sample inspiration items based on the board URL
      const samplePins = [
        {
          title: `Wedding Flowers from ${boardName}`,
          imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=400&fit=crop',
          description: `Beautiful wedding flower arrangements and bouquet ideas from Pinterest board: ${boardName}`,
          category: category || 'flowers'
        },
        {
          title: `Ceremony Inspiration from ${boardName}`,
          imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=400&fit=crop',
          description: `Ceremony decoration and setup ideas from Pinterest board: ${boardName}`,
          category: category || 'ceremony'
        },
        {
          title: `Reception Decor from ${boardName}`,
          imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop',
          description: `Reception decoration and table setting ideas from Pinterest board: ${boardName}`,
          category: category || 'reception'
        },
        {
          title: `Wedding Dress Ideas from ${boardName}`,
          imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0d30c4f732e?w=400&h=400&fit=crop',
          description: `Wedding dress and bridal fashion inspiration from Pinterest board: ${boardName}`,
          category: category || 'attire'
        },
        {
          title: `Wedding Cake from ${boardName}`,
          imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
          description: `Wedding cake design and decoration ideas from Pinterest board: ${boardName}`,
          category: category || 'cake'
        }
      ];

      // Create inspiration items for each pin
      const createdItems = [];
      for (const pin of samplePins) {
        const inspirationData = {
          projectId: currentProject.id,
          title: pin.title,
          imageUrl: pin.imageUrl,
          notes: pin.description,
          category: pin.category,
          tags: ['pinterest', boardName.replace(/\-/g, ' '), 'imported'],
          addedBy: userId
        };

        const result = await storage.createInspirationItem(inspirationData);
        createdItems.push(result);
      }

      // Create activity
      await storage.createActivity({
        projectId: currentProject.id,
        userId,
        action: 'imported Pinterest board',
        target: 'inspiration',
        details: { 
          boardName, 
          username, 
          url: boardUrl,
          imported: createdItems.length 
        }
      });

      res.json({
        success: true,
        message: `Successfully imported ${createdItems.length} inspiration items from Pinterest board "${boardName}"`,
        items: createdItems,
        boardInfo: {
          username,
          boardName: boardName.replace(/\-/g, ' '),
          url: boardUrl
        }
      });

    } catch (error) {
      console.error('Pinterest import error:', error);
      res.status(500).json({ error: 'Failed to import Pinterest board' });
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
      
      console.log('Task update request:', { taskId, updates });
      
      // Convert date strings to Date objects if present and valid
      if (updates.dueDate) {
        if (typeof updates.dueDate === 'string') {
          const parsedDate = new Date(updates.dueDate);
          if (!isNaN(parsedDate.getTime())) {
            updates.dueDate = parsedDate;
          } else {
            delete updates.dueDate; // Remove invalid date
          }
        }
      }
      if (updates.completedAt) {
        if (typeof updates.completedAt === 'string') {
          const parsedDate = new Date(updates.completedAt);
          if (!isNaN(parsedDate.getTime())) {
            updates.completedAt = parsedDate;
          } else {
            delete updates.completedAt; // Remove invalid date
          }
        }
      }
      
      // Validate the task exists first
      const existingTask = await storage.getTaskById(taskId);
      if (!existingTask) {
        console.log('Task not found:', taskId);
        return res.status(404).json({ message: "Task not found" });
      }
      
      const task = await storage.updateTask(taskId, updates);
      if (!task) {
        console.log('Update failed for task:', taskId);
        return res.status(404).json({ message: "Task not found" });
      }

      console.log('Task updated successfully:', task);

      // Create activity (optional, continue if fails)
      try {
        await storage.createActivity({
          projectId: task.projectId,
          userId: (req as any).userId,
          action: 'updated task',
          target: 'task',
          targetId: task.id,
          details: { taskTitle: task.title, updates }
        });
      } catch (activityError) {
        console.log('Activity creation failed:', activityError);
        // Continue - don't fail the whole request
      }

      websocketService?.notifyTaskUpdate(task.projectId, task, 'updated', (req as any).userId);

      res.json(task);
    } catch (error) {
      console.error('Task update error:', error);
      res.status(500).json({ message: "Failed to update task", error: error instanceof Error ? error.message : 'Unknown error' });
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

  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Get task first to get project info for activity logging
      const task = await storage.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const success = await storage.deleteTask(taskId);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Create activity
      await storage.createActivity({
        projectId: task.projectId,
        userId,
        action: 'deleted task',
        target: 'task',
        targetId: taskId,
        details: { taskTitle: task.title }
      });

      websocketService?.notifyTaskUpdate(task.projectId, task, 'deleted', userId);

      res.json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: "Failed to delete task" });
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

  // Add generic guests route for client compatibility
  app.get("/api/guests", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        return res.json([]);
      }
      
      const guests = await storage.getGuestsByProjectId(projects[0].id);
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guests" });
    }
  });

  // Add generic guests POST route for client compatibility
  app.post("/api/guests", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          name: "My Wedding",
          description: "Wedding planning project",
          date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdBy: userId
        });
        projects = [defaultProject];
      }
      
      const guestData = insertGuestSchema.parse({
        ...req.body,
        projectId: projects[0].id,
        addedBy: userId
      });
      
      const guest = await storage.createGuest(guestData);

      // Create activity
      await storage.createActivity({
        projectId: projects[0].id,
        userId,
        action: 'added guest',
        target: 'guest',
        targetId: guest.id,
        details: { guestName: guest.name, rsvpStatus: guest.rsvpStatus }
      });

      websocketService?.notifyGuestUpdate(projects[0].id, guest, 'created', userId);

      res.json(guest);
    } catch (error) {
      res.status(400).json({ message: "Invalid guest data" });
    }
  });

  app.post("/api/projects/:id/guests", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // Clean empty strings to null for optional fields
      const cleanedBody = {
        ...req.body,
        email: req.body.email || null,
        phone: req.body.phone || null,
        address: req.body.address || null,
        mealPreference: req.body.mealPreference || null,
        hotel: req.body.hotel || null,
        hotelAddress: req.body.hotelAddress || null,
        notes: req.body.notes || null,
        checkInDate: req.body.checkInDate || null,
        checkOutDate: req.body.checkOutDate || null
      };
      
      const guestData = insertGuestSchema.parse({
        ...cleanedBody,
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
      console.error('Guest creation error:', error);
      res.status(400).json({ message: "Invalid guest data", error: error.message });
    }
  });

  // Update guest endpoint
  app.patch("/api/guests/:id", requireAuth, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Validate partial guest data
      const updateData = {
        ...req.body,
        // Convert date strings to Date objects if provided
        ...(req.body.checkInDate && { checkInDate: new Date(req.body.checkInDate) }),
        ...(req.body.checkOutDate && { checkOutDate: new Date(req.body.checkOutDate) })
      };
      
      const updatedGuest = await storage.updateGuest(guestId, updateData);
      
      if (!updatedGuest) {
        return res.status(404).json({ message: "Guest not found" });
      }

      // Create activity
      await storage.createActivity({
        projectId: updatedGuest.projectId,
        userId,
        action: 'updated guest',
        target: 'guest',
        targetId: updatedGuest.id,
        details: { guestName: updatedGuest.name }
      });

      websocketService?.notifyGuestUpdate(updatedGuest.projectId, updatedGuest, 'updated', userId);

      res.json(updatedGuest);
    } catch (error) {
      console.error('Error updating guest:', error);
      res.status(400).json({ message: "Failed to update guest" });
    }
  });

  // Update guest RSVP status endpoint
  app.patch("/api/guests/:id/rsvp", requireAuth, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const { rsvpStatus } = req.body;
      const userId = (req as any).userId;
      
      const updatedGuest = await storage.updateGuestRsvp(guestId, rsvpStatus);
      
      if (!updatedGuest) {
        return res.status(404).json({ message: "Guest not found" });
      }

      // Create activity
      await storage.createActivity({
        projectId: updatedGuest.projectId,
        userId,
        action: 'updated RSVP',
        target: 'guest',
        targetId: updatedGuest.id,
        details: { guestName: updatedGuest.name, rsvpStatus }
      });

      websocketService?.notifyGuestUpdate(updatedGuest.projectId, updatedGuest, 'updated', userId);

      res.json(updatedGuest);
    } catch (error) {
      console.error('Error updating RSVP:', error);
      res.status(400).json({ message: "Failed to update RSVP status" });
    }
  });

  // Delete guest endpoint
  app.delete("/api/guests/:id", requireAuth, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Get guest first by checking all user's projects
      const projects = await storage.getWeddingProjectsByUserId(userId);
      let guest = null;
      
      for (const project of projects) {
        const guests = await storage.getGuestsByProjectId(project.id);
        guest = guests.find(g => g.id === guestId);
        if (guest) break;
      }
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }

      const success = await storage.deleteGuest(guestId);
      
      if (!success) {
        return res.status(404).json({ message: "Guest not found" });
      }

      // Create activity
      await storage.createActivity({
        projectId: guest.projectId,
        userId,
        action: 'deleted guest',
        target: 'guest',
        targetId: guestId,
        details: { guestName: guest.name }
      });

      websocketService?.notifyGuestUpdate(guest.projectId, guest, 'deleted', userId);

      res.json({ success: true, message: "Guest deleted successfully" });
    } catch (error) {
      console.error('Error deleting guest:', error);
      res.status(500).json({ message: "Failed to delete guest" });
    }
  });

  // Guest import endpoint
  app.post("/api/guests/import", requireAuth, upload.single('file'), async (req, res) => {
    try {
      const userId = (req as any).userId;
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      // Create a default project if none exists
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          name: "My Wedding",
          date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdBy: userId,
          budget: null,
          guestCount: null,
          theme: null,
          venue: null
        });
        projects = [defaultProject];
      }

      const projectId = projects[0].id;
      const filePath = req.file.path;
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      
      let guestData: any[] = [];

      if (fileExtension === '.pdf') {
        // PDF parsing temporarily disabled - use Excel format for now
        return res.status(400).json({ message: "PDF import temporarily unavailable. Please use Excel format." });
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        // Parse Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        guestData = jsonData.map((row: any) => ({
          name: row['Name'] || row['name'] || '',
          email: row['Email'] || row['email'] || '',
          phone: row['Phone'] || row['phone'] || '',
          address: row['Address'] || row['address'] || '',
          group: row['Group'] || row['group'] || 'Other',
          hotel: row['Hotel'] || row['hotel'] || '',
          checkInDate: row['Check-in Date'] || row['check_in_date'] || null,
          checkOutDate: row['Check-out Date'] || row['check_out_date'] || null,
          notes: row['Notes'] || row['notes'] || ''
        }));
      } else {
        return res.status(400).json({ message: "Unsupported file format" });
      }

      // Create guests in database
      const createdGuests = [];
      for (const guestInfo of guestData) {
        if (guestInfo.name && guestInfo.name.trim().length > 0) {
          try {
            const guest = await storage.createGuest({
              ...guestInfo,
              projectId,
              addedBy: userId,
              rsvpStatus: 'pending',
              plusOne: false,
              checkInDate: guestInfo.checkInDate ? new Date(guestInfo.checkInDate) : null,
              checkOutDate: guestInfo.checkOutDate ? new Date(guestInfo.checkOutDate) : null
            });
            createdGuests.push(guest);
          } catch (error) {
            console.error('Error creating guest:', error);
          }
        }
      }

      // Create activity
      await storage.createActivity({
        projectId,
        userId,
        action: 'imported guests',
        target: 'guest',
        details: { imported: createdGuests.length }
      });

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({ 
        imported: createdGuests.length, 
        guests: createdGuests 
      });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({ message: "Failed to import guests" });
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

  // Add generic vendors route for client compatibility
  app.get("/api/vendors", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        return res.json([]);
      }
      
      const vendors = await storage.getVendorsByProjectId(projects[0].id);
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  // Add missing collaborators endpoint
  app.get("/api/collaborators", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        return res.json([]);
      }
      
      const collaborators = await storage.getCollaboratorsByProjectId(projects[0].id);
      res.json(collaborators);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collaborators" });
    }
  });

  // Add missing task-notes endpoint
  app.get("/api/task-notes", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        return res.json([]);
      }
      
      // For now, return empty array as task notes functionality isn't fully implemented
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task notes" });
    }
  });

  // Add task notes creation endpoint
  app.post("/api/task-notes", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { taskId, content } = req.body;
      
      // For now, return a success response as the notes functionality isn't fully implemented
      const note = {
        id: Date.now(),
        taskId,
        content,
        authorId: userId,
        createdAt: new Date().toISOString()
      };
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to create task note" });
    }
  });

  app.post("/api/vendors", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          name: "My Wedding",
          description: "Wedding planning project",
          date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdBy: userId
        });
        projects = [defaultProject];
      }
      
      const vendorData = {
        ...req.body,
        projectId: projects[0].id,
        addedBy: userId
      };
      
      const vendor = await storage.createVendor(vendorData);
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to create vendor" });
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

  // Vendor contract upload
  app.post("/api/vendors/:id/contract", requireAuth, upload.single('contract'), async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      if (!req.file) {
        return res.status(400).json({ message: "No contract file uploaded" });
      }

      const contractUrl = `/uploads/${req.file.filename}`;
      const vendor = await storage.updateVendor(vendorId, { contractUrl });
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      res.json({ contractUrl, vendor });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload contract" });
    }
  });

  // Mark vendor contract as signed
  app.patch("/api/vendors/:id/contract/sign", requireAuth, async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const { signed } = req.body;
      
      const vendor = await storage.updateVendor(vendorId, { 
        contractSigned: signed,
        contractSignedDate: signed ? new Date() : null
      });
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to update contract status" });
    }
  });

  // Vendor Payments
  app.get("/api/vendors/:id/payments", requireAuth, async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const payments = await storage.getVendorPaymentsByVendorId(vendorId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor payments" });
    }
  });

  app.post("/api/vendors/:id/payments", requireAuth, async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const paymentData = insertVendorPaymentSchema.parse({
        ...req.body,
        vendorId,
        createdBy: (req as any).userId
      });
      
      const payment = await storage.createVendorPayment(paymentData);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  app.patch("/api/vendor-payments/:id/paid", requireAuth, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const payment = await storage.markVendorPaymentPaid(paymentId);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark payment as paid" });
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

  // Add generic budget items route for client compatibility
  app.get("/api/budget-items", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        return res.json([]);
      }
      
      const budgetItems = await storage.getBudgetItemsByProjectId(projects[0].id);
      res.json(budgetItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budget items" });
    }
  });

  // Add missing budget items POST route
  app.post("/api/budget-items", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          name: "My Wedding",
          date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdBy: userId,
          budget: null,
          guestCount: null,
          theme: null,
          venue: null
        });
        projects = [defaultProject];
      }
      

      
      const budgetData = insertBudgetItemSchema.parse({
        ...req.body,
        projectId: projects[0].id,
        createdBy: userId
      });
      
      const budgetItem = await storage.createBudgetItem(budgetData);
      
      // Create activity
      await storage.createActivity({
        projectId: projects[0].id,
        userId,
        action: 'added budget item',
        target: 'budget',
        targetId: budgetItem.id,
        details: { item: budgetItem.item, category: budgetItem.category }
      });

      res.json(budgetItem);
    } catch (error) {
      console.error('Budget creation error:', error);
      res.status(500).json({ message: "Failed to create budget item" });
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

  // Update budget item
  app.patch("/api/budget-items/:id", requireAuth, async (req, res) => {
    try {
      const budgetItemId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Get budget item first by checking all user's projects
      const projects = await storage.getWeddingProjectsByUserId(userId);
      let budgetItem = null;
      
      for (const project of projects) {
        const budgetItems = await storage.getBudgetItemsByProjectId(project.id);
        budgetItem = budgetItems.find(b => b.id === budgetItemId);
        if (budgetItem) break;
      }
      
      if (!budgetItem) {
        return res.status(404).json({ message: "Budget item not found" });
      }

      const updateData = req.body;
      const updatedItem = await storage.updateBudgetItem(budgetItemId, updateData);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Budget item not found" });
      }

      // Create activity
      await storage.createActivity({
        projectId: budgetItem.projectId,
        userId,
        action: 'updated budget item',
        target: 'budget',
        targetId: budgetItemId,
        details: { item: budgetItem.item, category: budgetItem.category }
      });

      websocketService?.notifyBudgetUpdate(budgetItem.projectId, updatedItem, 'updated', userId);

      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating budget item:', error);
      res.status(500).json({ message: "Failed to update budget item" });
    }
  });

  // Delete budget item endpoint
  app.delete("/api/budget-items/:id", requireAuth, async (req, res) => {
    try {
      const budgetItemId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Get budget item first by checking all user's projects
      const projects = await storage.getWeddingProjectsByUserId(userId);
      let budgetItem = null;
      
      for (const project of projects) {
        const budgetItems = await storage.getBudgetItemsByProjectId(project.id);
        budgetItem = budgetItems.find(b => b.id === budgetItemId);
        if (budgetItem) break;
      }
      
      if (!budgetItem) {
        return res.status(404).json({ message: "Budget item not found" });
      }

      const success = await storage.deleteBudgetItem(budgetItemId);
      
      if (!success) {
        return res.status(404).json({ message: "Budget item not found" });
      }

      // Create activity
      await storage.createActivity({
        projectId: budgetItem.projectId,
        userId,
        action: 'deleted budget item',
        target: 'budget',
        targetId: budgetItemId,
        details: { item: budgetItem.item, category: budgetItem.category }
      });

      websocketService?.notifyBudgetUpdate(budgetItem.projectId, budgetItem, 'deleted', userId);

      res.json({ success: true, message: "Budget item deleted successfully" });
    } catch (error) {
      console.error('Error deleting budget item:', error);
      res.status(500).json({ message: "Failed to delete budget item" });
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

  // Add generic inspiration route for client compatibility
  app.get("/api/inspiration", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        return res.json([]);
      }
      
      const items = await storage.getInspirationItemsByProjectId(projects[0].id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspiration" });
    }
  });

  app.post("/api/projects/:id/inspiration", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      // Convert tags string to array if provided, handle empty/null values
      const processedBody = { ...req.body };
      if (processedBody.tags && typeof processedBody.tags === 'string' && processedBody.tags.trim()) {
        processedBody.tags = processedBody.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else {
        processedBody.tags = null;
      }
      
      const itemData = insertInspirationItemSchema.parse({
        ...processedBody,
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
      console.error('Inspiration creation error (project-specific):', error);
      res.status(400).json({ message: "Failed to add inspiration item", error: error.message });
    }
  });

  // Add generic inspiration POST route for client compatibility
  app.post("/api/inspiration", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          name: "My Wedding",
          description: "Wedding planning project",
          date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdBy: userId
        });
        projects = [defaultProject];
      }
      
      // Convert tags string to array if provided, handle empty/null values
      const processedBody = { ...req.body };
      if (processedBody.tags && typeof processedBody.tags === 'string' && processedBody.tags.trim()) {
        processedBody.tags = processedBody.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else {
        processedBody.tags = null;
      }
      
      const itemData = insertInspirationItemSchema.parse({
        ...processedBody,
        projectId: projects[0].id,
        addedBy: userId
      });
      
      const item = await storage.createInspirationItem(itemData);

      // Create activity
      await storage.createActivity({
        projectId: projects[0].id,
        userId,
        action: 'added inspiration',
        target: 'inspiration',
        targetId: item.id,
        details: { title: item.title, category: item.category }
      });

      res.json(item);
    } catch (error) {
      console.error('Inspiration creation error (generic):', error);
      res.status(400).json({ message: "Failed to add inspiration item", error: error.message });
    }
  });

  // Delete inspiration item endpoint
  app.delete("/api/inspiration/:id", requireAuth, async (req, res) => {
    try {
      const inspirationId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Get inspiration item first by checking all user's projects
      const projects = await storage.getWeddingProjectsByUserId(userId);
      let inspirationItem = null;
      
      for (const project of projects) {
        const items = await storage.getInspirationItemsByProjectId(project.id);
        inspirationItem = items.find(i => i.id === inspirationId);
        if (inspirationItem) break;
      }
      
      if (!inspirationItem) {
        return res.status(404).json({ message: "Inspiration item not found" });
      }

      const success = await storage.deleteInspirationItem(inspirationId);
      
      if (!success) {
        return res.status(404).json({ message: "Inspiration item not found" });
      }

      // Create activity
      await storage.createActivity({
        projectId: inspirationItem.projectId,
        userId,
        action: 'deleted inspiration',
        target: 'inspiration',
        targetId: inspirationId,
        details: { title: inspirationItem.title, category: inspirationItem.category }
      });

      res.json({ success: true, message: "Inspiration item deleted successfully" });
    } catch (error) {
      console.error('Error deleting inspiration item:', error);
      res.status(500).json({ message: "Failed to delete inspiration item" });
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

  // AI Chat endpoint
  app.post("/api/ai/chat", requireAuth, async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get user's wedding project for context
      const userProjects = await storage.getWeddingProjectsByUserId(req.userId);
      const currentProject = userProjects[0]; // Use first project for context
      
      let contextPrompt = "You are a helpful AI wedding planning assistant. ";
      if (currentProject) {
        contextPrompt += `The user is planning a wedding called "${currentProject.name}" scheduled for ${currentProject.date}. `;
        if (currentProject.theme) contextPrompt += `The theme is ${currentProject.theme}. `;
        if (currentProject.venue) contextPrompt += `The venue is ${currentProject.venue}. `;
        if (currentProject.budget) contextPrompt += `Their budget is $${currentProject.budget}. `;
        if (currentProject.guestCount) contextPrompt += `They're expecting ${currentProject.guestCount} guests. `;
      }
      contextPrompt += "Provide helpful, specific, and actionable wedding planning advice. Keep responses concise but informative.";

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            { role: 'system', content: contextPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "I'm here to help with your wedding planning!";

      res.json({ response: aiResponse });
    } catch (error) {
      console.error('AI Chat error:', error);
      
      // Handle OpenAI rate limit (429) or quota exceeded
      if (error.message && error.message.includes('429')) {
        return res.json({ 
          response: "I'm currently experiencing high demand and have reached my usage limits for OpenAI services. However, I can still help you with wedding planning advice! Here are some general recommendations based on typical wedding timelines:\n\n• **12 months before**: Book your venue and start vendor research\n• **9 months before**: Send save-the-dates and book photographer\n• **6 months before**: Order invitations and finalize guest list\n• **3 months before**: Final fittings and confirm all details\n\nWhat specific aspect of your wedding planning would you like guidance on?"
        });
      }
      
      res.status(500).json({ 
        error: "Sorry, I'm having trouble right now. Please try again.",
        response: "I'm here to help with your wedding planning! Could you tell me more about what you'd like assistance with?"
      });
    }
  });

  // Schedule routes
  app.get("/api/projects/:id/schedules", requireAuth, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const schedules = await storage.getSchedulesByProjectId(projectId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  app.post("/api/projects/:id/schedules", requireAuth, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const scheduleData = insertScheduleSchema.parse({
        ...req.body,
        projectId,
        createdBy: req.userId
      });
      
      const schedule = await storage.createSchedule(scheduleData);
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ message: "Invalid schedule data" });
    }
  });

  app.get("/api/schedules/:id/events", requireAuth, async (req: any, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const events = await storage.getScheduleEventsByScheduleId(scheduleId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schedule events" });
    }
  });

  app.get("/api/schedule-events/:scheduleId", requireAuth, async (req: any, res) => {
    try {
      const scheduleId = parseInt(req.params.scheduleId);
      const events = await storage.getScheduleEventsByScheduleId(scheduleId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schedule events" });
    }
  });

  app.post("/api/schedule-events", requireAuth, async (req: any, res) => {
    try {
      const eventData = {
        ...req.body,
        createdBy: req.userId
      };
      
      console.log('Creating schedule event:', eventData);
      
      const event = await storage.createScheduleEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error('Schedule event creation error:', error);
      res.status(500).json({ message: "Failed to create schedule event" });
    }
  });

  app.post("/api/schedules/:id/events", requireAuth, async (req: any, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      
      // Get the schedule to find the projectId
      const currentSchedule = await storage.getScheduleById(scheduleId);
      
      if (!currentSchedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      // Parse dates properly for schedule events
      const eventData = {
        ...req.body,
        scheduleId,
        projectId: currentSchedule.projectId,
        createdBy: req.userId,
        startTime: new Date(`2000-01-01T${req.body.startTime}:00`),
        endTime: req.body.endTime ? new Date(`2000-01-01T${req.body.endTime}:00`) : null,
      };
      
      const validatedData = insertScheduleEventSchema.parse(eventData);
      const event = await storage.createScheduleEvent(validatedData);
      res.json(event);
    } catch (error) {
      console.error('Schedule event creation error:', error);
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  // Update schedule event endpoint
  app.put("/api/schedule-events/:id", requireAuth, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      // Parse dates properly for schedule events
      const updateData = {
        ...req.body,
        startTime: new Date(`2000-01-01T${req.body.startTime}:00`),
        endTime: req.body.endTime ? new Date(`2000-01-01T${req.body.endTime}:00`) : null,
      };
      
      const event = await storage.updateScheduleEvent(eventId, updateData);
      
      if (!event) {
        return res.status(404).json({ message: "Schedule event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error('Schedule event update error:', error);
      res.status(400).json({ message: "Failed to update schedule event" });
    }
  });

  // Delete schedule event endpoint
  app.delete("/api/schedule-events/:id", requireAuth, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      const success = await storage.deleteScheduleEvent(eventId);
      
      if (!success) {
        return res.status(404).json({ message: "Schedule event not found" });
      }
      
      res.json({ message: "Schedule event deleted successfully" });
    } catch (error) {
      console.error('Schedule event deletion error:', error);
      res.status(500).json({ message: "Failed to delete schedule event" });
    }
  });

  // Intake API
  app.post("/api/intake", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      console.log('Intake API - User ID:', userId);
      console.log('Intake API - Request body:', JSON.stringify(req.body, null, 2));
      
      // Transform the request body to handle date conversion and clean empty strings
      const requestData = {
        ...req.body,
        userId,
        weddingDate: req.body.weddingDate ? new Date(req.body.weddingDate) : null,
        totalBudget: req.body.totalBudget === "" ? null : req.body.totalBudget,
        estimatedGuests: req.body.estimatedGuests === "" ? null : req.body.estimatedGuests,
        // Clean empty string arrays and objects
        mustHaveElements: Array.isArray(req.body.mustHaveElements) && req.body.mustHaveElements.length === 0 ? null : req.body.mustHaveElements,
        pinterestBoards: Array.isArray(req.body.pinterestBoards) && req.body.pinterestBoards.length === 0 ? null : req.body.pinterestBoards,
        topPriorities: Array.isArray(req.body.topPriorities) && req.body.topPriorities.length === 0 ? null : req.body.topPriorities,
        vips: Array.isArray(req.body.vips) && req.body.vips.length === 1 && req.body.vips[0].name === "" ? null : req.body.vips,
        weddingParty: Array.isArray(req.body.weddingParty) && req.body.weddingParty.length === 1 && req.body.weddingParty[0].name === "" ? null : req.body.weddingParty
      };
      
      // Flexible validation for partial form submissions (auto-save)
      const intakeData = insertIntakeDataSchema.parse(requestData);
      
      console.log('Intake API - Parsed data:', JSON.stringify(intakeData, null, 2));
      
      // Save or update intake data
      let intake = await storage.getIntakeDataByUserId(userId);
      if (intake) {
        // Update existing intake data
        console.log('Updating existing intake data for user:', userId);
        intake = await storage.updateIntakeData(userId, intakeData);
      } else {
        // Create new intake data
        console.log('Creating new intake data for user:', userId);
        intake = await storage.createIntakeData(intakeData);
      }
      
      if (!intake) {
        throw new Error('Failed to save intake data');
      }
      
      // Mark user as having completed intake
      await storage.markUserIntakeComplete(userId);
      
      // Get user's projects and update the active one (the one dashboard displays)
      let projects = await storage.getWeddingProjectsByUserId(userId);
      let project;
      
      if (projects.length === 0) {
        // Create new project if none exist
        const projectData = {
          name: intake.partner1FirstName && intake.partner2FirstName 
            ? `${intake.partner1FirstName} & ${intake.partner2FirstName}'s Wedding`
            : intake.partner1FirstName 
            ? `${intake.partner1FirstName}'s Wedding`
            : 'Our Wedding',
          date: intake.weddingDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdBy: userId,
          budget: intake.totalBudget ? parseFloat(intake.totalBudget) : null,
          guestCount: intake.estimatedGuests || null,
          theme: intake.overallVibe || null,
          venue: intake.ceremonyLocation || null,
        };
        project = await storage.createWeddingProject(projectData);
      } else {
        // Find the active project (dashboard looks for "Emma & Jake's Wedding" first, then falls back to first project)
        project = projects.find(p => p.name === "Emma & Jake's Wedding") || projects[0];
        const updatedProjectData = {
          name: intake.partner1FirstName && intake.partner2FirstName 
            ? `${intake.partner1FirstName} & ${intake.partner2FirstName}'s Wedding`
            : intake.partner1FirstName 
            ? `${intake.partner1FirstName}'s Wedding`
            : project.name,
          date: intake.weddingDate || project.date,
          budget: intake.totalBudget ? parseFloat(intake.totalBudget) : project.budget,
          guestCount: intake.estimatedGuests || project.guestCount,
          theme: intake.overallVibe || project.theme,
          venue: intake.ceremonyLocation || project.venue,
        };
        project = await storage.updateWeddingProject(project.id, updatedProjectData);
        console.log('Updated project:', project.id, 'with name:', updatedProjectData.name, 'from intake form');
      }
      
      // Add VIP guests and wedding party to guest list (only these specific people)
      if (intake.vips && Array.isArray(intake.vips)) {
        for (const vip of intake.vips) {
          if (vip.name && vip.name.trim()) {
            try {
              const guestData = {
                projectId: project.id,
                firstName: vip.name.split(' ')[0] || vip.name,
                lastName: vip.name.split(' ').slice(1).join(' ') || '',
                email: '',
                phone: '',
                address: '',
                rsvpStatus: 'pending' as const,
                guestType: 'vip' as const,
                dietaryRestrictions: '',
                notes: `VIP Guest - ${vip.role || 'Important person'}`,
                plusOneAllowed: false,
                hotelInfo: '',
                addedBy: userId
              };
              await storage.createGuest(guestData);
            } catch (guestError) {
              console.error('Error adding VIP guest:', guestError);
            }
          }
        }
      }

      if (intake.weddingParty && Array.isArray(intake.weddingParty)) {
        for (const member of intake.weddingParty) {
          if (member.name && member.name.trim()) {
            try {
              const guestData = {
                projectId: project.id,
                firstName: member.name.split(' ')[0] || member.name,
                lastName: member.name.split(' ').slice(1).join(' ') || '',
                email: '',
                phone: '',
                address: '',
                rsvpStatus: 'confirmed' as const,
                guestType: 'wedding_party' as const,
                dietaryRestrictions: '',
                notes: `Wedding Party - ${member.role || 'Wedding party member'}`,
                plusOneAllowed: false,
                hotelInfo: '',
                addedBy: userId
              };
              await storage.createGuest(guestData);
            } catch (guestError) {
              console.error('Error adding wedding party guest:', guestError);
            }
          }
        }
      }

      // Add inspiration items from style vision (colors, vibe, Pinterest boards)
      const inspirationItems = [];
      
      if (intake.overallVibe && intake.overallVibe.trim()) {
        inspirationItems.push({
          type: 'text',
          title: 'Overall Wedding Vibe',
          description: intake.overallVibe,
          imageUrl: null,
          sourceUrl: null,
          notes: 'From intake form - overall vision and style preference'
        });
      }

      if (intake.colorPalette && intake.colorPalette.trim()) {
        inspirationItems.push({
          type: 'text',
          title: 'Color Palette',
          description: intake.colorPalette,
          imageUrl: null,
          sourceUrl: null,
          notes: 'From intake form - preferred wedding colors'
        });
      }

      if (intake.pinterestBoards && Array.isArray(intake.pinterestBoards)) {
        for (const boardUrl of intake.pinterestBoards) {
          if (boardUrl && boardUrl.trim()) {
            inspirationItems.push({
              type: 'pinterest',
              title: 'Pinterest Inspiration Board',
              description: 'Inspiration board shared during intake',
              imageUrl: null,
              sourceUrl: boardUrl,
              notes: 'Pinterest board from intake form'
            });
          }
        }
      }

      // Create inspiration items
      for (const item of inspirationItems) {
        try {
          const inspirationData = {
            projectId: project.id,
            type: item.type,
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            sourceUrl: item.sourceUrl,
            notes: item.notes,
            createdBy: userId
          };
          await storage.createInspirationItem(inspirationData);
        } catch (inspirationError) {
          console.error('Error creating inspiration item:', inspirationError);
        }
      }

      // Create initial timeline milestones if wedding date provided
      if (intake.weddingDate) {
        const weddingDate = new Date(intake.weddingDate);
        const timelineTasks = [
          { 
            title: 'Book Ceremony Venue', 
            description: 'Research and secure the venue for your wedding ceremony. Consider capacity, location, and availability.',
            weeksBeforeWedding: 52, 
            priority: 'high' as const 
          },
          { 
            title: 'Book Reception Venue', 
            description: 'Find and reserve the perfect location for your wedding reception. Ensure it matches your guest count and style.',
            weeksBeforeWedding: 52, 
            priority: 'high' as const 
          },
          { 
            title: 'Send Save the Dates', 
            description: 'Design and mail save the date cards to give guests advance notice of your wedding date.',
            weeksBeforeWedding: 24, 
            priority: 'medium' as const 
          },
          { 
            title: 'Order Wedding Dress', 
            description: 'Shop for and order your wedding dress, allowing time for alterations and any needed adjustments.',
            weeksBeforeWedding: 20, 
            priority: 'high' as const 
          },
          { 
            title: 'Book Photographer', 
            description: 'Research and hire a photographer to capture your special day. Review portfolios and meet with potential photographers.',
            weeksBeforeWedding: 16, 
            priority: 'high' as const 
          },
          { 
            title: 'Send Wedding Invitations', 
            description: 'Design, print, and mail your wedding invitations with RSVP details to all guests.',
            weeksBeforeWedding: 8, 
            priority: 'high' as const 
          },
          { 
            title: 'Confirm Final Guest Count', 
            description: 'Collect all RSVPs and provide final headcount to caterer and venue for seating arrangements.',
            weeksBeforeWedding: 2, 
            priority: 'high' as const 
          },
          { 
            title: 'Wedding Rehearsal', 
            description: 'Conduct rehearsal with wedding party to practice ceremony timing and positioning.',
            weeksBeforeWedding: 0, 
            priority: 'high' as const 
          }
        ];

        for (const task of timelineTasks) {
          try {
            const dueDate = new Date(weddingDate);
            dueDate.setDate(dueDate.getDate() - (task.weeksBeforeWedding * 7));
            
            // Create timeline event
            const timelineData = {
              projectId: project.id,
              title: task.title,
              description: task.description,
              date: dueDate,
              type: 'milestone',
              createdBy: userId
            };
            await storage.createTimelineEvent(timelineData);

            // Also create corresponding task
            const taskData = {
              projectId: project.id,
              title: task.title,
              description: task.description,
              category: 'Planning',
              priority: task.priority,
              status: 'pending' as const,
              dueDate: dueDate,
              createdBy: userId,
              assignedTo: null
            };
            await storage.createTask(taskData);
          } catch (timelineError) {
            console.error('Error creating timeline event:', timelineError);
          }
        }
      }
      
      res.json(intake);
    } catch (error) {
      console.error("Error saving intake data:", error);
      console.error("Error details:", error.message);
      if (error.issues) {
        console.error("Validation issues:", error.issues);
      }
      res.status(400).json({ 
        message: "Invalid intake data",
        error: error.message,
        details: error.issues || null
      });
    }
  });

  app.get("/api/intake", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const intake = await storage.getIntakeDataByUserId(userId);
      res.json(intake);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch intake data" });
    }
  });

  app.patch("/api/intake", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const updates = req.body;
      const intake = await storage.updateIntakeData(userId, updates);
      
      if (!intake) {
        return res.status(404).json({ message: "Intake data not found" });
      }
      
      res.json(intake);
    } catch (error) {
      res.status(500).json({ message: "Failed to update intake data" });
    }
  });

  // Wedding projects API
  app.get("/api/wedding-projects", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const projects = await storage.getWeddingProjectsByUserId(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wedding projects" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        return res.json({
          tasks: { completed: 0, total: 0, pending: 0, overdue: 0, upcoming: 0 },
          budget: { spent: 0, total: 0 },
          guests: { confirmed: 0, pending: 0, declined: 0, total: 0 },
          vendors: { booked: 0, contacted: 0, quoted: 0, total: 0 },
          weddingDate: null,
          guestCount: 0,
          nextMilestone: null
        });
      }

      // Use Emma & Jake's Wedding project as the current active project
      const currentProject = projects.find(p => p.name === "Emma & Jake's Wedding") || projects[0];
      const projectId = currentProject.id;
      
      // Get ALL task statistics across all user projects for comprehensive view
      let allTasks = [];
      for (const project of projects) {
        const projectTasks = await storage.getTasksByProjectId(project.id);
        allTasks = allTasks.concat(projectTasks);
      }
      const taskStats = {
        completed: allTasks.filter(t => t.status === 'completed').length,
        total: allTasks.length,
        pending: allTasks.filter(t => t.status === 'pending').length,
        overdue: allTasks.filter(t => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          const today = new Date();
          return dueDate < today && t.status !== 'completed';
        }).length,
        upcoming: allTasks.filter(t => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          const today = new Date();
          const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          return dueDate >= today && dueDate <= nextWeek && t.status !== 'completed';
        }).length
      };

      // Get budget statistics
      const budgetItems = await storage.getBudgetItemsByProjectId(projectId);
      const budgetStats = {
        spent: budgetItems.reduce((sum, item) => sum + (parseFloat(item.actualCost || '0')), 0),
        total: budgetItems.reduce((sum, item) => sum + (parseFloat(item.estimatedCost || '0')), 0)
      };

      // Get guest statistics - include both "confirmed" and "attending" as responded
      const guests = await storage.getGuestsByProjectId(projectId);
      const guestStats = {
        confirmed: guests.filter(g => g.rsvpStatus === 'confirmed' || g.rsvpStatus === 'attending').length,
        pending: guests.filter(g => g.rsvpStatus === 'pending' || !g.rsvpStatus).length,
        declined: guests.filter(g => g.rsvpStatus === 'declined').length,
        total: guests.length
      };

      // Get vendor statistics
      const vendors = await storage.getVendorsByProjectId(projectId);
      const vendorStats = {
        booked: vendors.filter(v => v.status === 'booked').length,
        contacted: vendors.filter(v => v.status === 'contacted').length,
        quoted: vendors.filter(v => v.status === 'quoted').length,
        total: vendors.length
      };

      // Find next milestone (upcoming task with highest priority)
      const upcomingTasks = allTasks
        .filter(t => t.status !== 'completed' && t.dueDate)
        .sort((a, b) => {
          const dateA = new Date(a.dueDate!);
          const dateB = new Date(b.dueDate!);
          return dateA.getTime() - dateB.getTime();
        });

      const nextMilestone = upcomingTasks.length > 0 ? {
        title: upcomingTasks[0].title,
        date: upcomingTasks[0].dueDate,
        progress: taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0
      } : null;

      res.json({
        tasks: taskStats,
        budget: budgetStats,
        guests: guestStats,
        vendors: vendorStats,
        weddingDate: currentProject.date,
        guestCount: currentProject.guestCount,
        nextMilestone
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Quick actions endpoint (smart actions)
  app.get("/api/dashboard/quick-actions", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        return res.json([
          {
            id: 'get-started',
            title: 'Start Planning',
            description: 'Complete your wedding intake form to get personalized recommendations',
            category: 'getting_started',
            urgent: false,
            icon: 'sparkles',
            color: 'bg-blush/10 text-blush',
            action: '/intake'
          }
        ]);
      }

      const projectId = projects[0].id;
      const project = projects[0];
      
      // Get current data to determine urgent actions
      const tasks = await storage.getTasksByProjectId(projectId);
      const guests = await storage.getGuestsByProjectId(projectId);
      const vendors = await storage.getVendorsByProjectId(projectId);
      const budgetItems = await storage.getBudgetItemsByProjectId(projectId);

      const actions = [];
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Check for overdue tasks
      const overdueTasks = tasks.filter(t => {
        if (!t.dueDate || t.status === 'completed') return false;
        const dueDate = new Date(t.dueDate);
        return dueDate < now;
      });

      if (overdueTasks.length > 0) {
        actions.push({
          id: 'overdue-tasks',
          title: 'Review Overdue Tasks',
          description: `${overdueTasks.length} task${overdueTasks.length > 1 ? 's are' : ' is'} overdue`,
          category: 'urgent',
          urgent: true,
          icon: 'alert-triangle',
          color: 'bg-red-100 text-red-600',
          action: '/timeline'
        });
      }

      // Check for upcoming deadlines
      const upcomingTasks = tasks.filter(t => {
        if (!t.dueDate || t.status === 'completed') return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= now && dueDate <= oneWeekFromNow;
      });

      if (upcomingTasks.length > 0) {
        actions.push({
          id: 'upcoming-deadlines',
          title: 'Upcoming Deadlines',
          description: `${upcomingTasks.length} task${upcomingTasks.length > 1 ? 's' : ''} due this week`,
          category: 'important',
          urgent: false,
          icon: 'clock',
          color: 'bg-amber-100 text-amber-600',
          action: '/timeline'
        });
      }

      // Check budget status
      const totalBudget = parseFloat(project.budget || '0');
      const totalSpent = budgetItems.reduce((sum, item) => sum + parseFloat(item.actualCost || '0'), 0);
      const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      if (budgetUsage > 90) {
        actions.push({
          id: 'budget-warning',
          title: 'Budget Alert',
          description: `${budgetUsage.toFixed(1)}% of budget used`,
          category: 'urgent',
          urgent: true,
          icon: 'dollar-sign',
          color: 'bg-red-100 text-red-600',
          action: '/budget'
        });
      } else if (budgetUsage > 75) {
        actions.push({
          id: 'budget-check',
          title: 'Budget Check',
          description: `${budgetUsage.toFixed(1)}% of budget used - monitor spending`,
          category: 'important',
          urgent: false,
          icon: 'trending-up',
          color: 'bg-amber-100 text-amber-600',
          action: '/budget'
        });
      }

      // Check vendor status
      const pendingVendors = vendors.filter(v => v.status === 'pending');
      if (pendingVendors.length > 0) {
        actions.push({
          id: 'vendor-followup',
          title: 'Vendor Follow-up',
          description: `${pendingVendors.length} vendor${pendingVendors.length > 1 ? 's' : ''} pending response`,
          category: 'recommended',
          urgent: false,
          icon: 'users',
          color: 'bg-blue-100 text-blue-600',
          action: '/vendors'
        });
      }

      // Check RSVP status
      const pendingRSVPs = guests.filter(g => g.rsvpStatus === 'pending');
      if (pendingRSVPs.length > 5) {
        actions.push({
          id: 'rsvp-reminder',
          title: 'RSVP Reminders',
          description: `${pendingRSVPs.length} guests haven't responded`,
          category: 'recommended',
          urgent: false,
          icon: 'mail',
          color: 'bg-purple-100 text-purple-600',
          action: '/guests'
        });
      }

      // Smart suggestions based on wedding timeline
      const daysUntilWedding = project.date ? Math.ceil((new Date(project.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
      
      if (daysUntilWedding && daysUntilWedding < 30) {
        actions.push({
          id: 'final-month',
          title: 'Final Month Tasks',
          description: 'Wedding is less than 30 days away - finalize everything',
          category: 'urgent',
          urgent: true,
          icon: 'star',
          color: 'bg-pink-100 text-pink-600',
          action: '/timeline'
        });
      } else if (daysUntilWedding && daysUntilWedding < 90) {
        actions.push({
          id: 'three-month-prep',
          title: '3-Month Preparation',
          description: 'Start finalizing vendor details and timeline',
          category: 'important',
          urgent: false,
          icon: 'calendar-days',
          color: 'bg-indigo-100 text-indigo-600',
          action: '/timeline'
        });
      }

      // If no urgent actions, suggest productive next steps
      if (actions.length === 0) {
        if (tasks.filter(t => t.status === 'completed').length === 0) {
          actions.push({
            id: 'first-task',
            title: 'Get Started',
            description: 'Complete your first wedding planning task',
            category: 'getting_started',
            urgent: false,
            icon: 'play',
            color: 'bg-green-100 text-green-600',
            action: '/timeline'
          });
        } else {
          actions.push({
            id: 'all-good',
            title: 'Great Progress!',
            description: 'Everything looks on track - keep up the good work',
            category: 'success',
            urgent: false,
            icon: 'check-circle',
            color: 'bg-green-100 text-green-600',
            action: '/dashboard'
          });
        }
      }

      res.json(actions.slice(0, 6)); // Limit to 6 actions
    } catch (error) {
      console.error('Quick actions error:', error);
      res.status(500).json({ message: 'Failed to fetch quick actions' });
    }
  });

  // Schedules API
  app.get("/api/schedules", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        return res.json([]);
      }
      
      const schedules = await storage.getSchedulesByProjectId(projects[0].id);
      res.json(schedules);
    } catch (error) {
      console.error('Get schedules error:', error);
      res.status(500).json({ message: 'Failed to get schedules' });
    }
  });

  app.post("/api/schedules", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        const newProject = await storage.createWeddingProject({
          name: "My Wedding",
          date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdBy: userId,
        });
        projects = [newProject];
      }
      
      const scheduleData = {
        ...req.body,
        projectId: projects[0].id,
        createdBy: userId
      };
      
      const schedule = await storage.createSchedule(scheduleData);
      res.json(schedule);
    } catch (error) {
      console.error('Create schedule error:', error);
      res.status(500).json({ message: 'Failed to create schedule' });
    }
  });

  // Budget items API
  app.get("/api/budget-items", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      // Create a default project if none exists
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          name: "My Wedding",
          date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdBy: userId,
          budget: null,
          guestCount: null,
          theme: null,
          venue: null
        });
        projects = [defaultProject];
      }
      
      const budgetItems = await storage.getBudgetItemsByProjectId(projects[0].id);
      res.json(budgetItems);
    } catch (error) {
      console.error('Budget items error:', error);
      res.status(500).json({ message: "Failed to fetch budget items" });
    }
  });

  // Default Tasks routes
  app.post("/api/default-tasks/seed", requireAuth, async (req, res) => {
    try {
      await storage.seedDefaultTasks();
      res.json({ message: "Default tasks seeded successfully" });
    } catch (error) {
      console.error("Error seeding default tasks:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/projects/:projectId/tasks/from-template", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { weddingDate } = req.body;
      
      if (!weddingDate) {
        return res.status(400).json({ message: "Wedding date is required" });
      }

      const tasks = await storage.createTasksFromTemplate(projectId, (req as any).userId, new Date(weddingDate));
      
      // Log activity
      await storage.createActivity({
        userId: (req as any).userId,
        projectId,
        action: "created_tasks_from_template",
        target: "tasks",
        targetId: null,
        details: { count: tasks.length }
      });

      res.json(tasks);
    } catch (error) {
      console.error("Error creating tasks from template:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Tasks API - Enhanced with automatic default task loading
  app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      // Create a default project if none exists
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          name: "My Wedding",
          date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdBy: userId,
          budget: null,
          guestCount: null,
          theme: null,
          venue: null
        });
        projects = [defaultProject];
      }
      
      let tasks = await storage.getTasksByProjectId(projects[0].id);
      
      // Auto-load default tasks if no tasks exist
      if (tasks.length === 0) {
        console.log(`No tasks found for project ${projects[0].id}, loading default wedding checklist...`);
        
        const defaultTasks = await storage.getDefaultTasks();
        
        if (defaultTasks.length > 0) {
          console.log(`Found ${defaultTasks.length} default tasks to load`);
          
          // Category mapping to your preferred names
          const mapCategory = (originalCategory: string): string => {
            const categoryMap: { [key: string]: string } = {
              'Budget & Planning': 'Budget & Planning',
              'Guest List & Invitations': 'Guest List & Invitations',
              'Ceremony': 'Ceremony',
              'Reception': 'Reception',
              'Decor & Rentals': 'Decor & Design',
              'Attire': 'Attire & Beauty',
              'Beauty': 'Attire & Beauty',
              'Photography': 'Photography & Videography',
              'Videography': 'Photography & Videography',
              'Transportation': 'Transportation & Logistics',
              'Logistics': 'Transportation & Logistics',
              'Legal': 'Legal & Documentation',
              'Documentation': 'Legal & Documentation',
              'Honeymoon': 'Honeymoon & Travel',
              'Travel': 'Honeymoon & Travel',
              'Post-Wedding': 'Post Wedding',
              'Gifts': 'Gifts & Favors',
              'Favors': 'Gifts & Favors'
            };
            return categoryMap[originalCategory] || originalCategory;
          };

          // Create tasks from default template with calculated due dates
          const weddingDate = projects[0].date;
          const tasksToCreate = defaultTasks.map(defaultTask => {
            // Calculate due date based on timeframe order
            let dueDate = null;
            if (defaultTask.timeframeOrder && weddingDate) {
              // Convert timeframe order to days before wedding (roughly weeks to days)
              const daysBeforeWedding = Math.max(0, defaultTask.timeframeOrder * 7);
              dueDate = new Date(weddingDate.getTime() - (daysBeforeWedding * 24 * 60 * 60 * 1000));
            }
            
            return {
              title: defaultTask.taskName,
              description: defaultTask.description || `${defaultTask.category} planning task`,
              category: mapCategory(defaultTask.category),
              priority: 'medium' as const,
              status: 'pending' as const,
              dueDate,
              assignedTo: null,
              notes: `Default task from ${defaultTask.timeframe} timeframe`,
              projectId: projects[0].id,
              createdBy: userId,
              timeframeOrder: defaultTask.timeframeOrder,
              defaultTimeframe: defaultTask.timeframe,
              isDefaultTask: true,
              customDate: null
            };
          });
          
          // Create all default tasks
          let createdCount = 0;
          for (const taskData of tasksToCreate) {
            try {
              await storage.createTask(taskData);
              createdCount++;
            } catch (error) {
              console.error('Error creating default task:', taskData.title, error);
            }
          }
          
          console.log(`Successfully created ${createdCount} default tasks`);
          
          // Fetch the updated task list
          tasks = await storage.getTasksByProjectId(projects[0].id);
        } else {
          console.log('No default tasks found in database');
        }
      }
      
      res.json(tasks);
    } catch (error) {
      console.error('Tasks API error:', error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      // Create a default project if none exists
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          name: "My Wedding",
          date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdBy: userId,
          budget: null,
          guestCount: null,
          theme: null,
          venue: null
        });
        projects = [defaultProject];
      }

      const project = projects[0];
      // Convert dueDate string to Date object if provided
      const requestData = { ...req.body };
      if (requestData.dueDate && typeof requestData.dueDate === 'string') {
        requestData.dueDate = new Date(requestData.dueDate);
      }
      
      const taskData = insertTaskSchema.parse({
        ...requestData,
        projectId: project.id,
        createdBy: userId
      });
      
      const task = await storage.createTask(taskData);
      
      // Create activity
      await storage.createActivity({
        projectId: project.id,
        userId,
        action: 'created task',
        target: 'task',
        targetId: task.id,
        details: { taskTitle: task.title }
      });

      res.json(task);
    } catch (error) {
      console.error('Task creation error:', error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Guests API
  app.get("/api/guests", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          name: "My Wedding",
          date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdBy: userId,
          budget: null,
          guestCount: null,
          theme: null,
          venue: null
        });
        projects = [defaultProject];
      }
      
      const guests = await storage.getGuestsByProjectId(projects[0].id);
      res.json(guests);
    } catch (error) {
      console.error('Guests fetch error:', error);
      res.status(500).json({ message: "Failed to fetch guests" });
    }
  });



  // Inspiration Items API
  app.get("/api/inspiration", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        return res.json([]);
      }
      
      const items = await storage.getInspirationItemsByProjectId(projects[0].id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspiration items" });
    }
  });

  app.post("/api/inspiration", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          name: "My Wedding",
          description: "Wedding planning project",
          date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdBy: userId
        });
        projects = [defaultProject];
      }
      
      const itemData = {
        ...req.body,
        projectId: projects[0].id,
        addedBy: userId
      };
      
      const item = await storage.createInspirationItem(itemData);
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to create inspiration item" });
    }
  });

  app.get("/api/inspiration-items", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          userId: userId,
          name: "My Wedding",
          description: "Wedding planning project",
          weddingDate: null,
          venue: null,
          budget: null,
          guestCount: null,
          status: "planning"
        });
        projects = [defaultProject];
      }
      
      const inspirationItems = await storage.getInspirationItemsByProjectId(projects[0].id);
      res.json(inspirationItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspiration items" });
    }
  });

  app.post("/api/inspiration-items", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          userId: userId,
          name: "My Wedding",
          description: "Wedding planning project",
          weddingDate: null,
          venue: null,
          budget: null,
          guestCount: null,
          status: "planning"
        });
        projects = [defaultProject];
      }

      const inspirationData = {
        ...req.body,
        projectId: projects[0].id,
        createdBy: userId
      };
      const inspirationItem = await storage.createInspirationItem(inspirationData);
      res.json(inspirationItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to create inspiration item" });
    }
  });

  // Vendors API
  app.get("/api/vendors", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          userId: userId,
          name: "My Wedding",
          description: "Wedding planning project",
          weddingDate: null,
          venue: null,
          budget: null,
          guestCount: null,
          status: "planning"
        });
        projects = [defaultProject];
      }
      
      const vendors = await storage.getVendorsByProjectId(projects[0].id);
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.post("/api/vendors", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          userId: userId,
          name: "My Wedding",
          description: "Wedding planning project",
          weddingDate: null,
          venue: null,
          budget: null,
          guestCount: null,
          status: "planning"
        });
        projects = [defaultProject];
      }

      const vendorData = {
        ...req.body,
        projectId: projects[0].id,
        createdBy: userId
      };
      const vendor = await storage.createVendor(vendorData);
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  app.patch("/api/vendors/:id", requireAuth, async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const vendorData = req.body;
      
      const vendor = await storage.updateVendor(vendorId, vendorData);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      res.json(vendor);
    } catch (error) {
      console.error('Vendor update error:', error);
      res.status(400).json({ message: "Invalid vendor data" });
    }
  });

  app.delete("/api/vendors/:id", requireAuth, async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const success = await storage.deleteVendor(vendorId);
      
      if (!success) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Vendor deletion error:', error);
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });

  // AI Vendor Search endpoint
  app.post("/api/vendors/ai-search", requireAuth, async (req, res) => {
    try {
      const { location, category } = req.body;
      
      if (!location || !category) {
        return res.status(400).json({ 
          message: "Location and category are required",
          vendors: []
        });
      }

      // Since OpenAI API may be quota limited, return helpful placeholder vendors
      const placeholderVendors = [
        {
          name: `${category} Expert in ${location}`,
          category: category,
          location: location,
          rating: 4.5,
          description: `Professional ${category.toLowerCase()} service provider in ${location}`,
          contact: {
            phone: "(555) 123-4567",
            email: "contact@vendor.com",
            website: "www.vendor.com"
          }
        },
        {
          name: `Premium ${category} Services`,
          category: category,
          location: location,
          rating: 4.8,
          description: `High-quality ${category.toLowerCase()} services with excellent reviews`,
          contact: {
            phone: "(555) 234-5678",
            email: "info@premium.com",
            website: "www.premium.com"
          }
        }
      ];

      res.json({ 
        vendors: placeholderVendors,
        message: "AI vendor search is currently using sample data. Use these as inspiration to find real vendors in your area."
      });

    } catch (error) {
      console.error('Vendor search error:', error);
      res.status(500).json({ 
        message: "Failed to search for vendors",
        vendors: []
      });
    }
  });

  // Budget Items API (POST endpoint)
  app.post("/api/budget-items", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          userId: userId,
          name: "My Wedding",
          description: "Wedding planning project",
          weddingDate: null,
          venue: null,
          budget: null,
          guestCount: null,
          status: "planning"
        });
        projects = [defaultProject];
      }

      const budgetData = {
        ...req.body,
        projectId: projects[0].id,
        createdBy: userId
      };
      const budgetItem = await storage.createBudgetItem(budgetData);
      res.json(budgetItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to create budget item" });
    }
  });

  // Tasks API (POST endpoint)
  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      let projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        const defaultProject = await storage.createWeddingProject({
          name: "My Wedding",
          date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdBy: userId,
          budget: null,
          guestCount: null,
          theme: null,
          venue: null
        });
        projects = [defaultProject];
      }

      const taskData = {
        ...req.body,
        projectId: projects[0].id,
        createdBy: userId,
        status: 'pending',
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
      };
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      console.error('Task creation error:', error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // AI Timeline generation (standalone endpoint)
  app.post("/api/ai/generate-timeline", requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      
      // Get or create default project for the user
      let project = await storage.getWeddingProjectByUserId(userId);
      if (!project) {
        project = await storage.createWeddingProject({
          name: "My Wedding",
          date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          createdBy: userId,
          budget: null,
          guestCount: null,
          theme: null,
          venue: null
        });
      }

      const { weddingDate, budget, guestCount, venue, theme } = req.body;

      const timeline = await generateWeddingTimeline({
        budget: parseFloat(budget || project.budget || '50000'),
        guestCount: guestCount || project.guestCount || 100,
        date: weddingDate || project.date.toISOString(),
        venue: venue || project.venue || undefined,
        theme: theme || project.theme || undefined,
        style: project.style || undefined,
        preferences: project.description || undefined
      });

      // Convert timeline items to tasks
      const tasks = await Promise.all(timeline.map(async (item) => {
        const projectDate = new Date(weddingDate || project.date);
        const dueDate = new Date(projectDate);
        dueDate.setDate(dueDate.getDate() - (item.week * 7));
        
        return await storage.createTask({
          projectId: project.id,
          title: item.title,
          description: item.description,
          category: item.category,
          priority: item.priority,
          status: 'pending',
          dueDate,
          createdBy: userId,
          assignedTo: null
        });
      }));

      // Create activity
      await storage.createActivity({
        projectId: project.id,
        userId,
        action: 'generated AI timeline',
        target: 'timeline',
        details: { tasksCreated: tasks.length }
      });

      res.json({ tasks, timeline });
    } catch (error) {
      console.error('AI timeline generation error:', error);
      res.status(500).json({ message: "Failed to generate timeline" });
    }
  });

  // AI-powered vendor search endpoint
  app.post("/api/vendors/ai-search", requireAuth, async (req, res) => {
    try {
      const { location, vendorType, budget, style } = req.body;
      
      if (!location || !vendorType) {
        return res.status(400).json({ message: "Location and vendor type are required" });
      }

      // Create a comprehensive search prompt for OpenAI
      const searchPrompt = `You are a wedding planning assistant helping find real wedding vendors. 

Search for: ${vendorType} vendors in ${location}
${budget ? `Budget range: $${budget}` : ''}
${style ? `Style preference: ${style}` : ''}

Please provide 5-8 real, current wedding vendors in this area with the following information:
- Business name
- Contact information (phone, email, website)
- Address/location
- Specialties or services offered
- Approximate price range
- Brief description
- Any notable reviews or awards

Format the response as a JSON array with this structure:
[
  {
    "name": "Business Name",
    "phone": "(555) 123-4567",
    "email": "contact@business.com",
    "website": "https://business.com",
    "address": "123 Main St, City, State",
    "category": "${vendorType}",
    "services": "Specific services offered",
    "priceRange": "$1,000 - $3,000",
    "description": "Brief description of the vendor",
    "specialties": ["Specialty 1", "Specialty 2"],
    "rating": "4.8/5"
  }
]

Focus on providing accurate, real businesses that are currently operating. Include diverse options across different price points.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a wedding planning expert with access to current vendor information. Provide accurate, helpful vendor recommendations."
          },
          {
            role: "user",
            content: searchPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const aiResponse = response.choices[0]?.message?.content;
      
      if (!aiResponse) {
        return res.status(500).json({ message: "Failed to get AI response" });
      }

      // Try to parse the JSON response
      let vendors;
      try {
        // Extract JSON from the response if it's wrapped in markdown or other text
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
        vendors = JSON.parse(jsonString);
      } catch (parseError) {
        // If JSON parsing fails, create structured data from the text response
        vendors = [{
          name: "AI Search Results",
          description: aiResponse,
          category: vendorType,
          location: location,
          searchQuery: `${vendorType} in ${location}`,
          note: "Please review these AI-generated recommendations and verify contact details before reaching out."
        }];
      }

      res.json({
        vendors,
        searchQuery: { location, vendorType, budget, style },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI vendor search error:', error);
      res.status(500).json({ message: "Failed to search for vendors" });
    }
  });

  // Enhanced AI assistant endpoint for vendor search and general assistance
  app.post("/api/ai/chat", requireAuth, async (req, res) => {
    try {
      const { message, context } = req.body;
      const userId = (req as any).userId;
      
      // Get user's wedding project for context
      const projects = await storage.getWeddingProjectsByUserId(userId);
      const currentProject = projects.find(p => p.name === "Emma & Jake's Wedding") || projects[0];
      
      let systemContext = "You are a helpful wedding planning assistant. Provide practical, actionable advice for wedding planning.";
      
      if (currentProject) {
        const projectContext = `Wedding Details:
- Date: ${currentProject.date ? new Date(currentProject.date).toLocaleDateString() : 'Not set'}
- Location: ${currentProject.location || 'Not specified'}
- Budget: $${currentProject.budget || 'Not set'}
- Guest Count: ${currentProject.guestCount || 'Not set'}
- Style: ${currentProject.style || 'Not specified'}`;
        
        systemContext += `\n\nCurrent Wedding Project:\n${projectContext}`;
      }
      
      // Check if the message is about vendor search
      const isVendorQuery = /vendor|photographer|caterer|florist|dj|music|venue|baker|makeup|hair/i.test(message);
      
      if (isVendorQuery && currentProject?.location) {
        systemContext += `\n\nThe user is asking about vendors. You can help them find specific vendors in ${currentProject.location}. Provide practical vendor recommendations and suggest they use the AI vendor search feature for detailed results.`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemContext
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const aiResponse = response.choices[0]?.message?.content;
      
      if (!aiResponse) {
        return res.status(500).json({ message: "Failed to get AI response" });
      }

      res.json({
        response: aiResponse,
        timestamp: new Date().toISOString(),
        context: context || 'general'
      });

    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({ message: "Failed to process AI request" });
    }
  });

  return httpServer;
}
