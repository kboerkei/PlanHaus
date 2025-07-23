import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../utils/validation";
import { getOrCreateDefaultProject, ensureProjectAccess } from "../utils/projects";
import { logError, logInfo } from "../utils/logger";
import { RequestWithUser } from "../types/express";
import { insertBudgetItemSchema } from "@shared/schema";
import { websocketService } from "../services/websocket";

const router = Router();

router.get("/", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const project = await getOrCreateDefaultProject(req.userId);
    const budgetItems = await storage.getBudgetItemsByProjectId(project.id);
    
    res.json(budgetItems);
  } catch (error) {
    logError('budget', error, { userId: req.userId });
    res.status(500).json({ message: "Failed to fetch budget items" });
  }
});

router.get("/project/:projectId", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    await ensureProjectAccess(req.userId, projectId);
    
    const budgetItems = await storage.getBudgetItemsByProjectId(projectId);
    res.json(budgetItems);
  } catch (error) {
    logError('budget', error, { userId: req.userId, projectId: req.params.projectId });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.status(500).json({ message: "Failed to fetch budget items" });
  }
});

router.post("/", requireAuth, validateBody(insertBudgetItemSchema), async (req: RequestWithUser, res) => {
  try {
    let projectId = req.body.projectId;
    
    if (!projectId) {
      const project = await getOrCreateDefaultProject(req.userId);
      projectId = project.id;
    } else {
      await ensureProjectAccess(req.userId, projectId);
    }

    const budgetData = { ...req.body, projectId };
    const budgetItem = await storage.createBudgetItem(budgetData);
    
    // WebSocket notification for budget updates
    websocketService.broadcastToProject(projectId, {
      type: 'budget_item_created',
      budgetItem,
      userId: req.userId
    });
    
    logInfo('budget', `Budget item added: ${budgetItem.item}`, { userId: req.userId, projectId });
    
    res.status(201).json(budgetItem);
  } catch (error) {
    logError('budget', error, { userId: req.userId });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.status(500).json({ message: "Failed to add budget item" });
  }
});

router.put("/:id", requireAuth, validateBody(insertBudgetItemSchema.partial()), async (req: RequestWithUser, res) => {
  try {
    const budgetItemId = parseInt(req.params.id);
    const budgetItem = await storage.getBudgetItemById(budgetItemId);
    
    if (!budgetItem) {
      return res.status(404).json({ message: "Budget item not found" });
    }

    await ensureProjectAccess(req.userId, budgetItem.projectId);

    const updatedBudgetItem = await storage.updateBudgetItem(budgetItemId, req.body);
    
    // WebSocket notification
    websocketService.broadcastToProject(budgetItem.projectId, {
      type: 'budget_item_updated',
      budgetItem: updatedBudgetItem,
      userId: req.userId
    });
    
    logInfo('budget', `Budget item updated: ${budgetItemId}`, { userId: req.userId });
    
    res.json(updatedBudgetItem);
  } catch (error) {
    logError('budget', error, { userId: req.userId, budgetItemId: req.params.id });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Budget item or project not found" });
    }
    
    res.status(500).json({ message: "Failed to update budget item" });
  }
});

router.delete("/:id", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const budgetItemId = parseInt(req.params.id);
    const budgetItem = await storage.getBudgetItemById(budgetItemId);
    
    if (!budgetItem) {
      return res.status(404).json({ message: "Budget item not found" });
    }

    await ensureProjectAccess(req.userId, budgetItem.projectId);

    await storage.deleteBudgetItem(budgetItemId);
    
    // WebSocket notification
    websocketService.broadcastToProject(budgetItem.projectId, {
      type: 'budget_item_deleted',
      budgetItemId,
      userId: req.userId
    });
    
    logInfo('budget', `Budget item deleted: ${budgetItemId}`, { userId: req.userId });
    
    res.json({ message: "Budget item deleted successfully" });
  } catch (error) {
    logError('budget', error, { userId: req.userId, budgetItemId: req.params.id });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Budget item or project not found" });
    }
    
    res.status(500).json({ message: "Failed to delete budget item" });
  }
});

export default router;