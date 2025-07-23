import { z } from "zod";

// Validation schemas for OpenAI responses
export const TimelineItemSchema = z.object({
  week: z.number().min(1).max(52),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  priority: z.enum(['high', 'medium', 'low'])
});

export const BudgetBreakdownSchema = z.object({
  category: z.string().min(1),
  estimatedCost: z.number().min(0),
  percentage: z.number().min(0).max(100),
  description: z.string().min(1)
});

export const VendorSuggestionSchema = z.object({
  category: z.string().min(1),
  suggestions: z.array(z.string()),
  considerations: z.array(z.string())
});

export const PersonalizedRecommendationSchema = z.object({
  recommendation: z.string().min(1),
  priority: z.enum(['high', 'medium', 'low']),
  reasoning: z.string().min(1)
});

export const WeddingThemeAnalysisSchema = z.object({
  theme: z.string().min(1),
  colors: z.array(z.string()),
  style: z.string().min(1),
  suggestions: z.array(z.string())
});

// Response wrappers
export const TimelineResponseSchema = z.object({
  timeline: z.array(TimelineItemSchema)
});

export const BudgetResponseSchema = z.object({
  breakdown: z.array(BudgetBreakdownSchema)
});

export const VendorResponseSchema = z.object({
  vendors: z.array(VendorSuggestionSchema)
});

// Types
export type TimelineItem = z.infer<typeof TimelineItemSchema>;
export type BudgetBreakdown = z.infer<typeof BudgetBreakdownSchema>;
export type VendorSuggestion = z.infer<typeof VendorSuggestionSchema>;
export type PersonalizedRecommendation = z.infer<typeof PersonalizedRecommendationSchema>;
export type WeddingThemeAnalysis = z.infer<typeof WeddingThemeAnalysisSchema>;

export interface WeddingPlanningInput {
  budget: number;
  guestCount: number;
  date: string;
  venue?: string;
  theme?: string;
  style?: string;
  preferences?: string;
}