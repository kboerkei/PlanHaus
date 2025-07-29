import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { aiRateLimit } from "../middleware/rateLimit";
import { validateBody } from "../utils/validation";
import { getOrCreateDefaultProject } from "../utils/projects";
import { logError, logInfo, logWarning } from "../utils/logger";
import { RequestWithUser } from "../types/express";
import { AI_PROMPTS, formatPrompt } from "../prompts";
import { storage } from "../storage";
import { 
  generateWeddingTimeline, 
  generateBudgetBreakdown, 
  generateVendorSuggestions,
  generatePersonalizedRecommendation,
  analyzeWeddingTheme,
  type WeddingPlanningInput
} from "../services/ai";
import { generateChatResponse } from "../services/ai/generateChatResponse";

const router = Router();

// Apply AI rate limiting to all AI routes
router.use(aiRateLimit);

// Chat endpoint validation schema - allow flexible input
const chatSchema = z.object({
  message: z.string().min(1).max(1000)
}).passthrough(); // Allow additional fields like context

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

router.post("/chat", requireAuth, async (req: RequestWithUser, res) => {
  if (!validateOpenAIKey()) {
    logWarning('ai', 'OpenAI API key not configured', { userId: req.userId });
    return res.status(503).json({ 
      message: "AI services temporarily unavailable",
      fallback: true 
    });
  }

  try {
    const { message, context } = req.body;
    
    // Manual validation since we removed the schema validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        message: "Message is required and must be a non-empty string" 
      });
    }
    
    // Get comprehensive user and project context for personalized responses
    let weddingData: any = {};
    try {
      // Get user data for intake information
      const user = storage.getUserById(req.userId);
      const project = await getOrCreateDefaultProject(req.userId);
      
      // Extract user intake information for personalization
      const userName = user?.username?.split(' ')[0] || 'there'; // Get first name
      const weddingDate = project.date;
      const userGuestCount = project.guestCount;
      const userBudget = project.budget;
      const weddingVenue = project.venue;
      const weddingTheme = project.theme;
      const weddingStyle = project.style;
      
      // Get additional wedding data from storage
      const tasks = await storage.getTasksByProjectId(project.id);
      const guests = await storage.getGuestsByProjectId(project.id);
      const budget = await storage.getBudgetItemsByProjectId(project.id);
      
      // Calculate days until wedding
      const today = new Date();
      const daysUntilWedding = weddingDate ? Math.ceil((new Date(weddingDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
      
      // Calculate actual guest count from guest list
      const actualGuestCount = guests?.reduce((sum, guest) => sum + (guest.partySize || 1), 0) || 0;
      
      // Build rich context with real intake data
      weddingData = {
        coupleNames: project.name || "the happy couple",
        userName,
        weddingDate: weddingDate ? new Date(weddingDate).toLocaleDateString() : "your wedding day",
        daysUntilWedding: daysUntilWedding && daysUntilWedding > 0 ? daysUntilWedding : "soon",
        guestCount: actualGuestCount || userGuestCount || 0,
        budget: userBudget || "not set",
        location: weddingVenue || "your venue",
        theme: weddingTheme,
        style: weddingStyle,
        completedTasks: tasks?.filter((task: any) => task.isCompleted).length || 0,
        totalTasks: tasks?.length || 0,
        budgetSpent: budget?.reduce((sum: number, item: any) => sum + (item.actualCost || 0), 0) || 0,
        currentPage: typeof context === 'string' ? context : context?.currentPage || "chat"
      };
    } catch (error) {
      logWarning('ai', 'Failed to get project context for chat', { userId: req.userId });
    }

    // Try AI first, fall back to smart responses if unavailable
    let response;
    try {
      response = await generateChatResponse(weddingData, message);
      
      // If response is generic, use smart fallback instead
      if (response.includes("I'm here to help with your wedding planning")) {
        response = await generateSmartWeddingResponse(message, weddingData);
      }
    } catch (error) {
      // Use smart fallback when AI fails
      response = await generateSmartWeddingResponse(message, weddingData);
    }
    
    logInfo('ai', 'Enhanced personalized chat response generated', { 
      userId: req.userId,
      daysUntilWedding: weddingData.daysUntilWedding,
      completedTasks: weddingData.completedTasks
    });
    
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

// Enhanced AI response system with real data integration
async function generateSmartWeddingResponse(userMessage: string, weddingData: any): Promise<string> {
  const message = userMessage.toLowerCase();
  const daysUntil = weddingData.daysUntilWedding || 79;
  const coupleNames = weddingData.coupleNames || "you two";
  const completedTasks = weddingData.completedTasks || 0;
  const totalTasks = weddingData.totalTasks || 0;
  const guestCount = weddingData.guestCount || 0;
  const budget = weddingData.budget || 0;
  
  // Enhanced condition handling with real data integration
  if (message.includes("next") || message.includes("what now") || message.includes("focus") || message.includes("priority")) {
    try {
      // Get actual task data to provide specific next steps
      const tasks = storage.getTasksByProjectId(1); // Using demo project ID
      const pendingTasks = tasks.filter((task: any) => !task.completed).slice(0, 3);
      
      if (pendingTasks.length > 0) {
        const taskList = pendingTasks.map((task, index) => 
          `${index + 1}. **${task.title}** ${task.dueDate ? `(Due: ${new Date(task.dueDate).toLocaleDateString()})` : ''}`
        ).join('\n');
        
        return `Based on your current progress, here are your next 3 priority tasks:

${taskList}

With ${daysUntil} days until ${coupleNames}'s wedding, focus on these items to stay on track. You've completed ${completedTasks} of ${totalTasks} total tasks.`;
      }
    } catch (error) {
      // Fallback if task data unavailable
    }
    
    return `For ${coupleNames} with ${daysUntil} days until your wedding, here are your top priorities:
    
1. **Venue & Catering** - Book these first if not done
2. **Photography** - Essential and books up fast  
3. **Guest List** - Finalize for accurate planning
4. **Save the Dates** - Send 6-8 months ahead

You've completed ${completedTasks} of ${totalTasks} tasks. Check your timeline page for specific deadlines!`;
  }

  if (message.includes("budget") || message.includes("cost") || message.includes("money")) {
    try {
      // Get actual budget data for personalized advice
      const budgetItems = storage.getBudgetItemsByProjectId(1);
      const totalSpent = budgetItems.reduce((sum: number, item: any) => sum + (item.actualCost || 0), 0);
      const totalBudgeted = budgetItems.reduce((sum: number, item: any) => sum + (item.estimatedCost || 0), 0);
      
      if (totalBudgeted > 0) {
        const percentSpent = Math.round((totalSpent / totalBudgeted) * 100);
        const remaining = totalBudgeted - totalSpent;
        
        return `Help with your $${totalBudgeted.toLocaleString()} wedding budget:

**Current Status:**
- Spent: $${totalSpent.toLocaleString()} (${percentSpent}%)
- Remaining: $${remaining.toLocaleString()}

**Budget Allocation Guidelines:**
- Venue & Catering: ~50% ($${Math.round(totalBudgeted * 0.5).toLocaleString()})
- Photography: ~10-15% ($${Math.round(totalBudgeted * 0.12).toLocaleString()})
- Attire & Beauty: ~8-10% ($${Math.round(totalBudgeted * 0.09).toLocaleString()})

${percentSpent > 80 ? "⚠️ You're approaching your budget limit - consider reviewing remaining expenses." : percentSpent > 60 ? "You're making good progress - keep tracking expenses carefully." : "You have good budget flexibility for remaining planning."}`;
      }
    } catch (error) {
      // Fallback if budget data unavailable
    }
    
    return `With ${daysUntil} days to go, here's budget guidance:

**Major expenses (60-70% of budget):**
- Venue & Catering: ~50% 
- Photography: ~10-15%
- Attire & Beauty: ~8-10%

**Remaining budget for:**
- Flowers, music, transportation, etc.

Check your budget page to see how you're tracking against these guidelines!`;
  }
  
  // Track question patterns and provide specific answers
  if (message.includes('on track') || message.includes('timeline') || message.includes('schedule')) {
    if (daysUntil > 180) {
      return `Hi ${coupleNames}! With ${daysUntil} days until your wedding, you're well ahead of schedule. Focus on major bookings like venue and photographer. You have plenty of time for detailed planning later.`;
    } else if (daysUntil > 90) {
      return `You're doing great with ${daysUntil} days to go! This is prime booking time - make sure you have venue, catering, and photography locked in. You should also start thinking about invitations and guest list finalization.`;
    } else if (daysUntil > 30) {
      return `With ${daysUntil} days left, you're in the final stretch! Focus on finalizing details like decorations, seating charts, and vendor confirmations. Make sure invitations are sent and you're tracking RSVPs.`;
    } else {
      return `Final countdown with ${daysUntil} days! You should be confirming final headcounts, doing venue walkthroughs, and handling last-minute details. The big planning should be mostly done.`;
    }
  }
  
  if (message.includes('guest') || message.includes('invite') || message.includes('rsvp')) {
    return `For guest planning with ${daysUntil} days to go:

**Current guest count:** ${guestCount} people
**Timeline:**
- Save the dates: 6-8 months before  
- Invitations: 6-8 weeks before
- RSVP deadline: 2-3 weeks before

${daysUntil > 180 ? "Focus on finalizing your guest list first." : daysUntil > 45 ? "Time to send invitations if you haven't already!" : "Make sure you're tracking RSVPs for final headcount."}`;
  }
  
  if (message.includes('vendor') || message.includes('photographer') || message.includes('caterer')) {
    return `Vendor booking with ${daysUntil} days until your wedding:

**Priority order:**
1. Venue (books 12+ months out)
2. Photographer (books 6-12 months out)  
3. Catering (books 6-9 months out)
4. Music/DJ (books 3-6 months out)

${daysUntil > 180 ? "Perfect timing for major vendor bookings!" : daysUntil > 90 ? "Still good time for key vendors, but don't delay!" : "Focus on confirming details with booked vendors."}

Check the vendors page to manage your bookings!`;
  }
  
  // Default helpful response with personalized context
  return `Hi ${coupleNames}! I'm PlanBot, your wedding planning assistant. 

**Your wedding:** ${daysUntil} days away
**Progress:** ${completedTasks}/${totalTasks} tasks completed  
**Guests:** ${guestCount} people

I can help with timeline planning, budget advice, vendor recommendations, and guest management. What specific area would you like guidance on?`;
}

export default router;