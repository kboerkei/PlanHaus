/**
 * Legacy OpenAI service file - now serves as a bridge to the new modular AI services
 * 
 * This file maintains backward compatibility while redirecting to the enhanced
 * modular AI services located in /services/ai/
 * 
 * @deprecated Use direct imports from /services/ai/ for new code
 */

// Re-export everything from the new modular AI services
export {
  generateWeddingTimeline,
  generateBudgetBreakdown,
  generateVendorSuggestions,
  generatePersonalizedRecommendation,
  analyzeWeddingTheme,
  analyzeMultipleImages
} from './ai';

// Re-export types for backward compatibility
export type {
  TimelineItem,
  BudgetBreakdown,
  VendorSuggestion,
  PersonalizedRecommendation,
  WeddingThemeAnalysis,
  WeddingPlanningInput
} from './ai';
