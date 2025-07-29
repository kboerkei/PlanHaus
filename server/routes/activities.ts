import { Router } from 'express';
import { storage } from '../storage';
import { authenticateUser, requireViewer } from '../middleware/auth';

const router = Router();

// Get activities for a project
router.get('/project/:projectId', authenticateUser, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const includeInvisible = req.query.includeInvisible === 'true';

    const activities = await storage.getActivitiesByProjectId(
      projectId, 
      limit, 
      offset, 
      includeInvisible
    );

    // Get user details for each activity
    const activitiesWithUsers = await Promise.all(
      activities.map(async (activity) => {
        const user = await storage.getUserById(activity.userId);
        return {
          id: activity.id,
          action: activity.action,
          entityType: activity.entityType,
          entityId: activity.entityId,
          entityName: activity.entityName,
          details: activity.details,
          timestamp: activity.timestamp,
          user: {
            id: user?.id,
            username: user?.username,
            firstName: user?.firstName,
            lastName: user?.lastName,
            avatar: user?.avatar,
          }
        };
      })
    );

    res.json({
      activities: activitiesWithUsers,
      pagination: {
        limit,
        offset,
        hasMore: activities.length === limit, // Simple check, could be improved
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

// Get recent activities for dashboard
router.get('/project/:projectId/recent', authenticateUser, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const activities = await storage.getActivitiesByProjectId(projectId, 10); // Last 10 activities

    // Get user details for each activity
    const activitiesWithUsers = await Promise.all(
      activities.map(async (activity) => {
        const user = await storage.getUserById(activity.userId);
        return {
          id: activity.id,
          action: activity.action,
          entityType: activity.entityType,
          entityName: activity.entityName,
          timestamp: activity.timestamp,
          user: {
            username: user?.username,
            firstName: user?.firstName,
            lastName: user?.lastName,
            avatar: user?.avatar,
          }
        };
      })
    );

    res.json({ activities: activitiesWithUsers });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ error: 'Failed to get recent activities' });
  }
});

// Get activity statistics for a project
router.get('/project/:projectId/stats', authenticateUser, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const days = parseInt(req.query.days as string) || 30;
    
    const stats = await storage.getActivityStats(projectId, days);

    res.json({ stats });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ error: 'Failed to get activity statistics' });
  }
});

export default router;