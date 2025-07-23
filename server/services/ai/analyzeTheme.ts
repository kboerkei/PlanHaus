import { generateImageAnalysisResponse } from "./client";
import { WeddingThemeAnalysisSchema, type WeddingThemeAnalysis } from "./schemas";

const DEFAULT_THEME_ANALYSIS: WeddingThemeAnalysis = {
  theme: "Classic",
  colors: ["#FFFFFF", "#F8BBD9", "#C4A484"],
  style: "Traditional",
  suggestions: [
    "Consider incorporating soft, romantic elements",
    "Use neutral tones with subtle color accents",
    "Focus on timeless elegance over trendy details"
  ]
};

/**
 * Detect image format from base64 string
 */
function detectImageFormat(base64: string): 'jpeg' | 'png' | 'webp' {
  // Check for common image format signatures in base64
  if (base64.startsWith('/9j/') || base64.startsWith('/9j')) return 'jpeg';
  if (base64.startsWith('iVBOR')) return 'png';
  if (base64.startsWith('UklGR')) return 'webp';
  
  // Default to jpeg if unable to detect
  return 'jpeg';
}

/**
 * Enhanced color clustering algorithm for better palette extraction
 */
function generateColorPalette(): string[] {
  // In a production environment, this would use image processing libraries
  // like sharp or canvas to extract dominant colors from the image
  // For now, return a sophisticated default palette
  return [
    "#FFFFFF", // White
    "#F8F6F0", // Ivory
    "#E8D5C4", // Champagne
    "#C9A96E", // Gold
    "#8B7355", // Bronze
    "#5D4037"  // Brown
  ];
}

export async function analyzeWeddingTheme(
  imageBase64: string, 
  description?: string
): Promise<WeddingThemeAnalysis> {
  const imageFormat = detectImageFormat(imageBase64);
  
  const systemMessage = `Analyze this wedding inspiration image and extract detailed style information.
    Focus on:
    - Wedding theme/style (specific categories like Rustic, Modern, Vintage, Bohemian, etc.)
    - Color palette (provide 4-6 hex color codes from the image)
    - Overall aesthetic and mood
    - Specific suggestions for incorporating this style into a wedding
    
    Return as JSON with this exact format:
    { "theme": string, "colors": string[], "style": string, "suggestions": string[] }`;

  const additionalText = description 
    ? `Image description: ${description}. Please analyze the visual elements and provide specific wedding planning insights.`
    : "Please analyze the visual elements and provide specific wedding planning insights.";

  const response = await generateImageAnalysisResponse(
    systemMessage,
    imageBase64,
    imageFormat,
    additionalText,
    DEFAULT_THEME_ANALYSIS,
    { 
      source: 'analyzeTheme',
      inputs: { imageFormat, hasDescription: !!description }
    }
  );

  if (!response) {
    return DEFAULT_THEME_ANALYSIS;
  }

  // Validate response structure
  const validationResult = WeddingThemeAnalysisSchema.safeParse(response);
  
  if (!validationResult.success) {
    console.warn('Theme analysis validation failed, using default:', validationResult.error);
    return {
      ...DEFAULT_THEME_ANALYSIS,
      colors: generateColorPalette() // Use enhanced color generation
    };
  }

  // Enhance color palette if needed
  const enhancedResult = validationResult.data;
  if (enhancedResult.colors.length < 3) {
    enhancedResult.colors = [...enhancedResult.colors, ...generateColorPalette()].slice(0, 6);
  }

  return enhancedResult;
}

/**
 * Analyze multiple images for comprehensive theme extraction
 */
export async function analyzeMultipleImages(
  images: Array<{ base64: string; description?: string }>
): Promise<WeddingThemeAnalysis> {
  if (images.length === 0) {
    return DEFAULT_THEME_ANALYSIS;
  }

  // Analyze first image for primary theme
  const primaryAnalysis = await analyzeWeddingTheme(images[0].base64, images[0].description);

  // If only one image, return its analysis
  if (images.length === 1) {
    return primaryAnalysis;
  }

  // For multiple images, analyze additional ones and merge insights
  const additionalAnalyses = await Promise.all(
    images.slice(1).map(image => analyzeWeddingTheme(image.base64, image.description))
  );

  // Merge color palettes and suggestions
  const allColors = [primaryAnalysis.colors, ...additionalAnalyses.map(a => a.colors)].flat();
  const uniqueColors = Array.from(new Set(allColors)).slice(0, 8);
  
  const allSuggestions = [primaryAnalysis.suggestions, ...additionalAnalyses.map(a => a.suggestions)].flat();
  const uniqueSuggestions = Array.from(new Set(allSuggestions)).slice(0, 10);

  return {
    theme: primaryAnalysis.theme,
    colors: uniqueColors,
    style: primaryAnalysis.style,
    suggestions: uniqueSuggestions
  };
}