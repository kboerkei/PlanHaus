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
  insertScheduleSchema, insertScheduleEventSchema, insertIntakeDataSchema,
  users
} from "@shared/schema";
import { 
  generateWeddingTimeline, generateBudgetBreakdown, generateVendorSuggestions,
  generatePersonalizedRecommendation, analyzeWeddingTheme 
} from "./services/openai";
import { initializeWebSocketService, websocketService } from "./services/websocket";
import multer from "multer";
import path from "path";
import fs from "fs";

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
  console.log('Auth check - sessionId:', sessionId);
  console.log('Auth check - sessions has sessionId:', sessionId ? sessions.has(sessionId) : false);
  console.log('Auth check - all sessions:', Array.from(sessions.keys()));
  
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
        avatar: user.avatar,
        hasCompletedIntake: user.hasCompletedIntake || false
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

  // Intake API
  app.post("/api/intake", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      console.log('Intake API - User ID:', userId);
      console.log('Intake API - Request body:', JSON.stringify(req.body, null, 2));
      
      // Transform the request body to handle date conversion
      const requestData = {
        ...req.body,
        userId,
        weddingDate: req.body.weddingDate ? new Date(req.body.weddingDate) : null
      };
      
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
      
      // Create default wedding project for the user
      let project = await storage.getWeddingProjectByUserId(userId);
      if (!project) {
        const projectData = {
          name: `${intake.partner1FirstName || 'Our'} Wedding`,
          date: intake.weddingDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default to 1 year from now if no date
          createdBy: userId,
          budget: intake.totalBudget ? parseFloat(intake.totalBudget) : null,
          guestCount: intake.estimatedGuests || null,
          theme: intake.overallVibe || null,
          venue: intake.ceremonyLocation || null,
        };
        project = await storage.createWeddingProject(projectData);
      }
      
      // Add key people to guest list
      const keyPeople: Array<{name: string, role: string}> = [
        ...(intake.vips || []),
        ...(intake.weddingParty || [])
      ];
      
      for (const person of keyPeople) {
        if (person.name && person.name.trim()) {
          try {
            const guestData = {
              projectId: project.id,
              firstName: person.name.split(' ')[0] || person.name,
              lastName: person.name.split(' ').slice(1).join(' ') || '',
              email: '',
              phone: '',
              address: '',
              rsvpStatus: 'pending' as const,
              guestType: person.role === 'Maid of Honor' || person.role === 'Best Man' || 
                         person.role === 'Bridesmaid' || person.role === 'Groomsman' ? 'wedding_party' as const : 'vip' as const,
              dietaryRestrictions: '',
              notes: `Role: ${person.role}`,
              plusOneAllowed: false,
              hotelInfo: '',
              addedBy: userId
            };
            await storage.createGuest(guestData);
          } catch (guestError) {
            console.error('Error adding guest:', guestError);
          }
        }
      }

      // Create initial budget breakdown if budget provided
      if (intake.totalBudget && parseFloat(intake.totalBudget) > 0) {
        const totalBudget = parseFloat(intake.totalBudget);
        const budgetCategories = [
          { category: 'Venue', percentage: 40 },
          { category: 'Catering', percentage: 30 },
          { category: 'Photography', percentage: 10 },
          { category: 'Music/Entertainment', percentage: 8 },
          { category: 'Flowers & Decor', percentage: 8 },
          { category: 'Attire', percentage: 4 }
        ];

        for (const budgetCategory of budgetCategories) {
          try {
            const budgetData = {
              projectId: project.id,
              category: budgetCategory.category,
              item: `${budgetCategory.category} Budget`,
              estimatedCost: Math.round(totalBudget * (budgetCategory.percentage / 100)),
              actualCost: null,
              vendor: '',
              notes: `Auto-generated from intake (${budgetCategory.percentage}% of total budget)`,
              isPaid: false,
              dueDate: intake.weddingDate,
              createdBy: userId
            };
            await storage.createBudgetItem(budgetData);
          } catch (budgetError) {
            console.error('Error creating budget item:', budgetError);
          }
        }
      }

      // Create initial timeline milestones if wedding date provided
      if (intake.weddingDate) {
        const weddingDate = new Date(intake.weddingDate);
        const timelineTasks = [
          { title: 'Book Ceremony Venue', weeksBeforeWedding: 52, priority: 'high' as const },
          { title: 'Book Reception Venue', weeksBeforeWedding: 52, priority: 'high' as const },
          { title: 'Send Save the Dates', weeksBeforeWedding: 24, priority: 'medium' as const },
          { title: 'Order Wedding Dress', weeksBeforeWedding: 20, priority: 'high' as const },
          { title: 'Book Photographer', weeksBeforeWedding: 16, priority: 'high' as const },
          { title: 'Send Wedding Invitations', weeksBeforeWedding: 8, priority: 'high' as const },
          { title: 'Final Guest Count', weeksBeforeWedding: 2, priority: 'high' as const },
          { title: 'Wedding Rehearsal', weeksBeforeWedding: 0, priority: 'high' as const }
        ];

        for (const task of timelineTasks) {
          try {
            const dueDate = new Date(weddingDate);
            dueDate.setDate(dueDate.getDate() - (task.weeksBeforeWedding * 7));
            
            const timelineData = {
              projectId: project.id,
              title: task.title,
              description: `Important milestone for your ${intake.overallVibe || 'dream'} wedding`,
              dueDate: dueDate,
              category: 'Planning',
              priority: task.priority,
              isCompleted: false,
              createdBy: userId
            };
            await storage.createTimelineEvent(timelineData);
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

  // Budget items API
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

  // Tasks API
  app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const projects = await storage.getWeddingProjectsByUserId(userId);
      
      if (projects.length === 0) {
        return res.json([]);
      }
      
      const tasks = await storage.getTasksByProjectId(projects[0].id);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  return httpServer;
}
