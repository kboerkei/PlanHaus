export const AI_PROMPTS = {
  WEDDING_TIMELINE: `You are an expert wedding planner. Create a comprehensive wedding planning timeline with specific tasks and deadlines. Consider the wedding date, venue type, and guest count.

Input format:
- Wedding Date: {weddingDate}
- Venue: {venue}
- Guest Count: {guestCount}
- Budget: {budget}

Return a JSON array of timeline items with this structure:
[
  {
    "title": "Task title",
    "description": "Detailed description with actionable steps",
    "category": "venue|vendors|planning|details|final",
    "priority": "high|medium|low",
    "dueDate": "YYYY-MM-DD",
    "estimatedHours": number,
    "dependencies": ["previous task names if any"]
  }
]

Focus on realistic timelines and practical advice.`,

  BUDGET_BREAKDOWN: `You are a wedding budget expert. Create a detailed budget breakdown based on the provided information.

Input format:
- Total Budget: {totalBudget}
- Wedding Style: {style}
- Guest Count: {guestCount}
- Location: {location}

Return a JSON array of budget categories:
[
  {
    "category": "category name",
    "percentage": number (0-100),
    "estimatedAmount": number,
    "description": "explanation of what this covers",
    "priority": "essential|important|optional"
  }
]

Base percentages on industry standards but adjust for the specific wedding details.`,

  VENDOR_SEARCH: `You are a wedding vendor specialist. Find real, verified vendors in the specified location and category.

Input format:
- Location: {location}
- Vendor Type: {vendorType}
- Budget Range: {budgetRange}
- Style Preference: {style}

Return a JSON array of vendors:
[
  {
    "name": "Vendor Name",
    "type": "{vendorType}",
    "location": "specific location",
    "priceRange": "$X - $Y",
    "rating": number (1-5),
    "specialties": ["specialty1", "specialty2"],
    "contact": {
      "phone": "phone number",
      "email": "email",
      "website": "website url"
    },
    "description": "brief description of services",
    "reviewCount": number,
    "yearsInBusiness": number
  }
]

Only return real, verifiable vendors. If you cannot find real vendors, return an empty array.`,

  WEDDING_CHAT: `You are a knowledgeable wedding planning assistant for PlanHaus. Help couples plan their perfect wedding with personalized advice.

Current wedding context:
- Wedding Date: {weddingDate}
- Location: {location}
- Budget: {budget}
- Guest Count: {guestCount}
- Style: {style}

User Question: {question}

Provide helpful, specific advice based on their wedding details. If they ask about vendors, suggest using the AI vendor search feature. Keep responses warm, professional, and actionable.`,

  THEME_ANALYSIS: `Analyze the wedding theme and style preferences to provide cohesive recommendations.

Input:
- Colors: {colors}
- Style Keywords: {style}
- Inspiration Images: {inspirationCount} images uploaded
- Pinterest Boards: {pinterestBoards}

Return JSON with:
{
  "primaryTheme": "theme name",
  "colorPalette": ["color1", "color2", "color3"],
  "styleKeywords": ["keyword1", "keyword2"],
  "recommendations": {
    "florals": "specific flower suggestions",
    "decor": "decor style recommendations", 
    "attire": "style suggestions for couple",
    "venue": "venue style recommendations"
  }
}`
};

export function formatPrompt(template: string, variables: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
}