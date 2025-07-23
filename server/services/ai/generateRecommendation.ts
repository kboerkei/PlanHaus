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
  const systemMessage = "You are an AI wedding planning assistant. Provide personalized, actionable recommendations based on wedding planning progress and timeline. Be specific and practical.";
  
  const userPrompt = `Based on this wedding planning data and context, provide a personalized recommendation:
    
    Wedding Data: ${JSON.stringify(weddingData, null, 2)}
    Context: ${context}
    
    Analyze the current progress and provide an actionable recommendation with priority level and reasoning.
    Consider the wedding timeline, completed tasks, pending items, and any urgent deadlines.
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