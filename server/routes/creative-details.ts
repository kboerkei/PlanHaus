import { Router } from 'express';
import { storage } from '../storage';
import { requireAuth, RequestWithUser } from '../middleware/auth';
import { validateBody } from '../utils/validation';
import { getOrCreateDefaultProject } from '../utils/projects';
import { insertCreativeDetailSchema } from '@shared/schema';
import { logInfo, logError } from '../utils/logger';

const router = Router();

// Get all creative details for current project
router.get('/api/creative-details', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const project = await getOrCreateDefaultProject(req.userId);
    const creativeDetails = await storage.getCreativeDetailsByProjectId(project.id);
    res.json(creativeDetails);
  } catch (error) {
    logError('creative-details', error, { userId: req.userId });
    res.status(500).json({ message: "Failed to fetch creative details" });
  }
});

// Create new creative detail
router.post('/api/creative-details', requireAuth, validateBody(insertCreativeDetailSchema), async (req: RequestWithUser, res) => {
  try {
    const project = await getOrCreateDefaultProject(req.userId);
    const creativeDetailData = { 
      ...req.body, 
      projectId: project.id,
      createdBy: req.userId 
    };
    const creativeDetail = await storage.createCreativeDetail(creativeDetailData);
    
    logInfo('creative-details', `Creative detail created: ${creativeDetail.title}`, { userId: req.userId });
    res.status(201).json(creativeDetail);
  } catch (error) {
    logError('creative-details', error, { userId: req.userId });
    res.status(500).json({ message: "Failed to create creative detail" });
  }
});

// Update creative detail
router.put('/api/creative-details/:id', requireAuth, validateBody(insertCreativeDetailSchema.partial()), async (req: RequestWithUser, res) => {
  try {
    const creativeDetailId = parseInt(req.params.id);
    const creativeDetail = await storage.getCreativeDetailById(creativeDetailId);
    
    if (!creativeDetail) {
      return res.status(404).json({ message: "Creative detail not found" });
    }

    // Verify access through project ownership
    const projects = await storage.getWeddingProjectsByUserId(req.userId);
    const hasAccess = projects.some(p => p.id === creativeDetail.projectId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedCreativeDetail = await storage.updateCreativeDetail(creativeDetailId, req.body);
    
    logInfo('creative-details', `Creative detail updated: ${creativeDetailId}`, { userId: req.userId });
    res.json(updatedCreativeDetail);
  } catch (error) {
    logError('creative-details', error, { userId: req.userId, creativeDetailId: req.params.id });
    res.status(500).json({ message: "Failed to update creative detail" });
  }
});

// Delete creative detail
router.delete('/api/creative-details/:id', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const creativeDetailId = parseInt(req.params.id);
    const creativeDetail = await storage.getCreativeDetailById(creativeDetailId);
    
    if (!creativeDetail) {
      return res.status(404).json({ message: "Creative detail not found" });
    }

    // Verify access through project ownership
    const projects = await storage.getWeddingProjectsByUserId(req.userId);
    const hasAccess = projects.some(p => p.id === creativeDetail.projectId);
    
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    await storage.deleteCreativeDetail(creativeDetailId);
    
    logInfo('creative-details', `Creative detail deleted: ${creativeDetailId}`, { userId: req.userId });
    res.json({ message: "Creative detail deleted successfully" });
  } catch (error) {
    logError('creative-details', error, { userId: req.userId, creativeDetailId: req.params.id });
    res.status(500).json({ message: "Failed to delete creative detail" });
  }
});

export default router;