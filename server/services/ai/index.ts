// Main AI services index - centralized exports
export { generateWeddingTimeline } from './generateTimeline';
export { generateBudgetBreakdown } from './generateBudget';
export { generateVendorSuggestions } from './generateVendors';
export { generatePersonalizedRecommendation } from './generateRecommendation';
export { analyzeWeddingTheme, analyzeMultipleImages } from './analyzeTheme';

// Re-export types and schemas
export type {
  TimelineItem,
  BudgetBreakdown,
  VendorSuggestion,
  PersonalizedRecommendation,
  WeddingThemeAnalysis,
  WeddingPlanningInput
} from './schemas';

export {
  TimelineItemSchema,
  BudgetBreakdownSchema,
  VendorSuggestionSchema,
  PersonalizedRecommendationSchema,
  WeddingThemeAnalysisSchema
} from './schemas';

// Re-export client utilities for advanced usage
export { generatePromptResponse, generateImageAnalysisResponse, isDebugMode } from './client';