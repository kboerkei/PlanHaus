import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { aiRateLimit } from "../middleware/rateLimit";
import { validateBody } from "../utils/validation";
import { getOrCreateDefaultProject } from "../utils/projects";
import { logError, logInfo, logWarning } from "../utils/logger";
import { RequestWithUser } from "../types/express";
import { AI_PROMPTS, formatPrompt } from "../prompts";
import { 
  generateWeddingTimeline, 
  generateBudgetBreakdown, 
  generateVendorSuggestions,
  generatePersonalizedRecommendation,
  analyzeWeddingTheme,
  type WeddingPlanningInput
} from "../services/ai";

const router = Router();

// Apply AI rate limiting to all AI routes
router.use(aiRateLimit);

// Chat endpoint validation schema
const chatSchema = z.object({
  message: z.string().min(1).max(1000),
  context: z.object({
    projectId: z.number().optional(),
    currentPage: z.string().optional()
  }).optional()
});

// Vendor search validation schema
const vendorSearchSchema = z.object({
  location: z.string().min(1).max(100),
  vendorType: z.string().min(1).max(50),
  budget: z.string().optional(),
  style: z.string().optional()
});

// Timeline generation schema
const timelineSchema = z.object({
  projectId: z.number()
});

// Import validation from client
import { validateOpenAIKey } from "../services/ai/client";

router.post("/chat", requireAuth, validateBody(chatSchema), async (req: RequestWithUser, res) => {
  if (!validateOpenAIKey()) {
    logWarning('ai', 'OpenAI API key not configured', { userId: req.userId });
    return res.status(503).json({ 
      message: "AI services temporarily unavailable",
      fallback: true 
    });
  }

  try {
    const { message, context } = req.body;
    
    // Get project context if available
    let projectContext = {};
    if (context?.projectId) {
      try {
        const project = await getOrCreateDefaultProject(req.userId);
        projectContext = {
          weddingDate: project.date,
          location: project.location,
          budget: project.budget,
          guestCount: project.guestCount
        };
      } catch (error) {
        logWarning('ai', 'Failed to get project context for chat', { userId: req.userId });
      }
    }

    const prompt = formatPrompt(AI_PROMPTS.WEDDING_CHAT, {
      ...projectContext,
      question: message
    });

    const response = await generatePersonalizedRecommendation(prompt);
    
    logInfo('ai', 'Chat response generated', { userId: req.userId });
    
    res.json({ 
      response,
      source: 'ai',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError('ai', error, { userId: req.userId, endpoint: 'chat' });
    res.status(500).json({ 
      message: "AI service error. Please try again later.",
      fallback: true 
    });
  }
});

router.post("/vendors/search", requireAuth, validateBody(vendorSearchSchema), async (req: RequestWithUser, res) => {
  try {
    const { location, vendorType, budget, style } = req.body;
    
    if (!validateOpenAIKey()) {
      logWarning('ai', 'OpenAI API key not configured for vendor search', { userId: req.userId });
      return res.json({
        vendors: [],
        source: 'fallback',
        message: "AI vendor search temporarily unavailable. Please add vendors manually.",
        confidenceScore: 0
      });
    }

    const prompt = formatPrompt(AI_PROMPTS.VENDOR_SEARCH, {
      location,
      vendorType,
      budgetRange: budget || 'Not specified',
      style: style || 'Not specified'
    });

    const vendorResults = await generateVendorSuggestions(prompt);
    
    // Parse AI response and add metadata
    let vendors = [];
    let source = 'fallback';
    let confidenceScore = 0;
    
    try {
      vendors = typeof vendorResults === 'string' ? JSON.parse(vendorResults) : vendorResults;
      if (Array.isArray(vendors) && vendors.length > 0) {
        source = 'ai';
        confidenceScore = 0.8; // High confidence for AI results
      }
    } catch (parseError) {
      logWarning('ai', 'Failed to parse vendor results', { userId: req.userId });
    }

    logInfo('ai', `Vendor search completed: ${vendors.length} results`, { 
      userId: req.userId, 
      location, 
      vendorType 
    });

    res.json({
      vendors,
      source,
      confidenceScore,
      searchCriteria: { location, vendorType, budget, style },
      timestamp: new Date().toISOString(),
      ...(source === 'fallback' && {
        message: "AI vendor search returned no results. Consider adding vendors manually or refining your search criteria."
      })
    });
  } catch (error) {
    logError('ai', error, { userId: req.userId, endpoint: 'vendor-search' });
    res.status(500).json({
      vendors: [],
      source: 'fallback',
      confidenceScore: 0,
      message: "Search temporarily unavailable. Please try again later."
    });
  }
});

router.post("/timeline", requireAuth, validateBody(timelineSchema), async (req: RequestWithUser, res) => {
  if (!validateOpenAIKey()) {
    logWarning('ai', 'OpenAI API key not configured for timeline generation', { userId: req.userId });
    return res.status(503).json({ 
      message: "AI timeline generation temporarily unavailable. Please add tasks manually.",
      source: 'fallback'
    });
  }

  try {
    const { projectId } = req.body;
    const project = await getOrCreateDefaultProject(req.userId);
    
    const prompt = formatPrompt(AI_PROMPTS.WEDDING_TIMELINE, {
      weddingDate: project.date?.toISOString().split('T')[0] || '',
      venue: project.location || 'TBD',
      guestCount: project.guestCount || 100,
      budget: project.budget || 25000
    });

    const timelineData = await generateWeddingTimeline(prompt);
    
    logInfo('ai', 'Timeline generated', { 
      userId: req.userId, 
      projectId: project.id 
    });

    res.json({
      timeline: timelineData,
      source: 'ai',
      confidenceScore: 0.9,
      projectContext: {
        weddingDate: project.date,
        location: project.location,
        guestCount: project.guestCount
      }
    });
  } catch (error) {
    logError('ai', error, { userId: req.userId, endpoint: 'timeline' });
    res.status(500).json({ 
      message: "Timeline generation failed. Please add tasks manually.",
      source: 'fallback',
      confidenceScore: 0
    });
  }
});

export default router;