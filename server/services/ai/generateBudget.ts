import { generatePromptResponse } from "./client";
import { BudgetResponseSchema, type BudgetBreakdown, type WeddingPlanningInput } from "./schemas";

const DEFAULT_BUDGET: BudgetBreakdown[] = [
  {
    category: "Venue",
    estimatedCost: 0,
    percentage: 40,
    description: "Reception venue, ceremony location, and associated fees"
  },
  {
    category: "Catering",
    estimatedCost: 0,
    percentage: 30,
    description: "Food, beverages, and service staff"
  },
  {
    category: "Photography",
    estimatedCost: 0,
    percentage: 10,
    description: "Wedding photographer and videographer services"
  },
  {
    category: "Attire",
    estimatedCost: 0,
    percentage: 8,
    description: "Wedding dress, suit/tux, shoes, and accessories"
  },
  {
    category: "Music/Entertainment",
    estimatedCost: 0,
    percentage: 5,
    description: "DJ, band, or live entertainment for ceremony and reception"
  },
  {
    category: "Flowers/Decor",
    estimatedCost: 0,
    percentage: 4,
    description: "Bridal bouquet, centerpieces, and ceremony decorations"
  },
  {
    category: "Miscellaneous",
    estimatedCost: 0,
    percentage: 3,
    description: "Transportation, favors, and unexpected expenses"
  }
];

export async function generateBudgetBreakdown(input: WeddingPlanningInput): Promise<BudgetBreakdown[]> {
  const systemMessage = "You are an expert wedding financial planner. Create realistic budget breakdowns based on industry standards and current market rates.";
  
  const userPrompt = `Create a detailed budget breakdown for a wedding with these details:
    - Total Budget: $${input.budget}
    - Guest Count: ${input.guestCount}
    - Venue: ${input.venue || 'TBD'}
    - Theme: ${input.theme || 'Classic'}
    - Style: ${input.style || 'Traditional'}

    Generate a comprehensive budget breakdown with typical wedding categories and their recommended allocations.
    Calculate actual dollar amounts based on the total budget and include realistic percentages.
    Return as JSON with this exact format: 
    { "breakdown": [{"category": string, "estimatedCost": number, "percentage": number, "description": string}] }`;

  const response = await generatePromptResponse(
    systemMessage,
    userPrompt,
    { breakdown: calculateDefaultBudget(input.budget) },
    { 
      source: 'generateBudget',
      inputs: { budget: input.budget, guestCount: input.guestCount }
    }
  );

  // Validate response structure
  const validationResult = BudgetResponseSchema.safeParse(response);
  
  if (!validationResult.success) {
    console.warn('Budget validation failed, using default budget:', validationResult.error);
    return calculateDefaultBudget(input.budget);
  }

  return validationResult.data.breakdown;
}

function calculateDefaultBudget(totalBudget: number): BudgetBreakdown[] {
  return DEFAULT_BUDGET.map(item => ({
    ...item,
    estimatedCost: Math.round((totalBudget * item.percentage) / 100)
  }));
}