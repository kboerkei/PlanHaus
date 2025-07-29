import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../utils/validation";
import { insertCreativeDetailSchema, type CreativeDetail, type InsertCreativeDetail } from "@shared/schema";
import { logInfo, logError } from "../utils/logger";
import { RequestWithUser } from "../types/express";
import { getOrCreateDefaultProject } from "../utils/projects";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Get all creative details for a project
router.get("/", requireAuth, async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.userId;
    
    // Get user's current project
    const project = await getOrCreateDefaultProject(userId);
    const details = await storage.getCreativeDetails(project.id);
    
    logInfo('creative-details', `Retrieved ${details.length} creative details for project ${project.id}`);
    res.json(details);
  } catch (error) {
    logError('creative-details', 'Failed to fetch creative details', { error });
    res.status(500).json({ error: "Failed to fetch creative details" });
  }
});

// Create a new creative detail
router.post("/", requireAuth, validateBody(insertCreativeDetailSchema), async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.userId;
    const data = req.body as InsertCreativeDetail;
    
    // Get user's current project
    const project = await getOrCreateDefaultProject(userId);
    
    // Create the creative detail
    const creativeDetail = await storage.createCreativeDetail({
      ...data,
      projectId: project.id,
      createdBy: userId,
    });
    
    // Log activity
    await storage.createActivity({
      projectId: project.id,
      userId,
      action: 'created',
      entityType: 'creative_detail',
      entityId: creativeDetail.id,
      entityName: creativeDetail.title,
      details: { category: creativeDetail.category },
      isVisible: true,
    });
    
    logInfo('creative-details', `Created creative detail: ${creativeDetail.title}`, { creativeDetailId: creativeDetail.id });
    res.status(201).json(creativeDetail);
  } catch (error) {
    logError('creative-details', 'Failed to create creative detail', { error });
    res.status(500).json({ error: "Failed to create creative detail" });
  }
});

// Update a creative detail
router.put("/:id", requireAuth, validateBody(insertCreativeDetailSchema), async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.userId;
    const detailId = parseInt(req.params.id);
    const data = req.body as Partial<InsertCreativeDetail>;
    
    if (isNaN(detailId)) {
      return res.status(400).json({ error: "Invalid creative detail ID" });
    }
    
    // Get the existing detail to verify ownership
    const existingDetail = await storage.getCreativeDetailById(detailId);
    if (!existingDetail) {
      return res.status(404).json({ error: "Creative detail not found" });
    }
    
    // Verify user has access to this project
    const projects = await storage.getProjects(userId);
    const hasAccess = projects.some(p => p.id === existingDetail.projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const updatedDetail = await storage.updateCreativeDetail(detailId, data);
    
    // Log activity
    await storage.createActivity({
      projectId: existingDetail.projectId,
      userId,
      action: 'updated',
      entityType: 'creative_detail',
      entityId: detailId,
      entityName: updatedDetail.title,
      details: { category: updatedDetail.category },
      isVisible: true,
    });
    
    logInfo('creative-details', `Updated creative detail: ${updatedDetail.title}`, { creativeDetailId: detailId });
    res.json(updatedDetail);
  } catch (error) {
    logError('creative-details', 'Failed to update creative detail', { error });
    res.status(500).json({ error: "Failed to update creative detail" });
  }
});

// Delete a creative detail
router.delete("/:id", requireAuth, async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.userId;
    const detailId = parseInt(req.params.id);
    
    if (isNaN(detailId)) {
      return res.status(400).json({ error: "Invalid creative detail ID" });
    }
    
    // Get the existing detail to verify ownership
    const existingDetail = await storage.getCreativeDetailById(detailId);
    if (!existingDetail) {
      return res.status(404).json({ error: "Creative detail not found" });
    }
    
    // Verify user has access to this project
    const projects = await storage.getProjects(userId);
    const hasAccess = projects.some(p => p.id === existingDetail.projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    await storage.deleteCreativeDetail(detailId);
    
    // Clean up any uploaded files
    if (existingDetail.imageUrl || existingDetail.fileUrl) {
      try {
        if (existingDetail.imageUrl && existingDetail.imageUrl.startsWith('/uploads/')) {
          const imagePath = path.join(process.cwd(), existingDetail.imageUrl);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
        if (existingDetail.fileUrl && existingDetail.fileUrl.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), existingDetail.fileUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (fileError) {
        logError('creative-details', 'Failed to delete files', { fileError });
      }
    }
    
    // Log activity
    await storage.createActivity({
      projectId: existingDetail.projectId,
      userId,
      action: 'deleted',
      entityType: 'creative_detail',
      entityId: detailId,
      entityName: existingDetail.title,
      details: { category: existingDetail.category },
      isVisible: true,
    });
    
    logInfo('creative-details', `Deleted creative detail: ${existingDetail.title}`, { creativeDetailId: detailId });
    res.json({ success: true });
  } catch (error) {
    logError('creative-details', 'Failed to delete creative detail', { error });
    res.status(500).json({ error: "Failed to delete creative detail" });
  }
});

// Upload file for a creative detail
router.post("/upload", requireAuth, upload.single('file'), async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.userId;
    const file = req.file;
    const detailId = parseInt(req.body.detailId);
    
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    if (isNaN(detailId)) {
      return res.status(400).json({ error: "Invalid creative detail ID" });
    }
    
    // Get the existing detail to verify ownership
    const existingDetail = await storage.getCreativeDetailById(detailId);
    if (!existingDetail) {
      return res.status(404).json({ error: "Creative detail not found" });
    }
    
    // Verify user has access to this project
    const projects = await storage.getProjects(userId);
    const hasAccess = projects.some(p => p.id === existingDetail.projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Move file to permanent location
    const fileExtension = path.extname(file.originalname);
    const fileName = `creative_${detailId}_${Date.now()}${fileExtension}`;
    const filePath = path.join('uploads', fileName);
    const fullPath = path.join(process.cwd(), filePath);
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    fs.renameSync(file.path, fullPath);
    
    // Determine if it's an image or other file
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname);
    const fileUrl = `/${filePath}`;
    
    // Update the creative detail with file information
    const updateData: Partial<InsertCreativeDetail> = {
      fileName: file.originalname,
    };
    
    if (isImage) {
      updateData.imageUrl = fileUrl;
    } else {
      updateData.fileUrl = fileUrl;
    }
    
    const updatedDetail = await storage.updateCreativeDetail(detailId, updateData);
    
    logInfo('creative-details', `Uploaded file for creative detail: ${file.originalname}`, { 
      creativeDetailId: detailId,
      fileName: file.originalname,
      fileSize: file.size
    });
    
    res.json({
      success: true,
      fileName: file.originalname,
      fileUrl: fileUrl,
      isImage: isImage,
      detail: updatedDetail
    });
  } catch (error) {
    logError('creative-details', 'Failed to upload file', { error });
    res.status(500).json({ error: "Failed to upload file" });
  }
});

export default router;