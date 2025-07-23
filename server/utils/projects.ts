import { storage } from "../storage";
import { logError, logInfo } from "./logger";

export async function getOrCreateDefaultProject(userId: number) {
  try {
    // Get user's projects
    const projects = await storage.getWeddingProjectsByUserId(userId);
    
    if (projects.length > 0) {
      return projects[0]; // Return first project
    }
    
    // Create default project if none exists
    logInfo('projects', `Creating default project for user ${userId}`);
    
    const defaultProject = await storage.createWeddingProject({
      name: "My Wedding",
      createdBy: userId,
      date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default to 1 year from now
      venue: null,
      budget: 25000,
      guestCount: 100,
      theme: null
    });
    
    return defaultProject;
  } catch (error) {
    logError('projects', error, { userId });
    throw error;
  }
}

export async function ensureProjectAccess(userId: number, projectId: string | number) {
  try {
    const projects = await storage.getWeddingProjectsByUserId(userId);
    const project = projects.find(p => p.id === Number(projectId));
    
    if (!project) {
      throw new Error('Project not found or access denied');
    }
    
    return project;
  } catch (error) {
    logError('projects', error, { userId, projectId });
    throw error;
  }
}