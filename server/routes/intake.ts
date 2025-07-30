import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { logError, logInfo } from "../utils/logger";

const router = Router();

// Intake form submission schema
const intakeSchema = z.object({
  partner1FirstName: z.string().optional(),
  partner1LastName: z.string().optional(),
  partner1Email: z.string().email().optional(),
  partner2FirstName: z.string().optional(),
  partner2LastName: z.string().optional(),
  partner2Email: z.string().email().optional(),
  weddingDate: z.string().optional(),
  ceremonyLocation: z.string().optional(),
  receptionLocation: z.string().optional(),
  estimatedGuests: z.number().optional(),
  totalBudget: z.string().optional(),
  overallVibe: z.string().optional(),
  colorPalette: z.string().optional(),
  nonNegotiables: z.string().optional(),
  officiantStatus: z.string().optional(),
});

// Submit intake form
router.post("/", requireAuth, async (req, res) => {
  try {
    const validatedData = intakeSchema.parse(req.body);
    const userId = req.user.id;

    // Get or create wedding project
    let project = await storage.getWeddingProjectByUserId(userId);
    
    if (!project) {
      // Create new wedding project
      const projectName = validatedData.partner1FirstName && validatedData.partner2FirstName 
        ? `${validatedData.partner1FirstName} & ${validatedData.partner2FirstName}'s Wedding`
        : "My Wedding";

      project = await storage.createWeddingProject({
        name: projectName,
        date: validatedData.weddingDate ? new Date(validatedData.weddingDate) : new Date(),
        venue: validatedData.ceremonyLocation || "",
        theme: validatedData.overallVibe || "",
        budget: validatedData.totalBudget || "0",
        guestCount: validatedData.estimatedGuests || 0,
        style: validatedData.overallVibe || "",
        description: validatedData.nonNegotiables || "",
        createdBy: userId,
      });
    } else {
      // Update existing project
      await storage.updateWeddingProject(project.id, {
        name: validatedData.partner1FirstName && validatedData.partner2FirstName 
          ? `${validatedData.partner1FirstName} & ${validatedData.partner2FirstName}'s Wedding`
          : project.name,
        date: validatedData.weddingDate ? new Date(validatedData.weddingDate) : project.date,
        venue: validatedData.ceremonyLocation || project.venue,
        theme: validatedData.overallVibe || project.theme,
        budget: validatedData.totalBudget || project.budget,
        guestCount: validatedData.estimatedGuests || project.guestCount,
        style: validatedData.overallVibe || project.style,
        description: validatedData.nonNegotiables || project.description,
      });
    }

    // Mark user as having completed intake - simplified for now
    // await storage.updateUser(userId, { 
    //   hasCompletedIntake: true,
    //   firstName: validatedData.partner1FirstName || null,
    //   lastName: validatedData.partner1LastName || null,
    // });

    logInfo(`User ${userId} completed intake form`, { projectId: project.id });

    res.json({ 
      success: true, 
      message: "Intake form completed successfully",
      project: project
    });

  } catch (error) {
    logError("Error submitting intake form", error, { userId: req.user?.id });
    res.status(500).json({ 
      error: "Failed to submit intake form",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get existing intake data
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const project = await storage.getWeddingProjectByUserId(userId);
    
    if (!project) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      project: project,
      // Map project data back to intake form format
      partner1FirstName: req.user.username || "",
      partner1LastName: "",
      partner1Email: req.user.email || "",
      weddingDate: project.date.toISOString(),
      ceremonyLocation: project.venue || "",
      receptionLocation: project.venue || "",
      estimatedGuests: project.guestCount || 0,
      totalBudget: project.budget || "0",
      overallVibe: project.theme || "",
      colorPalette: "",
      nonNegotiables: project.description || "",
      officiantStatus: "",
    });

  } catch (error) {
    logError("Error fetching intake data", error, { userId: req.user?.id });
    res.status(500).json({ 
      error: "Failed to fetch intake data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;