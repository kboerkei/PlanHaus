import express from 'express';
import multer from 'multer';
import { z } from 'zod';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow CSV, Excel, and JSON files
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/json'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, Excel, and JSON files are allowed.'));
    }
  },
});

// Validation schema for import request
const importRequestSchema = z.object({
  type: z.enum(['guest', 'task', 'budget', 'vendor']),
});

// Handle file import
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type } = importRequestSchema.parse(req.body);
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    // Process file based on type
    const result = await processImportFile(type, fileBuffer, fileName);

    res.json({
      success: true,
      message: `Successfully imported ${result.count} ${type} records`,
      data: result.data,
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      error: 'Import failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Process imported file based on type
async function processImportFile(type: string, fileBuffer: Buffer, fileName: string) {
  const fileContent = fileBuffer.toString('utf-8');
  
  switch (type) {
    case 'guest':
      return processGuestImport(fileContent, fileName);
    case 'task':
      return processTaskImport(fileContent, fileName);
    case 'budget':
      return processBudgetImport(fileContent, fileName);
    case 'vendor':
      return processVendorImport(fileContent, fileName);
    default:
      throw new Error(`Unsupported import type: ${type}`);
  }
}

// Process guest import
async function processGuestImport(content: string, fileName: string) {
  try {
    let guests = [];
    
    if (fileName.endsWith('.json')) {
      guests = JSON.parse(content);
    } else if (fileName.endsWith('.csv')) {
      // Simple CSV parsing (in production, use a proper CSV parser)
      const lines = content.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      guests = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const guest: any = {};
        headers.forEach((header, index) => {
          guest[header] = values[index] || '';
        });
        return guest;
      });
    }
    
    // Validate and transform guest data
    const validGuests = guests.filter(guest => guest.name && guest.email);
    
    return {
      count: validGuests.length,
      data: validGuests,
    };
  } catch (error) {
    throw new Error(`Failed to process guest import: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Process task import
async function processTaskImport(content: string, fileName: string) {
  try {
    let tasks = [];
    
    if (fileName.endsWith('.json')) {
      tasks = JSON.parse(content);
    } else if (fileName.endsWith('.csv')) {
      const lines = content.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      tasks = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const task: any = {};
        headers.forEach((header, index) => {
          task[header] = values[index] || '';
        });
        return task;
      });
    }
    
    const validTasks = tasks.filter(task => task.title);
    
    return {
      count: validTasks.length,
      data: validTasks,
    };
  } catch (error) {
    throw new Error(`Failed to process task import: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Process budget import
async function processBudgetImport(content: string, fileName: string) {
  try {
    let budgetItems = [];
    
    if (fileName.endsWith('.json')) {
      budgetItems = JSON.parse(content);
    } else if (fileName.endsWith('.csv')) {
      const lines = content.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      budgetItems = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const item: any = {};
        headers.forEach((header, index) => {
          item[header] = values[index] || '';
        });
        return item;
      });
    }
    
    const validItems = budgetItems.filter(item => item.name && item.amount);
    
    return {
      count: validItems.length,
      data: validItems,
    };
  } catch (error) {
    throw new Error(`Failed to process budget import: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Process vendor import
async function processVendorImport(content: string, fileName: string) {
  try {
    let vendors = [];
    
    if (fileName.endsWith('.json')) {
      vendors = JSON.parse(content);
    } else if (fileName.endsWith('.csv')) {
      const lines = content.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      vendors = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const vendor: any = {};
        headers.forEach((header, index) => {
          vendor[header] = values[index] || '';
        });
        return vendor;
      });
    }
    
    const validVendors = vendors.filter(vendor => vendor.name);
    
    return {
      count: validVendors.length,
      data: validVendors,
    };
  } catch (error) {
    throw new Error(`Failed to process vendor import: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export default router; 