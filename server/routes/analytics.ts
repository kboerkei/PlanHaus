import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { storage } from '../storage';
import { getOrCreateDefaultProject } from '../utils/projects';
import { logError, logInfo } from '../utils/logger';

const router = express.Router();

// Validation schemas
const analyticsQuerySchema = z.object({
  projectId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

// Get KPIs data
router.get('/kpis', requireAuth, async (req: any, res) => {
  try {
    const { projectId, from, to } = analyticsQuerySchema.parse(req.query);
    
    const project = projectId 
      ? await storage.getWeddingProjectById(parseInt(projectId))
      : await getOrCreateDefaultProject(req.userId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get all data for stats calculation
    const [tasks, guests, budget, vendors] = await Promise.all([
      storage.getTasksByProjectId(project.id),
      storage.getGuestsByProjectId(project.id),
      storage.getBudgetItemsByProjectId(project.id),
      storage.getVendorsByProjectId(project.id)
    ]);

    // Calculate KPIs
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
    const tasksDueThisWeek = tasks.filter((t: any) => {
      if (t.status === 'open' && t.dueDate) {
        const dueDate = new Date(t.dueDate);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dueDate >= now && dueDate <= weekFromNow;
      }
      return false;
    }).length;
    
    const totalGuests = guests.length;
    const confirmedGuests = guests.filter((g: any) => g.rsvpStatus === 'yes').length;
    
    const totalBudget = budget.reduce((sum: number, item: any) => sum + parseFloat(item.estimatedCost || '0'), 0);
    const spentBudget = budget.reduce((sum: number, item: any) => sum + parseFloat(item.actualCost || '0'), 0);
    
    const totalVendors = vendors.length;
    const bookedVendors = vendors.filter((v: any) => v.status === 'booked').length;
    
    const daysUntilWedding = project.date 
      ? Math.max(0, Math.ceil((new Date(project.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    // Calculate deltas (simplified - could be more sophisticated)
    const budgetDelta = totalBudget > 0 ? ((spentBudget - totalBudget) / totalBudget) * 100 : 0;
    const taskProgressDelta = totalTasks > 0 ? ((completedTasks - (totalTasks / 2)) / (totalTasks / 2)) * 100 : 0;

    res.json({
      budget: {
        total: totalBudget,
        spent: spentBudget,
        delta: {
          value: budgetDelta,
          label: `${budgetDelta > 0 ? '+' : ''}${budgetDelta.toFixed(1)}%`,
          positive: budgetDelta <= 0
        }
      },
      daysUntilWedding: {
        value: daysUntilWedding,
        delta: {
          value: -1,
          label: '1 day closer',
          positive: false
        }
      },
      tasksDueThisWeek: {
        value: tasksDueThisWeek,
        delta: {
          value: 0,
          label: 'No change',
          positive: true
        }
      },
      vendorsBooked: {
        value: bookedVendors,
        delta: {
          value: 0,
          label: 'No change',
          positive: true
        }
      }
    });
  } catch (error) {
    logError('analytics-kpis', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
});

// Get budget data
router.get('/budget', requireAuth, async (req: any, res) => {
  try {
    const { projectId } = analyticsQuerySchema.parse(req.query);
    
    const project = projectId 
      ? await storage.getWeddingProjectById(parseInt(projectId))
      : await getOrCreateDefaultProject(req.userId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const budgetItems = await storage.getBudgetItemsByProjectId(project.id);
    
    const total = budgetItems.reduce((sum: number, item: any) => sum + parseFloat(item.estimatedCost || '0'), 0);
    const spent = budgetItems.reduce((sum: number, item: any) => sum + parseFloat(item.actualCost || '0'), 0);
    
    // Group by category
    const categories = budgetItems.map((item: any) => ({
      name: item.category || 'Other',
      estimatedCost: item.estimatedCost || '0',
      actualCost: item.actualCost || '0'
    }));

    res.json({
      total,
      spent,
      categories
    });
  } catch (error) {
    logError('analytics-budget', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch budget data' });
  }
});

// Get timeline data
router.get('/timeline', requireAuth, async (req: any, res) => {
  try {
    const { projectId, from, to } = analyticsQuerySchema.parse(req.query);
    
    const project = projectId 
      ? await storage.getWeddingProjectById(parseInt(projectId))
      : await getOrCreateDefaultProject(req.userId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = await storage.getTasksByProjectId(project.id);
    
    // Transform tasks to the format expected by the timeline adapter
    const transformedTasks = tasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      status: task.status as 'open' | 'completed',
      dueDate: task.dueDate,
      createdAt: task.createdAt || new Date().toISOString()
    }));

    res.json(transformedTasks);
  } catch (error) {
    logError('analytics-timeline', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch timeline data' });
  }
});

// Get vendors data
router.get('/vendors', requireAuth, async (req: any, res) => {
  try {
    const { projectId } = analyticsQuerySchema.parse(req.query);
    
    const project = projectId 
      ? await storage.getWeddingProjectById(parseInt(projectId))
      : await getOrCreateDefaultProject(req.userId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const vendors = await storage.getVendorsByProjectId(project.id);
    
    // Transform vendors to the format expected by the vendor adapter
    const transformedVendors = vendors.map((vendor: any) => ({
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      status: vendor.status as 'contacted' | 'shortlisted' | 'booked' | 'declined',
      email: vendor.email,
      phone: vendor.phone,
      estimatedCost: vendor.estimatedCost,
      actualCost: vendor.actualCost
    }));

    res.json(transformedVendors);
  } catch (error) {
    logError('analytics-vendors', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to fetch vendors data' });
  }
});

export default router; 