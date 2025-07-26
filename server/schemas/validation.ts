import { z } from 'zod';
import { insertTaskSchema, insertGuestSchema, insertBudgetItemSchema, insertVendorSchema } from '@shared/schema';

// Enhanced validation schemas with security rules
export const secureTaskSchema = insertTaskSchema.extend({
  title: z.string().min(1).max(200).regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Invalid characters in title'),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().datetime().optional(),
}).refine(data => {
  // Prevent XSS in title
  const hasScript = /<script|javascript:|on\w+=/i.test(data.title || '');
  return !hasScript;
}, { message: 'Invalid title content' });

export const secureGuestSchema = insertGuestSchema.extend({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s\-'.]+$/, 'Invalid characters in name'),
  email: z.string().email().max(255).optional().or(z.literal('')),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/).max(20).optional().or(z.literal('')),
  group: z.enum(['wedding_party', 'family', 'friends', 'colleagues', 'other']).default('other'),
  rsvpStatus: z.enum(['pending', 'yes', 'no', 'maybe']).default('pending'),
  plusOne: z.boolean().default(false),
  mealPreference: z.string().max(50).optional().or(z.literal('')),
  dietaryRestrictions: z.string().max(200).optional().or(z.literal(''))
});

export const secureBudgetSchema = insertBudgetItemSchema.extend({
  category: z.enum(['venue', 'catering', 'photography', 'flowers', 'music', 'attire', 'rings', 'transportation', 'other']),
  item: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s\-_.,()]+$/, 'Invalid characters in item name'),
  estimatedCost: z.string().regex(/^\d+(\.\d{2})?$/, 'Invalid cost format'),
  actualCost: z.string().regex(/^\d+(\.\d{2})?$/, 'Invalid cost format').optional().or(z.literal('')),
  vendor: z.string().max(100).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
  isPaid: z.boolean().default(false)
});

export const secureVendorSchema = insertVendorSchema.extend({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s\-_.,&']+$/, 'Invalid characters in vendor name'),
  category: z.enum(['venue', 'catering', 'photography', 'flowers', 'music', 'other']),
  email: z.string().email().max(255).optional().or(z.literal('')),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/).max(20).optional().or(z.literal('')),
  website: z.string().url().max(255).optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  quote: z.string().regex(/^\d+(\.\d{2})?$/, 'Invalid quote format').optional().or(z.literal('')),
  status: z.enum(['researching', 'contacted', 'quote_received', 'contract_sent', 'booked']).default('researching'),
  notes: z.string().max(1000).optional().or(z.literal(''))
});

// Pagination and search schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).max(100).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().max(100).optional(),
  sort: z.enum(['name', 'date', 'category', 'status']).optional(),
  order: z.enum(['asc', 'desc']).default('asc')
});

// Project ID validation
export const projectIdSchema = z.coerce.number().min(1).max(999999);

// Generic sanitization helpers
export function sanitizeString(str: string): string {
  return str
    .replace(/<script[^>]*?>.*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.issues.map(i => i.message).join(', ')}`);
  }
  return result.data;
}