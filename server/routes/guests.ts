import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../utils/validation";
import { getOrCreateDefaultProject, ensureProjectAccess } from "../utils/projects";
import { logError, logInfo } from "../utils/logger";
import { RequestWithUser } from "../types/express";
import { insertGuestSchema } from "@shared/schema";

const router = Router();

router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
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

router.get("/project/:projectId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
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

router.post("/", requireAuth, validateBody(insertGuestSchema), async (req: Request, res: Response, next: NextFunction) => {
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

router.put("/:id", requireAuth, validateBody(insertGuestSchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
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

router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
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

export default router;