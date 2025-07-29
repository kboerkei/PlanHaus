import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../utils/validation";
import { insertSeatingTableSchema, insertSeatingAssignmentSchema, type SeatingTable, type InsertSeatingTable, type SeatingAssignment, type InsertSeatingAssignment } from "@shared/schema";
import { logInfo, logError } from "../utils/logger";
import { RequestWithUser } from "../types/express";
import { getOrCreateDefaultProject } from "../utils/projects";

const router = Router();

// Get seating chart data (tables, assignments, unassigned guests)
router.get("/", requireAuth, async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.userId;
    const project = await getOrCreateDefaultProject(userId);
    const seatingData = await storage.getSeatingChartData(project.id);
    
    logInfo('seating-chart', `Retrieved seating chart data for project ${project.id}`, {
      tablesCount: seatingData.tables.length,
      assignmentsCount: seatingData.assignments.length,
      unassignedCount: seatingData.unassignedGuests.length
    });
    
    res.json(seatingData);
  } catch (error) {
    logError('seating-chart', 'Failed to fetch seating chart data', { error });
    res.status(500).json({ error: "Failed to fetch seating chart data" });
  }
});

// Create a new table
router.post("/tables", requireAuth, validateBody(insertSeatingTableSchema), async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.userId;
    const data = req.body as InsertSeatingTable;
    const project = await getOrCreateDefaultProject(userId);
    
    const table = await storage.createSeatingTable({
      ...data,
      projectId: project.id,
      createdBy: userId,
    });
    
    await storage.createActivity({
      projectId: project.id,
      userId,
      action: 'created',
      entityType: 'seating_table',
      entityId: table.id,
      entityName: table.name,
      details: { maxSeats: table.maxSeats },
      isVisible: true,
    });
    
    logInfo('seating-chart', `Created seating table: ${table.name}`, { tableId: table.id });
    res.status(201).json(table);
  } catch (error) {
    logError('seating-chart', 'Failed to create seating table', { error });
    res.status(500).json({ error: "Failed to create seating table" });
  }
});

// Update a table
router.put("/tables/:id", requireAuth, validateBody(insertSeatingTableSchema), async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.userId;
    const tableId = parseInt(req.params.id);
    const data = req.body as Partial<InsertSeatingTable>;
    
    if (isNaN(tableId)) {
      return res.status(400).json({ error: "Invalid table ID" });
    }
    
    const existingTable = await storage.getSeatingTableById(tableId);
    if (!existingTable) {
      return res.status(404).json({ error: "Table not found" });
    }
    
    const projects = await storage.getWeddingProjectsByUserId(userId);
    const hasAccess = projects.some(p => p.id === existingTable.projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const updatedTable = await storage.updateSeatingTable(tableId, data);
    
    await storage.createActivity({
      projectId: existingTable.projectId,
      userId,
      action: 'updated',
      entityType: 'seating_table',
      entityId: tableId,
      entityName: updatedTable.name,
      details: { maxSeats: updatedTable.maxSeats },
      isVisible: true,
    });
    
    logInfo('seating-chart', `Updated seating table: ${updatedTable.name}`, { tableId });
    res.json(updatedTable);
  } catch (error) {
    logError('seating-chart', 'Failed to update seating table', { error });
    res.status(500).json({ error: "Failed to update seating table" });
  }
});

// Delete a table
router.delete("/tables/:id", requireAuth, async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.userId;
    const tableId = parseInt(req.params.id);
    
    if (isNaN(tableId)) {
      return res.status(400).json({ error: "Invalid table ID" });
    }
    
    const existingTable = await storage.getSeatingTableById(tableId);
    if (!existingTable) {
      return res.status(404).json({ error: "Table not found" });
    }
    
    const projects = await storage.getWeddingProjectsByUserId(userId);
    const hasAccess = projects.some(p => p.id === existingTable.projectId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    await storage.deleteSeatingTable(tableId);
    
    await storage.createActivity({
      projectId: existingTable.projectId,
      userId,
      action: 'deleted',
      entityType: 'seating_table',
      entityId: tableId,
      entityName: existingTable.name,
      details: {},
      isVisible: true,
    });
    
    logInfo('seating-chart', `Deleted seating table: ${existingTable.name}`, { tableId });
    res.json({ success: true });
  } catch (error) {
    logError('seating-chart', 'Failed to delete seating table', { error });
    res.status(500).json({ error: "Failed to delete seating table" });
  }
});

// Assign guest to table
router.post("/assignments", requireAuth, validateBody(insertSeatingAssignmentSchema), async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.userId;
    const data = req.body as InsertSeatingAssignment;
    const project = await getOrCreateDefaultProject(userId);
    
    // Remove any existing assignment for this guest
    await storage.deleteSeatingAssignmentByGuestId(data.guestId);
    
    const assignment = await storage.createSeatingAssignment({
      ...data,
      projectId: project.id,
    });
    
    // Get guest name for activity log
    const guest = await storage.getGuestById(data.guestId);
    const table = await storage.getSeatingTableById(data.tableId);
    
    await storage.createActivity({
      projectId: project.id,
      userId,
      action: 'assigned',
      entityType: 'seating_assignment',
      entityId: assignment.id,
      entityName: `${guest?.name} to ${table?.name}`,
      details: { guestId: data.guestId, tableId: data.tableId },
      isVisible: true,
    });
    
    logInfo('seating-chart', `Assigned guest ${guest?.name} to table ${table?.name}`, { assignmentId: assignment.id });
    res.status(201).json(assignment);
  } catch (error) {
    logError('seating-chart', 'Failed to create seating assignment', { error });
    res.status(500).json({ error: "Failed to create seating assignment" });
  }
});

// Remove guest from table
router.delete("/assignments/:id", requireAuth, async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.userId;
    const assignmentId = parseInt(req.params.id);
    
    if (isNaN(assignmentId)) {
      return res.status(400).json({ error: "Invalid assignment ID" });
    }
    
    const success = await storage.deleteSeatingAssignment(assignmentId);
    
    if (!success) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    
    logInfo('seating-chart', `Removed seating assignment`, { assignmentId });
    res.json({ success: true });
  } catch (error) {
    logError('seating-chart', 'Failed to delete seating assignment', { error });
    res.status(500).json({ error: "Failed to delete seating assignment" });
  }
});

// Remove guest from any table (by guest ID)
router.delete("/assignments/guest/:guestId", requireAuth, async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.userId;
    const guestId = parseInt(req.params.guestId);
    
    if (isNaN(guestId)) {
      return res.status(400).json({ error: "Invalid guest ID" });
    }
    
    const success = await storage.deleteSeatingAssignmentByGuestId(guestId);
    
    logInfo('seating-chart', `Removed guest from seating chart`, { guestId });
    res.json({ success });
  } catch (error) {
    logError('seating-chart', 'Failed to remove guest from seating chart', { error });
    res.status(500).json({ error: "Failed to remove guest from seating chart" });
  }
});

export default router;