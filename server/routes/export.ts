import { Router } from 'express';
import { getAllProjectData, generateExcelExport, sendExportEmail, generateTextSummary } from '../services/exportService';
import { requireAuth } from '../middleware/auth';
import { RequestWithUser } from '../types/express';
import { z } from 'zod';

const router = Router();

// Schema for export request
const exportRequestSchema = z.object({
  projectId: z.string().transform(Number),
  format: z.enum(['excel', 'email']),
  email: z.string().email().optional(),
});

// Get export data preview
router.get('/preview/:projectId', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    if (!projectId) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const data = await getAllProjectData(projectId);
    const summary = generateTextSummary(data);
    
    res.json({
      summary,
      stats: data.stats,
      itemCounts: {
        tasks: data.tasks.length,
        guests: data.guests.length,
        budgetItems: data.budgetItems.length,
        vendors: data.vendors.length,
        scheduleEvents: data.scheduleEvents.length,
        inspirationItems: data.inspirationItems.length
      }
    });
  } catch (error) {
    console.error('Export preview error:', error);
    res.status(500).json({ error: 'Failed to generate export preview' });
  }
});

// Download Excel export
router.get('/excel/:projectId', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    if (!projectId) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const data = await getAllProjectData(projectId);
    const excelBuffer = generateExcelExport(data);
    
    const fileName = `${data.project.name.replace(/[^a-zA-Z0-9]/g, '_')}_wedding_export.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to generate Excel export' });
  }
});

// Send email export
router.post('/email', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const { projectId, email } = exportRequestSchema.parse(req.body);
    
    const data = await getAllProjectData(projectId);
    const excelBuffer = generateExcelExport(data);
    
    const success = await sendExportEmail(
      email!,
      data.project.name,
      'excel',
      excelBuffer
    );
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Export email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send export email. Please check your email configuration.' 
      });
    }
  } catch (error) {
    console.error('Email export error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to send export email' });
    }
  }
});

// Get export statistics
router.get('/stats/:projectId', requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    if (!projectId) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const data = await getAllProjectData(projectId);
    
    res.json({
      projectName: data.project.name,
      weddingDate: data.project.date,
      stats: data.stats,
      lastExported: new Date().toISOString(),
      dataBreakdown: {
        tasks: {
          total: data.tasks.length,
          completed: data.tasks.filter(t => t.completed).length,
          pending: data.tasks.filter(t => !t.completed).length,
          overdue: data.tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length
        },
        guests: {
          total: data.guests.length,
          confirmed: data.guests.filter(g => g.rsvpStatus === 'confirmed').length,
          pending: data.guests.filter(g => g.rsvpStatus === 'pending').length,
          declined: data.guests.filter(g => g.rsvpStatus === 'declined').length
        },
        budget: {
          categories: [...new Set(data.budgetItems.map(b => b.category))].length,
          paidItems: data.budgetItems.filter(b => b.paymentStatus === 'paid').length,
          unpaidItems: data.budgetItems.filter(b => b.paymentStatus !== 'paid').length
        },
        vendors: {
          total: data.vendors.length,
          booked: data.vendors.filter(v => v.contractSigned).length,
          contacted: data.vendors.filter(v => v.status === 'contacted').length,
          researching: data.vendors.filter(v => v.status === 'researching').length
        }
      }
    });
  } catch (error) {
    console.error('Export stats error:', error);
    res.status(500).json({ error: 'Failed to get export statistics' });
  }
});

export default router;