import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// Get activity log for a project
router.get('/', authenticateUser, async (req, res) => {
  try {
    const projectId = parseInt(req.query.projectId as string) || 1;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const section = req.query.section as string;
    const limit = parseInt(req.query.limit as string) || 50;

    const activities = await storage.getActivityLog({
      projectId,
      userId,
      section,
      limit
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

// Create activity log entry (internal use by other endpoints)
router.post('/', authenticateUser, async (req, res) => {
  try {
    const schema = z.object({
      projectId: z.number(),
      userId: z.number(),
      userName: z.string(),
      section: z.string(),
      action: z.string(),
      entityType: z.string(),
      entityId: z.number().optional(),
      details: z.string()
    });

    const data = schema.parse(req.body);
    
    const activity = await storage.createActivityLogEntry({
      projectId: data.projectId,
      userId: data.userId,
      userName: data.userName,
      section: data.section,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      details: data.details
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity log entry:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create activity log entry' });
  }
});

export default router;