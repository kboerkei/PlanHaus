import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../utils/validation";
import { getOrCreateDefaultProject } from "../utils/projects";
import { logError, logInfo } from "../utils/logger";
import { RequestWithUser } from "../types/express";
import { insertWeddingProjectSchema } from "@shared/schema";

const router = Router();

router.get("/", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projects = await storage.getWeddingProjectsByUserId(req.userId);
    
    // If no projects exist, create a default one
    if (projects.length === 0) {
      const defaultProject = await getOrCreateDefaultProject(req.userId);
      return res.json([defaultProject]);
    }
    
    res.json(projects);
  } catch (error) {
    logError('projects', error, { userId: req.userId });
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

router.post("/", requireAuth, validateBody(insertWeddingProjectSchema), async (req: RequestWithUser, res) => {
  try {
    const projectData = { ...req.body, createdBy: req.userId };
    const project = await storage.createWeddingProject(projectData);
    
    logInfo('projects', `New project created: ${project.name}`, { userId: req.userId });
    
    res.status(201).json(project);
  } catch (error) {
    logError('projects', error, { userId: req.userId });
    res.status(500).json({ message: "Failed to create project" });
  }
});

router.get("/:id", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const projects = await storage.getWeddingProjectsByUserId(req.userId);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(project);
  } catch (error) {
    logError('projects', error, { userId: req.userId, projectId: req.params.id });
    res.status(500).json({ message: "Failed to fetch project" });
  }
});

router.put("/:id", requireAuth, validateBody(insertWeddingProjectSchema.partial()), async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const projects = await storage.getWeddingProjectsByUserId(req.userId);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const updatedProject = await storage.updateWeddingProject(projectId, req.body);
    
    logInfo('projects', `Project updated: ${projectId}`, { userId: req.userId });
    
    res.json(updatedProject);
  } catch (error) {
    logError('projects', error, { userId: req.userId, projectId: req.params.id });
    res.status(500).json({ message: "Failed to update project" });
  }
});

// Project-specific routes for nested resources
router.get("/:id/budget", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const projects = await storage.getWeddingProjectsByUserId(req.userId);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const budgetItems = await storage.getBudgetItemsByProjectId(projectId);
    res.json(budgetItems);
  } catch (error) {
    logError('projects', error, { userId: req.userId, projectId: req.params.id });
    res.status(500).json({ message: "Failed to fetch budget items" });
  }
});

router.get("/:id/guests", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const projects = await storage.getWeddingProjectsByUserId(req.userId);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const guests = await storage.getGuestsByProjectId(projectId);
    res.json(guests);
  } catch (error) {
    logError('projects', error, { userId: req.userId, projectId: req.params.id });
    res.status(500).json({ message: "Failed to fetch guests" });
  }
});

router.get("/:id/vendors", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const projects = await storage.getWeddingProjectsByUserId(req.userId);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const vendors = await storage.getVendorsByProjectId(projectId);
    res.json(vendors);
  } catch (error) {
    logError('projects', error, { userId: req.userId, projectId: req.params.id });
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
});

router.get("/:id/tasks", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const projects = await storage.getWeddingProjectsByUserId(req.userId);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const tasks = await storage.getTasksByProjectId(projectId);
    res.json(tasks);
  } catch (error) {
    logError('projects', error, { userId: req.userId, projectId: req.params.id });
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

router.patch("/:id/tasks/:taskId", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const taskId = parseInt(req.params.taskId);
    
    // Verify project access
    const projects = await storage.getWeddingProjectsByUserId(req.userId);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Get the task to verify it belongs to this project
    const task = await storage.getTaskById(taskId);
    if (!task || task.projectId !== projectId) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    const updatedTask = await storage.updateTask(taskId, req.body);
    
    // Log activity for status changes
    if (req.body.status || req.body.isCompleted !== undefined) {
      const isCompleted = req.body.isCompleted || req.body.status === 'completed';
      await storage.createActivity({
        projectId,
        userId: req.userId,
        type: isCompleted ? 'task_completed' : 'task_updated',
        description: isCompleted ? `Completed task: ${task.title}` : `Updated task: ${task.title}`,
        metadata: { taskId: task.id }
      });
    }
    
    logInfo('projects', `Task updated: ${taskId} in project ${projectId}`, { userId: req.userId });
    
    res.json(updatedTask);
  } catch (error) {
    logError('projects', error, { userId: req.userId, projectId: req.params.id, taskId: req.params.taskId });
    res.status(500).json({ message: "Failed to update task" });
  }
});

export default router;