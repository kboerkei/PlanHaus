import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { storage } from '../storage';
import { authenticateUser, requireAdmin } from '../middleware/auth';
import { insertInvitationSchema } from '@shared/schema';

const router = Router();

// Invitation creation schema
const createInvitationSchema = z.object({
  projectId: z.number(),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']),
});

// Accept invitation schema
const acceptInvitationSchema = z.object({
  token: z.string(),
});

// Create invitation
router.post('/', authenticateUser, async (req, res) => {
  try {
    const validatedData = createInvitationSchema.parse(req.body);
    
    // Check if user is already a collaborator
    const existingCollaborators = await storage.getCollaboratorsByProjectId(validatedData.projectId);
    const alreadyCollaborator = existingCollaborators.find(c => c.user.email === validatedData.email);
    
    if (alreadyCollaborator) {
      return res.status(400).json({ error: 'User is already a collaborator on this project' });
    }

    // Check for existing pending invitation
    const existingInvitations = await storage.getInvitationsByProjectId(validatedData.projectId);
    const pendingInvitation = existingInvitations.find(
      i => i.email === validatedData.email && i.status === 'pending'
    );

    if (pendingInvitation) {
      return res.status(400).json({ error: 'Invitation already sent to this email' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitationData = {
      projectId: validatedData.projectId,
      email: validatedData.email,
      role: validatedData.role,
      token,
      invitedBy: req.user!.id,
      status: 'pending',
      expiresAt,
    };

    const invitation = await storage.createInvitation(invitationData);

    // Log activity
    await storage.logActivity({
      projectId: validatedData.projectId,
      userId: req.user!.id,
      action: `Invited ${validatedData.email} as ${validatedData.role}`,
      entityType: 'invitation',
      entityId: invitation.id,
      entityName: validatedData.email,
      details: { role: validatedData.role, invitedBy: req.user!.username },
      isVisible: true,
    });

    // In a real app, you would send an email here
    // For now, return the invitation link
    const inviteLink = `${req.protocol}://${req.get('host')}/invite/${token}`;

    res.status(201).json({
      message: 'Invitation created successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        inviteLink, // In production, this would be sent via email
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Create invitation error:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
});

// Get invitations for a project
router.get('/project/:projectId', authenticateUser, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const invitations = await storage.getInvitationsByProjectId(projectId);

    res.json({
      invitations: invitations.map(inv => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        status: inv.status,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      }))
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Failed to get invitations' });
  }
});

// Get invitation details by token (public endpoint for invite preview)
router.get('/preview/:token', async (req, res) => {
  try {
    const invitation = await storage.getInvitationByToken(req.params.token);
    
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation is no longer valid' });
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    // Get project details
    const project = await storage.getWeddingProjectById(invitation.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get inviter details
    const inviter = await storage.getUserById(invitation.invitedBy);

    res.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
      project: {
        name: project.name,
        date: project.date,
        venue: project.venue,
      },
      inviter: {
        username: inviter?.username || 'Unknown',
        firstName: inviter?.firstName,
        lastName: inviter?.lastName,
      }
    });
  } catch (error) {
    console.error('Preview invitation error:', error);
    res.status(500).json({ error: 'Failed to get invitation details' });
  }
});

// Accept invitation
router.post('/accept', authenticateUser, async (req, res) => {
  try {
    const { token } = acceptInvitationSchema.parse(req.body);
    
    const result = await storage.acceptInvitation(token, req.user!.id);
    
    if (!result.success) {
      return res.status(400).json({ error: 'Failed to accept invitation' });
    }

    // Log activity
    await storage.logActivity({
      projectId: result.collaborator!.projectId,
      userId: req.user!.id,
      action: `${req.user!.username} joined as ${result.collaborator!.role}`,
      entityType: 'collaborator',
      entityId: result.collaborator!.id,
      entityName: req.user!.username,
      details: { role: result.collaborator!.role, joinedAt: new Date() },
      isVisible: true,
    });

    res.json({
      message: 'Invitation accepted successfully',
      collaborator: {
        id: result.collaborator!.id,
        role: result.collaborator!.role,
        projectId: result.collaborator!.projectId,
        joinedAt: result.collaborator!.joinedAt,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Accept invitation error:', error);
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

    // Log activity
    await storage.logActivity({
      projectId: req.body.projectId || 0,
      userId: req.user!.id,
      action: 'Cancelled invitation',
      entityType: 'invitation',
      entityId: invitationId,
      entityName: 'Invitation',
      details: { cancelledBy: req.user!.username },
      isVisible: true,
    });

    res.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(500).json({ error: 'Failed to cancel invitation' });
  }
});

export default router;