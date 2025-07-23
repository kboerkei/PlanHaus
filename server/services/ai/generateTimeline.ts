import { generatePromptResponse } from "./client";
import { TimelineResponseSchema, type TimelineItem, type WeddingPlanningInput } from "./schemas";

const DEFAULT_TIMELINE: TimelineItem[] = [
  {
    week: 52,
    title: "Start Planning",
    description: "Begin your wedding planning journey by setting your budget and guest list",
    category: "Planning",
    priority: "high"
  },
  {
    week: 48,
    title: "Venue Research",
    description: "Research and visit potential wedding venues",
    category: "Venue",
    priority: "high"
  },
  {
    week: 40,
    title: "Book Major Vendors",
    description: "Book photographer, caterer, and entertainment",
    category: "Vendors",
    priority: "high"
  }
];

export async function generateWeddingTimeline(input: WeddingPlanningInput): Promise<TimelineItem[]> {
  const systemMessage = "You are an expert wedding planner. Create detailed, actionable wedding planning timelines with realistic timeframes and priorities.";
  
  const userPrompt = `Create a detailed wedding planning timeline for a wedding with these details:
    - Budget: $${input.budget}
    - Guest Count: ${input.guestCount}
    - Wedding Date: ${input.date}
    - Venue: ${input.venue || 'TBD'}
    - Theme: ${input.theme || 'Classic'}
    - Style: ${input.style || 'Traditional'}
    - Special Preferences: ${input.preferences || 'None specified'}

    Generate a comprehensive 52-week timeline with tasks organized by week, starting from 12 months before the wedding. 
    Include priority levels and categories. Return the result as a JSON object with this exact format:
    { "timeline": [{"week": number, "title": string, "description": string, "category": string, "priority": "high"|"medium"|"low"}] }`;

  const response = await generatePromptResponse(
    systemMessage,
    userPrompt,
    { timeline: DEFAULT_TIMELINE },
    { 
      source: 'generateTimeline',
      inputs: { budget: input.budget, guestCount: input.guestCount, date: input.date }
    }
  );

  // Validate response structure
  const validationResult = TimelineResponseSchema.safeParse(response);
  
  if (!validationResult.success) {
    console.warn('Timeline validation failed, using default timeline:', validationResult.error);
    return DEFAULT_TIMELINE;
  }

  return validationResult.data.timeline;
}