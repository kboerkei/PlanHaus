import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "your-api-key"
});

export interface WeddingPlanningInput {
  budget: number;
  guestCount: number;
  date: string;
  venue?: string;
  theme?: string;
  style?: string;
  preferences?: string;
}

export interface TimelineItem {
  week: number;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export interface BudgetBreakdown {
  category: string;
  estimatedCost: number;
  percentage: number;
  description: string;
}

export interface VendorSuggestion {
  category: string;
  suggestions: string[];
  considerations: string[];
}

export async function generateWeddingTimeline(input: WeddingPlanningInput): Promise<TimelineItem[]> {
  try {
    const prompt = `Create a detailed wedding planning timeline for a wedding with these details:
    - Budget: $${input.budget}
    - Guest Count: ${input.guestCount}
    - Wedding Date: ${input.date}
    - Venue: ${input.venue || 'TBD'}
    - Theme: ${input.theme || 'Classic'}
    - Style: ${input.style || 'Traditional'}
    - Special Preferences: ${input.preferences || 'None specified'}

    Generate a comprehensive 52-week timeline with tasks organized by week, starting from 12 months before the wedding. 
    Include priority levels and categories. Return the result as a JSON array with objects containing:
    { "week": number, "title": string, "description": string, "category": string, "priority": "high"|"medium"|"low" }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert wedding planner. Create detailed, actionable wedding planning timelines."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"timeline": []}');
    return result.timeline || [];
  } catch (error) {
    console.error("Error generating wedding timeline:", error);
    throw new Error("Failed to generate wedding timeline");
  }
}

export async function generateBudgetBreakdown(input: WeddingPlanningInput): Promise<BudgetBreakdown[]> {
  try {
    const prompt = `Create a detailed budget breakdown for a wedding with these details:
    - Total Budget: $${input.budget}
    - Guest Count: ${input.guestCount}
    - Venue: ${input.venue || 'TBD'}
    - Theme: ${input.theme || 'Classic'}
    - Style: ${input.style || 'Traditional'}

    Generate a comprehensive budget breakdown with typical wedding categories and their recommended allocations.
    Return as JSON with format: { "breakdown": [{"category": string, "estimatedCost": number, "percentage": number, "description": string}] }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert wedding financial planner. Create realistic budget breakdowns based on industry standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"breakdown": []}');
    return result.breakdown || [];
  } catch (error) {
    console.error("Error generating budget breakdown:", error);
    throw new Error("Failed to generate budget breakdown");
  }
}

export async function generateVendorSuggestions(input: WeddingPlanningInput): Promise<VendorSuggestion[]> {
  try {
    const prompt = `Suggest vendor categories and considerations for a wedding with these details:
    - Budget: $${input.budget}
    - Guest Count: ${input.guestCount}
    - Venue: ${input.venue || 'TBD'}
    - Theme: ${input.theme || 'Classic'}
    - Style: ${input.style || 'Traditional'}
    - Date: ${input.date}

    Generate vendor suggestions with categories, what to look for, and key considerations.
    Return as JSON: { "vendors": [{"category": string, "suggestions": string[], "considerations": string[]}] }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert wedding vendor coordinator. Provide practical vendor suggestions and considerations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"vendors": []}');
    return result.vendors || [];
  } catch (error) {
    console.error("Error generating vendor suggestions:", error);
    throw new Error("Failed to generate vendor suggestions");
  }
}

export async function generatePersonalizedRecommendation(
  weddingData: any,
  context: string
): Promise<{ recommendation: string; priority: string; reasoning: string }> {
  try {
    const prompt = `Based on this wedding planning data and context, provide a personalized recommendation:
    
    Wedding Data: ${JSON.stringify(weddingData)}
    Context: ${context}
    
    Analyze the current progress and provide an actionable recommendation with priority level and reasoning.
    Return as JSON: { "recommendation": string, "priority": "high"|"medium"|"low", "reasoning": string }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI wedding planning assistant. Provide personalized, actionable recommendations based on wedding planning progress and timeline."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      recommendation: result.recommendation || "Continue with your current planning progress.",
      priority: result.priority || "medium",
      reasoning: result.reasoning || "Based on typical wedding planning timelines."
    };
  } catch (error) {
    console.error("Error generating recommendation:", error);
    throw new Error("Failed to generate recommendation");
  }
}

export async function analyzeWeddingTheme(imageBase64: string, description?: string): Promise<{
  theme: string;
  colors: string[];
  style: string;
  suggestions: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this wedding inspiration image${description ? ` (${description})` : ''} and extract:
              - Wedding theme/style
              - Color palette (hex codes)
              - Overall aesthetic
              - Suggestions for incorporating this style
              
              Return as JSON: { "theme": string, "colors": string[], "style": string, "suggestions": string[] }`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      theme: result.theme || "Classic",
      colors: result.colors || ["#FFFFFF", "#F8BBD9"],
      style: result.style || "Traditional",
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error("Error analyzing wedding theme:", error);
    throw new Error("Failed to analyze wedding theme");
  }
}
