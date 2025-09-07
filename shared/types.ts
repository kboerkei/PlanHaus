// Centralized type definitions for the wedding planning app

export interface User {
  id: string;
  email: string;
  username: string;
  hasCompletedIntake: boolean;
  avatar?: string;
  createdAt?: string;
}

export interface WeddingProject {
  id: number;
  name: string;
  date: string;
  venue?: string;
  theme?: string;
  budget?: string;
  guestCount?: number;
  style?: string;
  description?: string;
  createdBy: number;
  createdAt: string;
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  category?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  customDate?: string;
  defaultTimeframe?: string;
  timeframeOrder?: number;
  assignedTo?: string;
  notes?: string;
  isCompleted: boolean;
  isFromTemplate: boolean;
  defaultTaskId?: number;
  createdBy: number;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface Guest {
  id: number;
  projectId: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  rsvpStatus: 'pending' | 'yes' | 'no' | 'maybe';
  mealPreference?: string;
  plusOne: boolean;
  group?: 'wedding_party' | 'family' | 'friends' | 'colleagues' | 'other';
  notes?: string;
  hotel?: string;
  hotelAddress?: string;
  checkInDate?: string;
  checkOutDate?: string;
  addedBy: number;
  addedAt: string;
}

export interface Vendor {
  id: number;
  projectId: number;
  name: string;
  category: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  contactPerson?: string;
  priceRange?: string;
  bookingStatus: 'researching' | 'contacted' | 'meeting_scheduled' | 'proposal_received' | 'contract_sent' | 'booked' | 'cancelled';
  rating?: number;
  notes?: string;
  isBooked: boolean;
  contractSigned?: boolean;
  contractSignedDate?: string;
  addedBy: number;
  addedAt: string;
}

export interface BudgetItem {
  id: number;
  projectId: number;
  category: string;
  item: string;
  estimatedCost: string;
  actualCost?: string;
  vendor?: string;
  notes?: string;
  isPaid: boolean;
  paidDate?: string;
  createdBy: number;
  createdAt: string;
}

export interface InspirationItem {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  sourceUrl?: string;
  category?: string;
  tags?: string[];
  addedBy: number;
  addedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  tasks: {
    total: number;
    completed: number;
    overdue: number;
    highPriority: number;
  };
  guests: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
  };
  budget: {
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    percentageUsed: number;
  };
  vendors: {
    total: number;
    booked: number;
    contacted: number;
    researching: number;
  };
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Filter and search types
export interface FilterOptions {
  search?: string;
  category?: string;
  status?: string;
  priority?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Export types
export interface ExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  includeImages?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: string[];
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'task_update' | 'guest_update' | 'budget_update' | 'vendor_update' | 'activity_log';
  projectId: number;
  userId: number;
  data: any;
  timestamp: string;
}

// Server-side Type Definitions - Comprehensive type definitions for server entities

// User Session Types
export interface UserSession {
  id: string;
  userId: number;
  expiresAt: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface InsertUserSession {
  id: string;
  userId: number;
  expiresAt: string;
  userAgent?: string;
  ipAddress?: string;
}

// Wedding Overview Types
export interface WeddingOverview {
  id: number;
  projectId: number;
  theme: string;
  colorPalette: string;
  styleNotes: string;
  inspirationImages: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertWeddingOverview {
  projectId: number;
  theme: string;
  colorPalette: string;
  styleNotes: string;
  inspirationImages: string;
}

// Vendor Payment Types
export interface VendorPayment {
  id: number;
  vendorId: number;
  projectId: number;
  amount: number;
  paymentType: 'deposit' | 'partial' | 'final';
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertVendorPayment {
  vendorId: number;
  projectId: number;
  amount: number;
  paymentType: 'deposit' | 'partial' | 'final';
  dueDate: string;
  paidDate?: string;
  status?: 'pending' | 'paid' | 'overdue';
  notes?: string;
}

// Shopping List Types
export interface ShoppingList {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertShoppingList {
  projectId: number;
  name: string;
  description?: string;
  isCompleted?: boolean;
}

// Shopping Item Types
export interface ShoppingItem {
  id: number;
  listId: number;
  projectId: number;
  name: string;
  quantity: number;
  unit: string;
  isPurchased: boolean;
  purchasedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertShoppingItem {
  listId: number;
  projectId: number;
  name: string;
  quantity: number;
  unit: string;
  isPurchased?: boolean;
  purchasedAt?: string;
  notes?: string;
}

// Activity Log Types
export interface ActivityLogEntry {
  id: number;
  projectId: number;
  userId: number;
  userName: string;
  section: string;
  action: string;
  entityType: string;
  entityId: number;
  details: Record<string, any>;
  timestamp: string;
  createdAt: string;
}

export interface InsertActivityLogEntry {
  projectId: number;
  userId: number;
  userName: string;
  section: string;
  action: string;
  entityType: string;
  entityId: number;
  details: Record<string, any>;
  timestamp?: string;
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Request Types
export interface RequestWithUser extends Request {
  userId: number;
  user?: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
}

// Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Database Types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

// Logging Types
export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
  userId?: number;
  requestId?: string;
}

// Cache Types
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
}

// Authentication Types
export interface AuthToken {
  token: string;
  expiresAt: string;
  userId: number;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// File Upload Types
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedBy: number;
  projectId?: number;
  createdAt: string;
}

export interface UploadConfig {
  maxSize: number;
  allowedTypes: string[];
  destination: string;
  filename?: (file: Express.Multer.File) => string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
}

export interface InsertNotification {
  userId: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read?: boolean;
  expiresAt?: string;
  actionUrl?: string;
}