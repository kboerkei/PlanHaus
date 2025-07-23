import { generatePromptResponse } from "./client";
import { VendorResponseSchema, type VendorSuggestion, type WeddingPlanningInput } from "./schemas";

const DEFAULT_VENDORS: VendorSuggestion[] = [
  {
    category: "Photography",
    suggestions: [
      "Review portfolios and wedding galleries",
      "Check availability for your wedding date",
      "Compare packages and pricing structures",
      "Read reviews from recent couples"
    ],
    considerations: [
      "Photography style matches your vision",
      "Experience with your venue type",
      "Backup equipment and contingency plans",
      "Timeline for photo delivery"
    ]
  },
  {
    category: "Catering",
    suggestions: [
      "Schedule tastings with top choices",
      "Verify licensing and insurance",
      "Discuss dietary restrictions and allergies",
      "Review service staff ratios"
    ],
    considerations: [
      "Menu flexibility and customization",
      "Service style (plated, buffet, family style)",
      "Equipment and setup requirements",
      "Cancellation and change policies"
    ]
  },
  {
    category: "Venue",
    suggestions: [
      "Visit venues at the same time as your wedding",
      "Understand what's included in rental fee",
      "Check availability and booking timeline",
      "Review venue policies and restrictions"
    ],
    considerations: [
      "Capacity matches your guest count",
      "Indoor and outdoor options available",
      "Parking and accessibility features",
      "Vendor restrictions and preferred lists"
    ]
  }
];

export async function generateVendorSuggestions(input: WeddingPlanningInput): Promise<VendorSuggestion[]> {
  const systemMessage = "You are an expert wedding vendor coordinator. Provide practical vendor suggestions and considerations based on budget, location, and wedding style.";
  
  const userPrompt = `Suggest vendor categories and considerations for a wedding with these details:
    - Budget: $${input.budget}
    - Guest Count: ${input.guestCount}
    - Venue: ${input.venue || 'TBD'}
    - Theme: ${input.theme || 'Classic'}
    - Style: ${input.style || 'Traditional'}
    - Date: ${input.date}

    Generate vendor suggestions with categories, what to look for, and key considerations.
    Focus on the most important vendor categories for this budget level and wedding size.
    Return as JSON with this exact format: 
    { "vendors": [{"category": string, "suggestions": string[], "considerations": string[]}] }`;

  const response = await generatePromptResponse(
    systemMessage,
    userPrompt,
    { vendors: DEFAULT_VENDORS },
    { 
      source: 'generateVendors',
      inputs: { budget: input.budget, guestCount: input.guestCount, venue: input.venue }
    }
  );

  // Validate response structure
  const validationResult = VendorResponseSchema.safeParse(response);
  
  if (!validationResult.success) {
    console.warn('Vendor suggestions validation failed, using defaults:', validationResult.error);
    return DEFAULT_VENDORS;
  }

  return validationResult.data.vendors;
}