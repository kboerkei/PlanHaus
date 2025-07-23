import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../utils/validation";
import { getOrCreateDefaultProject, ensureProjectAccess } from "../utils/projects";
import { logError, logInfo } from "../utils/logger";
import { RequestWithUser } from "../types/express";
import { insertGuestSchema } from "@shared/schema";

const router = Router();

router.get("/", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const project = await getOrCreateDefaultProject(req.userId);
    const guests = await storage.getGuestsByProjectId(project.id);
    
    res.json(guests);
  } catch (error) {
    logError('guests', error, { userId: req.userId });
    res.status(500).json({ message: "Failed to fetch guests" });
  }
});

router.get("/project/:projectId", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    await ensureProjectAccess(req.userId, projectId);
    
    const guests = await storage.getGuestsByProjectId(projectId);
    res.json(guests);
  } catch (error) {
    logError('guests', error, { userId: req.userId, projectId: req.params.projectId });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.status(500).json({ message: "Failed to fetch guests" });
  }
});

router.post("/", requireAuth, validateBody(insertGuestSchema), async (req: RequestWithUser, res) => {
  try {
    let projectId = req.body.projectId;
    
    if (!projectId) {
      const project = await getOrCreateDefaultProject(req.userId);
      projectId = project.id;
    } else {
      await ensureProjectAccess(req.userId, projectId);
    }

    const guestData = { ...req.body, projectId };
    const guest = await storage.createGuest(guestData);
    
    logInfo('guests', `Guest added: ${guest.name}`, { userId: req.userId, projectId });
    
    res.status(201).json(guest);
  } catch (error) {
    logError('guests', error, { userId: req.userId });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.status(500).json({ message: "Failed to add guest" });
  }
});

router.put("/:id", requireAuth, validateBody(insertGuestSchema.partial()), async (req: RequestWithUser, res) => {
  try {
    const guestId = parseInt(req.params.id);
    const guest = await storage.getGuestById(guestId);
    
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    await ensureProjectAccess(req.userId, guest.projectId);

    const updatedGuest = await storage.updateGuest(guestId, req.body);
    
    logInfo('guests', `Guest updated: ${guestId}`, { userId: req.userId });
    
    res.json(updatedGuest);
  } catch (error) {
    logError('guests', error, { userId: req.userId, guestId: req.params.id });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Guest or project not found" });
    }
    
    res.status(500).json({ message: "Failed to update guest" });
  }
});

router.delete("/:id", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const guestId = parseInt(req.params.id);
    const guest = await storage.getGuestById(guestId);
    
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    await ensureProjectAccess(req.userId, guest.projectId);

    await storage.deleteGuest(guestId);
    
    logInfo('guests', `Guest deleted: ${guestId}`, { userId: req.userId });
    
    res.json({ message: "Guest deleted successfully" });
  } catch (error) {
    logError('guests', error, { userId: req.userId, guestId: req.params.id });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Guest or project not found" });
    }
    
    res.status(500).json({ message: "Failed to delete guest" });
  }
});

export default router;