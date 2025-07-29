import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { authenticateUser, requireAdmin, requireViewer } from '../middleware/auth';

const router = Router();

// Update collaborator role schema
const updateRoleSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer']),
});

// Get collaborators for a project
router.get('/project/:projectId', authenticateUser, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const collaborators = await storage.getCollaboratorsByProjectId(projectId);

    res.json({
      collaborators: collaborators.map(collab => ({
        id: collab.id,
        role: collab.role,
        status: collab.status,
        joinedAt: collab.joinedAt,
        user: {
          id: collab.user.id,
          username: collab.user.username,
          email: collab.user.email,
          firstName: collab.user.firstName,
          lastName: collab.user.lastName,
          avatar: collab.user.avatar,
        }
      }))
    });
  } catch (error) {
    console.error('Get collaborators error:', error);
    res.status(500).json({ error: 'Failed to get collaborators' });
  }
});

// Update collaborator role
router.patch('/:id/role', authenticateUser, async (req, res) => {
  try {
    const collaboratorId = parseInt(req.params.id);
    const { role } = updateRoleSchema.parse(req.body);
    
    const updatedCollaborator = await storage.updateCollaboratorRole(collaboratorId, role);
    
    if (!updatedCollaborator) {
      return res.status(404).json({ error: 'Collaborator not found' });
    }

    // Get collaborator details for logging
    const collaborators = await storage.getCollaboratorsByProjectId(updatedCollaborator.projectId);
    const collaborator = collaborators.find(c => c.id === collaboratorId);

    // Log activity
    await storage.logActivity({
      projectId: updatedCollaborator.projectId,
      userId: req.user!.id,
      action: `Changed ${collaborator?.user.username || 'user'}'s role to ${role}`,
      entityType: 'collaborator',
      entityId: collaboratorId,
      entityName: collaborator?.user.username || 'Unknown',
      details: { 
        oldRole: collaborator?.role, 
        newRole: role, 
        changedBy: req.user!.username 
      },
      isVisible: true,
    });

    res.json({
      message: 'Collaborator role updated successfully',
      collaborator: {
        id: updatedCollaborator.id,
        role: updatedCollaborator.role,
        updatedAt: updatedCollaborator.updatedAt,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Update collaborator role error:', error);
    res.status(500).json({ error: 'Failed to update collaborator role' });
  }
});

// Remove collaborator
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const collaboratorId = parseInt(req.params.id);
    
    // Get collaborator details before deletion for logging
    const projectId = parseInt(req.body.projectId);
    const collaborators = await storage.getCollaboratorsByProjectId(projectId);
    const collaborator = collaborators.find(c => c.id === collaboratorId);
    
    if (!collaborator) {
      return res.status(404).json({ error: 'Collaborator not found' });
    }

    // Prevent removing the last admin
    const adminCount = collaborators.filter(c => c.role === 'admin').length;
    if (collaborator.role === 'admin' && adminCount === 1) {
      return res.status(400).json({ 
        error: 'Cannot remove the last admin from the project' 
      });
    }

    const success = await storage.removeCollaborator(collaboratorId);
    
    if (!success) {
      return res.status(404).json({ error: 'Collaborator not found' });
    }

    // Log activity
    await storage.logActivity({
      projectId,
      userId: req.user!.id,
      action: `Removed ${collaborator.user.username} from project`,
      entityType: 'collaborator',
      entityId: collaboratorId,
      entityName: collaborator.user.username,
      details: { 
        removedRole: collaborator.role, 
        removedBy: req.user!.username 
      },
      isVisible: true,
    });

    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

// Get user's role in a project
router.get('/project/:projectId/my-role', authenticateUser, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const role = await storage.getUserProjectRole(req.user!.id, projectId);
    
    if (!role) {
      return res.status(403).json({ error: 'Not a collaborator on this project' });
    }

    res.json({ role });
  } catch (error) {
    console.error('Get user role error:', error);
    res.status(500).json({ error: 'Failed to get user role' });
  }
});

export default router;