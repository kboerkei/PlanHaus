// Application constants and configuration

// API Configuration
export const API_CONFIG = {
  BASE_URL: '/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  GC_TIME: 10 * 60 * 1000, // 10 minutes
  RETRY_DELAY: 500,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_TEXT_LENGTH: 1000,
  MAX_TITLE_LENGTH: 255,
  MIN_PASSWORD_LENGTH: 8,
  MAX_GUESTS: 1000,
  MAX_BUDGET_ITEMS: 500,
  MAX_VENDORS: 200,
} as const;

// UI Constants
export const UI_CONFIG = {
  MOBILE_BREAKPOINT: 768,
  ITEMS_PER_PAGE: 20,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 5000,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  DASHBOARD_SMART_ACTIONS: false, // Set to false to disable Smart Actions
} as const;

// Wedding Planning Categories
export const CATEGORIES = {
  TASKS: [
    'venue', 'catering', 'photography', 'flowers', 'music', 
    'attire', 'planning', 'transportation', 'beauty', 'other'
  ],
  BUDGET: [
    'venue', 'catering', 'photography', 'flowers', 'music', 
    'attire', 'rings', 'transportation', 'beauty', 'other'
  ],
  VENDORS: [
    'venue', 'catering', 'photography', 'videography', 'flowers', 
    'music', 'transportation', 'beauty', 'cake', 'rentals', 
    'planning', 'other'
  ],
  INSPIRATION: [
    'decor', 'flowers', 'colors', 'venues', 'attire', 'cakes', 
    'centerpieces', 'lighting', 'stationery', 'other'
  ],
} as const;

// Status Options
export const STATUS_OPTIONS = {
  TASKS: ['pending', 'in_progress', 'completed'] as const,
  RSVP: ['pending', 'yes', 'no', 'maybe'] as const,
  VENDORS: [
    'researching', 'contacted', 'meeting_scheduled', 
    'proposal_received', 'contract_sent', 'booked', 'cancelled'
  ] as const,
  PRIORITY: ['low', 'medium', 'high'] as const,
} as const;

// Color Schemes
export const COLORS = {
  STATUS: {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  },
  PRIORITY: {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800',
  },
  RSVP: {
    pending: 'bg-yellow-100 text-yellow-800',
    yes: 'bg-green-100 text-green-800',
    no: 'bg-red-100 text-red-800',
    maybe: 'bg-blue-100 text-blue-800',
  },
} as const;

// Wedding Timeline Defaults
export const TIMELINE_DEFAULTS = {
  MONTHS_BEFORE: [
    { range: '12+', order: 1, label: '12+ months before' },
    { range: '9-12', order: 2, label: '9-12 months before' },
    { range: '6-9', order: 3, label: '6-9 months before' },
    { range: '4-6', order: 4, label: '4-6 months before' },
    { range: '2-4', order: 5, label: '2-4 months before' },
    { range: '1-2', order: 6, label: '1-2 months before' },
    { range: '2-4w', order: 7, label: '2-4 weeks before' },
    { range: '1w', order: 8, label: '1 week before' },
    { range: 'day', order: 9, label: 'Wedding day' },
  ],
} as const;

// Export Configuration
export const EXPORT_CONFIG = {
  FORMATS: ['excel', 'csv', 'pdf'] as const,
  MAX_EXPORT_SIZE: 50 * 1024 * 1024, // 50MB
  CHUNK_SIZE: 1000, // Items per chunk for large exports
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'A server error occurred. Please try again later.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image file.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully!',
  TASK_UPDATED: 'Task updated successfully!',
  TASK_COMPLETED: 'Task marked as completed!',
  GUEST_ADDED: 'Guest added successfully!',
  GUEST_UPDATED: 'Guest information updated!',
  BUDGET_ADDED: 'Budget item added successfully!',
  BUDGET_UPDATED: 'Budget item updated!',
  VENDOR_ADDED: 'Vendor added successfully!',
  VENDOR_UPDATED: 'Vendor information updated!',
  EXPORT_SUCCESS: 'Data exported successfully!',
  EMAIL_SENT: 'Email sent successfully!',
} as const;