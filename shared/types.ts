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