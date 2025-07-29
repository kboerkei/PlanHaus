import { generatePromptResponse } from "./client";
import { PersonalizedRecommendationSchema, type PersonalizedRecommendation } from "./schemas";

const DEFAULT_RECOMMENDATION: PersonalizedRecommendation = {
  recommendation: "Continue with your current planning progress. Focus on booking major vendors and finalizing key decisions.",
  priority: "medium",
  reasoning: "Based on typical wedding planning timelines, you're making good progress. Keep momentum by tackling high-priority items."
};

export async function generatePersonalizedRecommendation(
  weddingData: any,
  context: string
): Promise<PersonalizedRecommendation> {
  // Extract personalized wedding details for richer context
  const coupleNames = weddingData.coupleNames || "the happy couple";
  const weddingDate = weddingData.weddingDate || "your wedding day";
  const guestCount = weddingData.guestCount || "your guests";
  const budgetTotal = weddingData.budget || "your budget";
  const location = weddingData.location || "your venue";
  const completedTasks = weddingData.completedTasks || 0;
  const totalTasks = weddingData.totalTasks || 0;
  const daysUntilWedding = weddingData.daysUntilWedding || "many";

  const systemMessage = `You are PlanBot, a friendly, helpful AI-powered wedding planner. 
Your job is to assist couples planning their wedding by offering personalized suggestions, reminders, and creative ideas.

You know:
- The couple: ${coupleNames}
- Wedding date: ${weddingDate} (${daysUntilWedding} days away)
- Expected guests: ${guestCount} people
- Budget: $${budgetTotal}
- Location: ${location}
- Progress: ${completedTasks}/${totalTasks} tasks completed

You should:
- Provide specific, actionable wedding planning advice
- Offer encouragement and celebrate progress
- Keep responses clear, conversational, and human-like
- Ask clarifying questions when needed
- Consider the timeline urgency based on days until wedding
- Avoid long robotic answers - be friendly and supportive`;
  
  const userPrompt = `Based on the wedding planning progress and context "${context}", provide a personalized recommendation for ${coupleNames}.

    Current Planning Status:
    - Wedding Date: ${weddingDate} (${daysUntilWedding} days away)
    - Tasks Completed: ${completedTasks} out of ${totalTasks}
    - Budget: $${budgetTotal}
    - Guest Count: ${guestCount}
    - Location: ${location}

    Analyze their current progress and provide an actionable recommendation with priority level and reasoning.
    Consider their timeline urgency, completed tasks, and what typically needs attention at this stage.
    
    Return as JSON with this exact format: 
    { "recommendation": string, "priority": "high"|"medium"|"low", "reasoning": string }`;

  const response = await generatePromptResponse(
    systemMessage,
    userPrompt,
    DEFAULT_RECOMMENDATION,
    { 
      source: 'generateRecommendation',
      inputs: { context, dataKeys: Object.keys(weddingData || {}) }
    }
  );

  // Validate response structure
  const validationResult = PersonalizedRecommendationSchema.safeParse(response);
  
  if (!validationResult.success) {
    console.warn('Recommendation validation failed, using default:', validationResult.error);
    return DEFAULT_RECOMMENDATION;
  }

  return validationResult.data;
}