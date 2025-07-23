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

export default router;