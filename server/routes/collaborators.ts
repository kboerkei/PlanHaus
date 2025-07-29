import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// Get collaborators for a project
router.get('/', authenticateUser, async (req, res) => {
  try {
    const projectId = parseInt(req.query.projectId as string);
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const projectCollaborators = await storage.getCollaboratorsByProjectId(projectId);

    res.json(projectCollaborators);
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({ error: 'Failed to fetch collaborators' });
  }
});

// Add collaborator to project
router.post('/', authenticateUser, async (req, res) => {
  try {
    const schema = z.object({
      projectId: z.number(),
      email: z.string().email(),
      role: z.enum(['Owner', 'Planner', 'Collaborator', 'Viewer'])
    });

    const { projectId, email, role } = schema.parse(req.body);

    // Find user by email
    const user = await storage.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    // Check if user is already a collaborator
    const existing = await storage.getUserProjectRole(user.id, projectId);

    if (existing) {
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    // Add collaborator
    const newCollaborator = await storage.addCollaborator({
      projectId,
      userId: user.id,
      role,
      invitedBy: req.user!.id,
      status: 'active'
    });

    res.status(201).json(newCollaborator);
  } catch (error) {
    console.error('Error adding collaborator:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
});

// Update collaborator role
router.patch('/:id', authenticateUser, async (req, res) => {
  try {
    const collaboratorId = parseInt(req.params.id);
    const schema = z.object({
      role: z.enum(['Owner', 'Planner', 'Collaborator', 'Viewer'])
    });

    const { role } = schema.parse(req.body);

    const updated = await storage.updateCollaboratorRole(collaboratorId, role);

    if (!updated) {
      return res.status(404).json({ error: 'Collaborator not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating collaborator:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update collaborator' });
  }
});

// Remove collaborator
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const collaboratorId = parseInt(req.params.id);

    const success = await storage.removeCollaborator(collaboratorId);

    if (!success) {
      return res.status(404).json({ error: 'Collaborator not found' });
    }

    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

export default router;