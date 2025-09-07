import express from "express";
import { z } from "zod";
import { db } from "../db";
import { intakeData, intakeStepData, weddingProjects } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import { requireAuthCookie } from "../middleware/cookieAuth";
import { logError, logInfo } from "../utils/logger";
import { RequestWithUser } from "../types/express";

const router = express.Router();

// Validation schemas
const saveDraftSchema = z.object({
  projectId: z.number().optional(),
  step: z.number().min(1).max(7).optional(),
  data: z.any(), // Will be validated by the client-side schema
});

const submitSchema = z.object({
  projectId: z.number().optional(),
  data: z.any(), // Will be validated by the client-side schema
});

// GET /api/intake - Load existing intake data
router.get("/", requireAuthCookie, async (req: any, res) => {
  try {
    const { projectId } = req.query;
    const userId = req.userId;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // Get the most recent intake data for this project
    const existingIntake = await db
      .select()
      .from(intakeData)
              .where(
          and(
            eq(intakeData.userId, userId),
            eq(intakeData.projectId, parseInt(projectId) || 0)
          )
        )
      .orderBy(intakeData.updatedAt)
      .limit(1);

    if (existingIntake.length === 0) {
      return res.status(404).json({ message: "No intake data found" });
    }

    const intake = existingIntake[0];
    
    logInfo('intake', 'Intake data loaded', { userId, projectId: parseInt(projectId) });
    
    res.json(intake.rawData);
  } catch (error) {
    logError('intake', error as Error, { userId: req.userId });
    res.status(500).json({ message: "Failed to load intake data" });
  }
});

// POST /api/intake/save - Save draft intake data
router.post("/save", requireAuthCookie, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { projectId, step, data } = saveDraftSchema.parse(req.body);

    // If saving individual step
    if (step && data) {
      // Check if step data already exists
      const existingStep = await db
        .select()
        .from(intakeStepData)
        .where(
          and(
            eq(intakeStepData.userId, userId),
            eq(intakeStepData.projectId, projectId || 0),
            eq(intakeStepData.stepNumber, step)
          )
        )
        .limit(1);

      if (existingStep.length > 0) {
        // Update existing step
        await db
          .update(intakeStepData)
          .set({
            stepData: data,
            updatedAt: new Date(),
          })
          .where(eq(intakeStepData.id, existingStep[0].id));
      } else {
        // Create new step
        await db.insert(intakeStepData).values({
          userId,
          projectId: projectId || null,
          stepNumber: step,
          stepData: data,
        });
      }

      logInfo('intake', 'Step data saved', { userId, projectId, step });
      return res.status(200).json({ message: "Step saved successfully" });
    }

    // If saving complete draft
    if (data) {
      // Check if intake data already exists
      const existingIntake = await db
        .select()
        .from(intakeData)
        .where(
          and(
            eq(intakeData.userId, userId),
            eq(intakeData.projectId, projectId || null)
          )
        )
        .limit(1);

      if (existingIntake.length > 0) {
        // Update existing intake
        await db
          .update(intakeData)
          .set({
            rawData: data,
            updatedAt: new Date(),
          })
          .where(eq(intakeData.id, existingIntake[0].id));
      } else {
        // Create new intake
        await db.insert(intakeData).values({
          userId,
          projectId: projectId || null,
          rawData: data,
          status: "draft",
        });
      }

      logInfo('intake', 'Draft saved', { userId, projectId });
      return res.status(200).json({ message: "Draft saved successfully" });
    }

    res.status(400).json({ message: "Invalid request data" });
  } catch (error) {
    logError('intake', error as Error, { userId: req.userId });
    res.status(500).json({ message: "Failed to save draft" });
  }
});

// POST /api/intake/submit - Submit final intake data
router.post("/submit", requireAuthCookie, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { projectId, data } = submitSchema.parse(req.body);

    // Validate the complete intake data
    // Note: In a real implementation, you'd import and use the intakeSchema here
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ message: "Invalid intake data" });
    }

    // Check if intake data already exists
    const existingIntake = await db
      .select()
      .from(intakeData)
      .where(
        and(
          eq(intakeData.userId, userId),
          eq(intakeData.projectId, projectId || null)
        )
      )
      .limit(1);

    let intakeId: number;

    if (existingIntake.length > 0) {
      // Update existing intake
      const result = await db
        .update(intakeData)
        .set({
          rawData: data,
          status: "submitted",
          updatedAt: new Date(),
        })
        .where(eq(intakeData.id, existingIntake[0].id))
        .returning({ id: intakeData.id });

      intakeId = result[0].id;
    } else {
      // Create new intake
      const result = await db
        .insert(intakeData)
        .values({
          userId,
          projectId: projectId || null,
          rawData: data,
          status: "submitted",
        })
        .returning({ id: intakeData.id });

      intakeId = result[0].id;
    }

    // If no projectId was provided, create a new project
    let finalProjectId = projectId;
    if (!projectId) {
      // Extract basic project info from intake data
      const projectInfo = {
        name: data.step2?.workingTitle || "New Wedding Project",
        date: new Date(data.step2?.date || Date.now()),
        venue: data.step2?.venues?.ceremonyVenueName || "",
        description: `Wedding for ${data.step1?.couple?.firstName?.[0]} and ${data.step1?.couple?.firstName?.[1]}`,
        createdBy: userId,
      };

      const newProject = await db
        .insert(weddingProjects)
        .values(projectInfo)
        .returning({ id: weddingProjects.id });

      finalProjectId = newProject[0].id;

      // Update the intake record with the new project ID
      await db
        .update(intakeData)
        .set({ projectId: finalProjectId })
        .where(eq(intakeData.id, intakeId));
    }

    // TODO: Run the mapping pipeline to populate other pages
    // await applyIntakeToProject(finalProjectId, data);

    logInfo('intake', 'Intake submitted', { userId, projectId: finalProjectId, intakeId });
    
    res.status(200).json({ 
      message: "Intake submitted successfully",
      projectId: finalProjectId,
      intakeId 
    });
  } catch (error) {
    logError('intake', error as Error, { userId: req.userId });
    res.status(500).json({ message: "Failed to submit intake" });
  }
});

// GET /api/intake/steps/:projectId - Get step data for a project
router.get("/steps/:projectId", requireAuthCookie, async (req: any, res) => {
  try {
    const userId = req.userId;
    const projectId = parseInt(req.params.projectId);

    const stepData = await db
      .select()
      .from(intakeStepData)
      .where(
        and(
          eq(intakeStepData.userId, userId),
          eq(intakeStepData.projectId, projectId)
        )
      )
      .orderBy(intakeStepData.stepNumber);

    const steps = stepData.reduce((acc, step) => {
      acc[step.stepNumber] = step.stepData;
      return acc;
    }, {} as Record<number, any>);

    logInfo('intake', 'Step data retrieved', { userId, projectId });
    
    res.json(steps);
  } catch (error) {
    logError('intake', error as Error, { userId: req.userId });
    res.status(500).json({ message: "Failed to load step data" });
  }
});

export default router;