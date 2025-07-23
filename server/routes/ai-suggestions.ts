import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../utils/validation";
import { logError, logInfo } from "../utils/logger";
import { RequestWithUser } from "../types/express";
import { aiRateLimit } from "../middleware/rateLimit";

const router = Router();

// Apply rate limiting to AI suggestion endpoints
router.use(aiRateLimit);

// Budget suggestions schema
const budgetSuggestionsSchema = z.object({
  totalBudget: z.number().min(1000),
  guestCount: z.number().min(1),
  location: z.string().optional()
});

// Style suggestions schema
const styleSuggestionsSchema = z.object({
  vibe: z.string().min(1),
  colorPalette: z.string().optional(),
  mustHaveElements: z.array(z.string()).optional()
});

// Budget suggestions endpoint
router.post("/budget-suggestions", requireAuth, validateBody(budgetSuggestionsSchema), async (req: RequestWithUser, res) => {
  try {
    const { totalBudget, guestCount, location } = req.body;

    // Generate budget breakdown suggestions based on industry standards
    const suggestions = [];
    const perPersonBudget = totalBudget / guestCount;

    if (perPersonBudget < 100) {
      suggestions.push("Consider a more intimate guest list to increase per-person budget");
      suggestions.push("Look into buffet-style catering to reduce costs");
      suggestions.push("Consider DIY decorations and flowers");
    } else if (perPersonBudget < 200) {
      suggestions.push("Venue and catering should be 60-70% of your budget");
      suggestions.push("Consider hiring a DJ instead of a live band");
      suggestions.push("Look for package deals with venues that include catering");
    } else {
      suggestions.push("You have flexibility for premium vendors and upgrades");
      suggestions.push("Consider hiring a wedding planner to maximize your budget");
      suggestions.push("Invest in high-quality photography and videography");
    }

    // Location-specific suggestions
    if (location) {
      if (location.toLowerCase().includes('beach') || location.toLowerCase().includes('coastal')) {
        suggestions.push("Beach venues often require additional setup costs for sound and weather protection");
      } else if (location.toLowerCase().includes('garden') || location.toLowerCase().includes('outdoor')) {
        suggestions.push("Outdoor venues may need tent rentals and weather contingency plans");
      } else if (location.toLowerCase().includes('city') || location.toLowerCase().includes('urban')) {
        suggestions.push("Urban venues typically have higher base costs but include more amenities");
      }
    }

    res.json({ suggestions });
  } catch (error) {
    logError('ai-suggestions', error, { userId: req.userId, endpoint: 'budget-suggestions' });
    res.status(500).json({ 
      error: "Failed to generate budget suggestions",
      suggestions: ["Focus on your top 3 priorities when allocating budget"]
    });
  }
});

// Style suggestions endpoint
router.post("/style-suggestions", requireAuth, validateBody(styleSuggestionsSchema), async (req: RequestWithUser, res) => {
  try {
    const { vibe, colorPalette, mustHaveElements } = req.body;

    const suggestions = [];

    // Vibe-specific suggestions
    switch (vibe.toLowerCase()) {
      case 'romantic & classic':
        suggestions.push("Soft lighting with candles and string lights creates romantic ambiance");
        suggestions.push("Consider blush, ivory, and gold color palette");
        suggestions.push("Roses, peonies, and eucalyptus are perfect for classic romance");
        break;
      case 'boho & rustic':
        suggestions.push("Mix vintage furniture and natural textures");
        suggestions.push("Earth tones like terracotta, sage, and cream work beautifully");
        suggestions.push("Incorporate pampas grass, dried flowers, and macrame details");
        break;
      case 'modern & minimalist':
        suggestions.push("Clean lines and geometric shapes create modern elegance");
        suggestions.push("Stick to a monochromatic or two-color palette");
        suggestions.push("Focus on quality over quantity with statement pieces");
        break;
      case 'vintage & retro':
        suggestions.push("Mix different eras for an eclectic vintage feel");
        suggestions.push("Incorporate antique furniture and vintage glassware");
        suggestions.push("Consider a jazz band or swing music for authentic atmosphere");
        break;
      default:
        suggestions.push(`${vibe} style offers great flexibility for personal touches`);
        suggestions.push("Consider what elements of this style speak to you most");
    }

    // Color palette suggestions
    if (colorPalette) {
      suggestions.push(`Your chosen colors can be incorporated through linens, flowers, and lighting`);
      suggestions.push("Consider using your colors in a 60-30-10 ratio (dominant, secondary, accent)");
    }

    // Must-have elements
    if (mustHaveElements && mustHaveElements.length > 0) {
      suggestions.push(`Make sure to prioritize your must-have elements: ${mustHaveElements.join(', ')}`);
      suggestions.push("Discuss these priorities with vendors during planning meetings");
    }

    res.json({ suggestions });
  } catch (error) {
    logError('ai-suggestions', error, { userId: req.userId, endpoint: 'style-suggestions' });
    res.status(500).json({ 
      error: "Failed to generate style suggestions",
      suggestions: ["Focus on elements that reflect your personality as a couple"]
    });
  }
});

export default router;