import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage.js';
import { authenticateUser } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();

// Get invitations for a project
router.get('/', authenticateUser, async (req, res) => {
  try {
    const projectId = parseInt(req.query.projectId as string) || 1;
    const invitations = await storage.getInvitationsByProjectId(projectId);
    res.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Create invitation
router.post('/', authenticateUser, async (req, res) => {
  try {
    const schema = z.object({
      projectId: z.number().optional(),
      email: z.string().email(),
      role: z.enum(['Owner', 'Planner', 'Collaborator', 'Viewer'])
    });

    const data = schema.parse(req.body);
    const projectId = data.projectId || 1;

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await storage.createInvitation({
      projectId,
      email: data.email,
      role: data.role,
      token,
      expiresAt,
      invitedBy: req.user!.id,
      status: 'pending'
    });

    // In a real app, you would send email here
    // For now, we'll create a demo notification
    console.log(`Invitation sent to ${data.email} with token: ${token}`);

    res.status(201).json(invitation);
  } catch (error) {
    console.error('Error creating invitation:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create invitation' });
  }
});

// Accept invitation
router.post('/accept/:token', authenticateUser, async (req, res) => {
  try {
    const token = req.params.token;
    const result = await storage.acceptInvitation(token, req.user!.id);

    if (!result.success) {
      return res.status(400).json({ error: 'Invalid or expired invitation' });
    }

    res.json({ 
      message: 'Invitation accepted successfully',
      collaborator: result.collaborator
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Cancel invitation
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const invitationId = parseInt(req.params.id);
    const success = await storage.cancelInvitation(invitationId);

    if (!success) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    res.status(500).json({ error: 'Failed to cancel invitation' });
  }
});

export default router;