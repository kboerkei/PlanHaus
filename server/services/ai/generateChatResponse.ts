import { generatePromptResponse } from "./client";

export interface ChatResponseData {
  coupleNames?: string;
  weddingDate?: string;
  daysUntilWedding?: string | number;
  guestCount?: number;
  budget?: string | number;
  location?: string;
  completedTasks?: number;
  totalTasks?: number;
  budgetSpent?: number;
  currentPage?: string;
}

export async function generateChatResponse(
  weddingData: ChatResponseData,
  userMessage: string
): Promise<string> {
  // Extract personalized wedding details
  const coupleNames = weddingData.coupleNames || "the happy couple";
  const weddingDate = weddingData.weddingDate || "your wedding day";
  const guestCount = weddingData.guestCount || "your guests";
  const budgetTotal = weddingData.budget || "your budget";
  const location = weddingData.location || "your venue";
  const completedTasks = weddingData.completedTasks || 0;
  const totalTasks = weddingData.totalTasks || 0;
  const daysUntilWedding = weddingData.daysUntilWedding || "many";

  const systemMessage = `You are PlanBot, a friendly, helpful AI-powered wedding planner named PlanBot. 
Your job is to assist couples planning their wedding by offering personalized suggestions, reminders, and creative ideas.

You know:
- The couple: ${coupleNames}
- Wedding date: ${weddingDate} (${daysUntilWedding} days away)
- Expected guests: ${guestCount} people
- Budget: $${budgetTotal}
- Location: ${location}
- Progress: ${completedTasks}/${totalTasks} tasks completed

You should:
- Suggest checklists or ideas when asked
- Offer encouragement and celebrate progress
- Keep responses clear, conversational, and human-like
- Ask clarifying questions when needed
- Consider the timeline urgency based on days until wedding
- Avoid long robotic answers - be friendly and supportive

Respond directly to the user's message with helpful wedding planning advice.`;

  const userPrompt = `User message: "${userMessage}"

Based on ${coupleNames}'s wedding planning context and current progress, provide a helpful, conversational response. 
Keep it friendly and personalized to their specific situation.`;

  try {
    const response = await generatePromptResponse(
      systemMessage,
      userPrompt,
      "I'm here to help with your wedding planning! What specific aspect would you like guidance on?",
      { 
        source: 'generateChatResponse',
        inputs: { userMessage, coupleNames, daysUntilWedding }
      }
    );

    // Return the response as a string
    return typeof response === 'string' ? response : response?.recommendation || response?.response || "I'm here to help with your wedding planning!";
  } catch (error) {
    console.error('Chat response generation failed:', error);
    return "I'm here to help with your wedding planning! What specific aspect would you like guidance on?";
  }
}