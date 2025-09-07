import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth, RequestWithUser } from "../middleware/auth";
import { insertScheduleSchema, insertScheduleEventSchema } from "@shared/schema";

const router = Router();

// Get schedules for a project
router.get("/api/projects/:id/schedules", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const schedules = await storage.getSchedulesByProjectId(projectId);
    res.json(schedules);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ message: "Failed to fetch schedules" });
  }
});

// Create a new schedule
router.post("/api/projects/:id/schedules", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    // Convert date string to Date object
    const scheduleData = {
      ...req.body,
      projectId,
      createdBy: req.userId,
      date: new Date(req.body.date), // Convert string date to Date object
    };
    
    // Validate the data
    const validatedData = insertScheduleSchema.parse(scheduleData);
    const schedule = await storage.createSchedule(validatedData);
    
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Create schedule error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        message: "Invalid schedule data", 
        errors: error.errors 
      });
    } else {
      res.status(500).json({ message: "Failed to create schedule" });
    }
  }
});

// Update a schedule
router.put("/api/schedules/:id", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const scheduleId = parseInt(req.params.id);
    
    // Convert date string to Date object if present
    const updateData = {
      ...req.body,
    };
    
    if (req.body.date) {
      updateData.date = new Date(req.body.date);
    }
    
    const schedule = await storage.updateSchedule(scheduleId, updateData);
    
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    
    res.json(schedule);
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: "Failed to update schedule" });
  }
});

// Delete a schedule
router.delete("/api/schedules/:id", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const scheduleId = parseInt(req.params.id);
    const success = await storage.deleteSchedule(scheduleId);
    
    if (!success) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    
    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ message: "Failed to delete schedule" });
  }
});

// Get events for a schedule
router.get("/api/schedule-events/:scheduleId", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const scheduleId = parseInt(req.params.scheduleId);
    const events = await storage.getScheduleEventsByScheduleId(scheduleId);
    res.json(events);
  } catch (error) {
    console.error('Get schedule events error:', error);
    res.status(500).json({ message: "Failed to fetch schedule events" });
  }
});

// Create a new schedule event
router.post("/api/schedule-events", requireAuth, async (req: RequestWithUser, res) => {
  try {
    // Get the schedule to find the projectId
    const schedule = await storage.getScheduleById(req.body.scheduleId);
    
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    
    // Parse time strings into proper datetime format
    const eventData = {
      ...req.body,
      projectId: schedule.projectId,
      createdBy: req.userId,
      startTime: new Date(`2000-01-01T${req.body.startTime}:00`),
      endTime: req.body.endTime ? new Date(`2000-01-01T${req.body.endTime}:00`) : null,
    };
    
    const validatedData = insertScheduleEventSchema.parse(eventData);
    const event = await storage.createScheduleEvent(validatedData);
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Create schedule event error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        message: "Invalid event data", 
        errors: error.errors 
      });
    } else {
      res.status(500).json({ message: "Failed to create event" });
    }
  }
});

// Update a schedule event
router.put("/api/schedule-events/:id", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const eventId = parseInt(req.params.id);
    
    // Parse time strings into proper datetime format if present
    const updateData = {
      ...req.body,
    };
    
    if (req.body.startTime) {
      updateData.startTime = new Date(`2000-01-01T${req.body.startTime}:00`);
    }
    
    if (req.body.endTime) {
      updateData.endTime = new Date(`2000-01-01T${req.body.endTime}:00`);
    }
    
    const event = await storage.updateScheduleEvent(eventId, updateData);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Update schedule event error:', error);
    res.status(500).json({ message: "Failed to update event" });
  }
});

// Delete a schedule event
router.delete("/api/schedule-events/:id", requireAuth, async (req: RequestWithUser, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const success = await storage.deleteScheduleEvent(eventId);
    
    if (!success) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error('Delete schedule event error:', error);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

export default router;