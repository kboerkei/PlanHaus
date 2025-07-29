import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// Get activity log for a project
router.get('/', authenticateUser, async (req, res) => {
  try {
    const projectId = parseInt(req.query.projectId as string);
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const activities = await storage.getActivitiesByProjectId(projectId, limit);

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

// Log new activity
router.post('/', authenticateUser, async (req, res) => {
  try {
    const schema = z.object({
      projectId: z.number().optional(),
      action: z.string(),
      resourceType: z.string(),
      resourceId: z.number(),
      details: z.string().optional()
    });

    const data = schema.parse(req.body);
    const projectId = data.projectId || 1; // Default to current project

    const activity = await storage.logActivity({
      projectId,
      userId: req.user!.id,
      action: data.action,
      entityType: data.resourceType,
      entityId: data.resourceId,
      details: data.details || null
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error('Error logging activity:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

export default router;