import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../utils/validation";
import { getOrCreateDefaultProject, ensureProjectAccess } from "../utils/projects";
import { logError, logInfo } from "../utils/logger";
import { RequestWithUser } from "../types/express";
import { insertVendorSchema } from "@shared/schema";

const router = Router();

router.get("/", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const project = await getOrCreateDefaultProject(req.userId);
    const vendors = await storage.getVendorsByProjectId(project.id);
    
    res.json(vendors);
  } catch (error) {
    logError('vendors', error, { userId: req.userId });
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
});

router.get("/project/:projectId", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    await ensureProjectAccess(req.userId, projectId);
    
    const vendors = await storage.getVendorsByProjectId(projectId);
    res.json(vendors);
  } catch (error) {
    logError('vendors', error, { userId: req.userId, projectId: req.params.projectId });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
});

router.post("/", requireAuth, validateBody(insertVendorSchema), async (req: RequestWithUser, res) => {
  try {
    let projectId = req.body.projectId;
    
    if (!projectId) {
      const project = await getOrCreateDefaultProject(req.userId);
      projectId = project.id;
    } else {
      await ensureProjectAccess(req.userId, projectId);
    }

    const vendorData = { ...req.body, projectId };
    const vendor = await storage.createVendor(vendorData);
    
    logInfo('vendors', `Vendor added: ${vendor.name}`, { userId: req.userId, projectId });
    
    res.status(201).json(vendor);
  } catch (error) {
    logError('vendors', error, { userId: req.userId });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.status(500).json({ message: "Failed to add vendor" });
  }
});

router.put("/:id", requireAuth, validateBody(insertVendorSchema.partial()), async (req: RequestWithUser, res) => {
  try {
    const vendorId = parseInt(req.params.id);
    const vendor = await storage.getVendorById(vendorId);
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await ensureProjectAccess(req.userId, vendor.projectId);

    const updatedVendor = await storage.updateVendor(vendorId, req.body);
    
    logInfo('vendors', `Vendor updated: ${vendorId}`, { userId: req.userId });
    
    res.json(updatedVendor);
  } catch (error) {
    logError('vendors', error, { userId: req.userId, vendorId: req.params.id });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Vendor or project not found" });
    }
    
    res.status(500).json({ message: "Failed to update vendor" });
  }
});

router.delete("/:id", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const vendorId = parseInt(req.params.id);
    const vendor = await storage.getVendorById(vendorId);
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await ensureProjectAccess(req.userId, vendor.projectId);

    await storage.deleteVendor(vendorId);
    
    logInfo('vendors', `Vendor deleted: ${vendorId}`, { userId: req.userId });
    
    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    logError('vendors', error, { userId: req.userId, vendorId: req.params.id });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Vendor or project not found" });
    }
    
    res.status(500).json({ message: "Failed to delete vendor" });
  }
});

export default router;