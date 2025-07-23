import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../utils/validation";
import { getOrCreateDefaultProject, ensureProjectAccess } from "../utils/projects";
import { logError, logInfo } from "../utils/logger";
import { RequestWithUser } from "../types/express";
import { insertTaskSchema } from "@shared/schema";
import { websocketService } from "../services/websocket";

const router = Router();

router.get("/", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const project = await getOrCreateDefaultProject(req.userId);
    const tasks = await storage.getTasksByProjectId(project.id);
    
    res.json(tasks);
  } catch (error) {
    logError('tasks', error, { userId: req.userId });
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

router.get("/project/:projectId", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    await ensureProjectAccess(req.userId, projectId);
    
    const tasks = await storage.getTasksByProjectId(projectId);
    res.json(tasks);
  } catch (error) {
    logError('tasks', error, { userId: req.userId, projectId: req.params.projectId });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

router.post("/", requireAuth, validateBody(insertTaskSchema), async (req: RequestWithUser, res) => {
  try {
    let projectId = req.body.projectId;
    
    // If no projectId provided, use default project
    if (!projectId) {
      const project = await getOrCreateDefaultProject(req.userId);
      projectId = project.id;
    } else {
      await ensureProjectAccess(req.userId, projectId);
    }

    const taskData = { ...req.body, projectId, assignedTo: req.userId };
    const task = await storage.createTask(taskData);
    
    // Log activity
    await storage.createActivity({
      projectId,
      userId: req.userId,
      type: 'task_created',
      description: `Created task: ${task.title}`,
      metadata: { taskId: task.id }
    });

    // WebSocket notification
    websocketService.broadcastToProject(projectId, {
      type: 'task_created',
      task,
      userId: req.userId
    });

    logInfo('tasks', `Task created: ${task.title}`, { userId: req.userId, projectId });
    
    res.status(201).json(task);
  } catch (error) {
    logError('tasks', error, { userId: req.userId });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.status(500).json({ message: "Failed to create task" });
  }
});

router.put("/:id", requireAuth, validateBody(insertTaskSchema.partial()), async (req: RequestWithUser, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = await storage.getTaskById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify project access
    await ensureProjectAccess(req.userId, task.projectId);

    const updatedTask = await storage.updateTask(taskId, req.body);
    
    // Log activity for status changes
    if (req.body.status || req.body.isCompleted !== undefined) {
      const isCompleted = req.body.isCompleted || req.body.status === 'completed';
      await storage.createActivity({
        projectId: task.projectId,
        userId: req.userId,
        type: isCompleted ? 'task_completed' : 'task_updated',
        description: isCompleted ? `Completed task: ${task.title}` : `Updated task: ${task.title}`,
        metadata: { taskId: task.id }
      });
    }

    // WebSocket notification
    websocketService.broadcastToProject(task.projectId, {
      type: 'task_updated',
      task: updatedTask,
      userId: req.userId
    });

    logInfo('tasks', `Task updated: ${taskId}`, { userId: req.userId });
    
    res.json(updatedTask);
  } catch (error) {
    logError('tasks', error, { userId: req.userId, taskId: req.params.id });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Task or project not found" });
    }
    
    res.status(500).json({ message: "Failed to update task" });
  }
});

router.delete("/:id", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = await storage.getTaskById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify project access
    await ensureProjectAccess(req.userId, task.projectId);

    await storage.deleteTask(taskId);
    
    // Log activity
    await storage.createActivity({
      projectId: task.projectId,
      userId: req.userId,
      type: 'task_deleted',
      description: `Deleted task: ${task.title}`,
      metadata: { taskId }
    });

    // WebSocket notification
    websocketService.broadcastToProject(task.projectId, {
      type: 'task_deleted',
      taskId,
      userId: req.userId
    });

    logInfo('tasks', `Task deleted: ${taskId}`, { userId: req.userId });
    
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    logError('tasks', error, { userId: req.userId, taskId: req.params.id });
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: "Task or project not found" });
    }
    
    res.status(500).json({ message: "Failed to delete task" });
  }
});

export default router;