import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { requireAuthCookie } from "../middleware/cookieAuth";
import { validateBody } from "../utils/validation";
import { getOrCreateDefaultProject, ensureProjectAccess } from "../utils/projects";
import { logError, logInfo } from "../utils/logger";
import { RequestWithUser } from "../types/express";
import { insertGuestSchema, updateGuestSchema } from "@shared/schema";

const router = Router();

router.get("/", requireAuthCookie, async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as RequestWithUser;
  try {
    const project = await getOrCreateDefaultProject(authReq.userId);
    const guests = await storage.getGuestsByProjectId(project.id);
    
    res.json(guests);
  } catch (error) {
    logError('guests', error as Error, { userId: authReq.userId });
    res.status(500).json({ message: "Failed to fetch guests" });
  }
});

router.get("/project/:projectId", requireAuthCookie, async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as RequestWithUser;
  try {
    const projectId = parseInt(authReq.params.projectId);
    await ensureProjectAccess(authReq.userId, projectId);
    
    const guests = await storage.getGuestsByProjectId(projectId);
    res.json(guests);
  } catch (error) {
    logError('guests', error as Error, { userId: authReq.userId, projectId: authReq.params.projectId });
    
    if ((error as Error).message.includes('not found')) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.status(500).json({ message: "Failed to fetch guests" });
  }
});

router.post("/", requireAuthCookie, validateBody(insertGuestSchema), async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as RequestWithUser;
  try {
    let projectId = authReq.body.projectId;
    
    if (!projectId) {
      const project = await getOrCreateDefaultProject(authReq.userId);
      projectId = project.id;
    } else {
      await ensureProjectAccess(authReq.userId, projectId);
    }

    const guestData = { ...authReq.body, projectId };
    const guest = await storage.createGuest(guestData);
    
    logInfo('guests', `Guest added: ${guest.name}`, { userId: authReq.userId, projectId });
    
    res.status(201).json(guest);
  } catch (error) {
    logError('guests', error as Error, { userId: authReq.userId });
    
    if ((error as Error).message.includes('not found')) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.status(500).json({ message: "Failed to add guest" });
  }
});

router.get("/:id", requireAuthCookie, async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as RequestWithUser;
  try {
    const guestId = parseInt(authReq.params.id);
    const guest = await storage.getGuestById(guestId);
    
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    await ensureProjectAccess(authReq.userId, guest.projectId);
    
    res.json(guest);
  } catch (error) {
    logError('guests', error as Error, { userId: authReq.userId, guestId: authReq.params.id });
    
    if ((error as Error).message.includes('not found')) {
      return res.status(404).json({ message: "Guest or project not found" });
    }
    
    res.status(500).json({ message: "Failed to fetch guest" });
  }
});

router.put("/:id", requireAuthCookie, validateBody(updateGuestSchema), async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as RequestWithUser;
  try {
    const guestId = parseInt(authReq.params.id);
    const guest = await storage.getGuestById(guestId);
    
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    await ensureProjectAccess(authReq.userId, guest.projectId);

    const updatedGuest = await storage.updateGuest(guestId, authReq.body);
    
    logInfo('guests', `Guest updated: ${guestId}`, { userId: authReq.userId });
    
    res.json(updatedGuest);
  } catch (error) {
    logError('guests', error as Error, { userId: authReq.userId, guestId: authReq.params.id });
    
    if ((error as Error).message.includes('not found')) {
      return res.status(404).json({ message: "Guest or project not found" });
    }
    
    res.status(500).json({ message: "Failed to update guest" });
  }
});

router.delete("/:id", requireAuthCookie, async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as RequestWithUser;
  try {
    const guestId = parseInt(authReq.params.id);
    const guest = await storage.getGuestById(guestId);
    
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    await ensureProjectAccess(authReq.userId, guest.projectId);

    await storage.deleteGuest(guestId);
    
    logInfo('guests', `Guest deleted: ${guestId}`, { userId: authReq.userId });
    
    res.json({ message: "Guest deleted successfully" });
  } catch (error) {
    logError('guests', error as Error, { userId: authReq.userId, guestId: authReq.params.id });
    
    if ((error as Error).message.includes('not found')) {
      return res.status(404).json({ message: "Guest or project not found" });
    }
    
    res.status(500).json({ message: "Failed to delete guest" });
  }
});

router.patch("/bulk-update", requireAuthCookie, async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as RequestWithUser;
  try {
    const { guestIds, updates } = authReq.body;
    
    if (!Array.isArray(guestIds) || guestIds.length === 0) {
      return res.status(400).json({ message: "Guest IDs array is required" });
    }

    // Verify all guests belong to projects the user has access to
    for (const guestId of guestIds) {
      const guest = await storage.getGuestById(guestId);
      if (!guest) {
        return res.status(404).json({ message: `Guest ${guestId} not found` });
      }
      await ensureProjectAccess(authReq.userId, guest.projectId);
    }

    // Update all guests
    const updatedGuests = [];
    for (const guestId of guestIds) {
      const updatedGuest = await storage.updateGuest(guestId, updates);
      updatedGuests.push(updatedGuest);
    }
    
    logInfo('guests', `Bulk updated ${guestIds.length} guests`, { userId: authReq.userId });
    
    res.json(updatedGuests);
  } catch (error) {
    logError('guests', error as Error, { userId: authReq.userId });
    
    if ((error as Error).message.includes('not found')) {
      return res.status(404).json({ message: "Guest or project not found" });
    }
    
    res.status(500).json({ message: "Failed to bulk update guests" });
  }
});

export default router;