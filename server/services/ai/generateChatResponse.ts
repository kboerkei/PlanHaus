import { generateChatResponse as generateChatResponseFromClient } from "./client";

export interface ChatResponseData {
  coupleNames?: string;
  userName?: string;
  weddingDate?: string;
  daysUntilWedding?: string | number;
  guestCount?: number;
  budget?: string | number;
  location?: string;
  theme?: string;
  style?: string;
  completedTasks?: number;
  totalTasks?: number;
  budgetSpent?: number;
  currentPage?: string;
}

export async function generateChatResponse(
  weddingData: ChatResponseData,
  userMessage: string
): Promise<string> {
  // Extract personalized wedding details from user intake data
  const coupleNames = weddingData.coupleNames || "the happy couple";
  const userName = weddingData.userName || "there";
  const weddingDate = weddingData.weddingDate || "your wedding day";
  const guestCount = weddingData.guestCount || "your guests";
  const budgetTotal = weddingData.budget || "your budget";
  const location = weddingData.location || "your venue";
  const theme = weddingData.theme || "your chosen theme";
  const style = weddingData.style || "your style preferences";
  const completedTasks = weddingData.completedTasks || 0;
  const totalTasks = weddingData.totalTasks || 0;
  const daysUntilWedding = weddingData.daysUntilWedding || "many";

  const systemMessage = `You are PlanBot, a warm, intelligent, and helpful AI wedding planner.

Your job is to help users plan their wedding by answering questions, giving suggestions, and keeping them on track.

You are planning for:
- Couple: ${coupleNames || "The couple"}
- Wedding date: ${weddingDate} (${daysUntilWedding} days away)
- Guest count: ${guestCount || "unknown"}
- Budget: $${budgetTotal || "unknown"}
- Venue: ${location || "unknown"}
- Theme: ${theme || "not specified"}
- Style: ${style || "not specified"}
- Progress: ${completedTasks}/${totalTasks} tasks completed

You should:
- Offer tailored suggestions (e.g., vendor ideas, budgeting help, next tasks)
- Be friendly and encouraging, never robotic
- Ask clarifying questions if a user is vague
- Reference their timeline or checklist progress when helpful
- Keep responses concise, helpful, and fun

Examples:
• If they ask "what's next?", suggest relevant checklist tasks based on date
• If they ask about themes, suggest 3 options based on their style
• If they're behind, reassure them it's okay and help them catch up

Never say you're just an AI model — you're their planning partner!`;

  const userPrompt = userMessage;

  try {
    const response = await generateChatResponseFromClient(
      systemMessage,
      userPrompt,
      { 
        source: 'generateChatResponse',
        inputs: { userMessage, coupleNames, daysUntilWedding }
      }
    );

    // Return the response directly as a string (no JSON parsing needed)
    return response;
  } catch (error) {
    console.error('Chat response generation failed:', error);
    
    // Provide more helpful fallback responses based on the user's question and wedding context
    return generateSmartFallback(userMessage, weddingData);
  }
}

// Smart fallback responses when AI is unavailable
function generateSmartFallback(userMessage: string, weddingData: ChatResponseData): string {
  const message = userMessage.toLowerCase();
  const daysUntil = typeof weddingData.daysUntilWedding === 'number' ? weddingData.daysUntilWedding : 79;
  const coupleNames = weddingData.coupleNames || "you two";
  
  // Track question patterns
  if (message.includes('on track') || message.includes('timeline') || message.includes('schedule')) {
    return `Based on your wedding being ${daysUntil} days away, you're in a good planning window! With ${daysUntil} days left, focus on booking major vendors (venue, catering, photography) and sending save-the-dates. I'd recommend checking your task list to see what's most urgent.`;
  }
  
  if (message.includes('focus') || message.includes('priority') || message.includes('next')) {
    return `For ${coupleNames} with ${daysUntil} days until your wedding, I'd suggest prioritizing: 1) Venue booking (if not done), 2) Photographer selection, 3) Catering decisions, and 4) Guest list finalization. Check your timeline page to see which tasks need attention first.`;
  }
  
  if (message.includes('budget') || message.includes('cost') || message.includes('money')) {
    return `With ${daysUntil} days to go, now's a great time to review your budget allocation. Major expenses like venue, catering, and photography typically take 60-70% of your budget. Check your budget page to see how you're tracking against your planned spending.`;
  }
  
  if (message.includes('guest') || message.includes('invite') || message.includes('rsvp')) {
    return `For a wedding ${daysUntil} days away, you should have your guest list finalized and save-the-dates sent. If you haven't already, start planning your invitation timeline - typically sent 6-8 weeks before the wedding.`;
  }
  
  if (message.includes('vendor') || message.includes('photographer') || message.includes('caterer')) {
    return `With ${daysUntil} days until your wedding, vendor booking is crucial. Focus on the big three first: venue, catering, and photography. These book up fastest and form the foundation of your day. Check the vendors page to see your current options.`;
  }
  
  // Default helpful response with personalized context
  return `Hi ${coupleNames}! With ${daysUntil} days until your wedding, I'm here to help with your planning. I can assist with timeline management, budget advice, vendor recommendations, and guest planning. What specific area would you like guidance on?`;
}