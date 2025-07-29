import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';
import { authenticateUser } from '../middleware/auth.js';
import { insertCreativeDetailSchema } from '@shared/schema';

const router = Router();

// Get creative details for a project
router.get('/', authenticateUser, async (req, res) => {
  try {
    const projectId = parseInt(req.query.projectId as string) || 1; // Default to current project
    const details = await storage.getCreativeDetails(projectId);
    res.json(details);
  } catch (error) {
    console.error('Error fetching creative details:', error);
    res.status(500).json({ error: 'Failed to fetch creative details' });
  }
});

// Create creative detail
router.post('/', authenticateUser, async (req, res) => {
  try {
    const data = insertCreativeDetailSchema.parse({
      ...req.body,
      createdBy: req.user!.id,
      projectId: req.body.projectId || 1 // Default to current project
    });

    const detail = await storage.createCreativeDetail(data);
    
    // Log activity
    await storage.logActivity({
      projectId: data.projectId,
      userId: req.user!.id,
      action: 'created',
      entityType: 'creative_detail',
      entityId: detail.id,
      details: `Created creative detail: ${detail.title}`
    });

    res.status(201).json(detail);
  } catch (error) {
    console.error('Error creating creative detail:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create creative detail' });
  }
});

// Update creative detail
router.patch('/:id', authenticateUser, async (req, res) => {
  try {
    const detailId = parseInt(req.params.id);
    const updates = req.body;

    const detail = await storage.updateCreativeDetail(detailId, updates);
    
    if (!detail) {
      return res.status(404).json({ error: 'Creative detail not found' });
    }

    // Log activity
    await storage.logActivity({
      projectId: detail.projectId,
      userId: req.user!.id,
      action: 'updated',
      entityType: 'creative_detail',
      entityId: detail.id,
      details: `Updated creative detail: ${detail.title}`
    });

    res.json(detail);
  } catch (error) {
    console.error('Error updating creative detail:', error);
    res.status(500).json({ error: 'Failed to update creative detail' });
  }
});

// Delete creative detail
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const detailId = parseInt(req.params.id);
    
    // Get detail before deletion for logging
    const detail = await storage.getCreativeDetailById(detailId);
    if (!detail) {
      return res.status(404).json({ error: 'Creative detail not found' });
    }

    const success = await storage.deleteCreativeDetail(detailId);
    
    if (!success) {
      return res.status(404).json({ error: 'Creative detail not found' });
    }

    // Log activity
    await storage.logActivity({
      projectId: detail.projectId,
      userId: req.user!.id,
      action: 'deleted',
      entityType: 'creative_detail',
      entityId: detail.id,
      details: `Deleted creative detail: ${detail.title}`
    });

    res.json({ message: 'Creative detail deleted successfully' });
  } catch (error) {
    console.error('Error deleting creative detail:', error);
    res.status(500).json({ error: 'Failed to delete creative detail' });
  }
});

export default router;