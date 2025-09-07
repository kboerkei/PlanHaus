// Entity Types - Comprehensive type definitions for all application entities

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'user' | 'admin';
  hasCompletedIntake: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface InsertUser {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: 'user' | 'admin';
  hasCompletedIntake?: boolean;
  isEmailVerified?: boolean;
}

// Project Types
export interface WeddingProject {
  id: number;
  name: string;
  description?: string;
  weddingDate?: string;
  venue?: string;
  theme?: string;
  budget?: number;
  guestCount?: number;
  style?: string;
  ceremonyTime?: string;
  receptionTime?: string;
  colors?: string;
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface InsertWeddingProject {
  name: string;
  description?: string;
  weddingDate?: string;
  venue?: string;
  theme?: string;
  budget?: number;
  guestCount?: number;
  style?: string;
  ceremonyTime?: string;
  receptionTime?: string;
  colors?: string;
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  createdBy: number;
}

// Task Types
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  category: 'planning' | 'venue' | 'catering' | 'photography' | 'flowers' | 'music' | 'attire' | 'invitations' | 'decorations' | 'other';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: number;
  projectId: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isCompleted: boolean;
  completed?: boolean; // Alias for isCompleted for backward compatibility
  notes?: string;
  estimatedHours?: number;
  actualHours?: number;
  timeframeOrder?: number;
  isRecurring?: boolean;
  recurrencePattern?: string;
  parentTaskId?: number;
}

export interface InsertTask {
  title: string;
  description?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  category?: 'planning' | 'venue' | 'catering' | 'photography' | 'flowers' | 'music' | 'attire' | 'invitations' | 'decorations' | 'other';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: number;
  projectId: number;
  createdBy: number;
  isCompleted?: boolean;
  notes?: string;
  estimatedHours?: number;
  actualHours?: number;
  timeframeOrder?: number;
  isRecurring?: boolean;
  recurrencePattern?: string;
  parentTaskId?: number;
}

// Budget Types
export interface BudgetItem {
  id: number;
  category: string;
  item: string;
  estimatedCost?: number | string;
  actualCost?: number | string;
  vendor?: string;
  notes?: string;
  isPaid: boolean;
  paymentDue?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'quoted' | 'booked' | 'paid' | 'cancelled';
  projectId: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  vendorId?: number;
}

export interface InsertBudgetItem {
  category: string;
  item: string;
  estimatedCost?: number;
  actualCost?: number;
  vendor?: string;
  notes?: string;
  isPaid?: boolean;
  paymentDue?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'planned' | 'quoted' | 'booked' | 'paid' | 'cancelled';
  projectId: number;
  createdBy: number;
  vendorId?: number;
}

// Guest Types
export interface Guest {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  group?: string;
  rsvpStatus?: 'pending' | 'confirmed' | 'declined' | 'maybe';
  mealPreference?: string;
  plusOne: boolean;
  notes?: string;
  projectId: number;
  addedBy: number;
  addedAt: string;
  partySize: number;
  hotel?: string;
  hotelAddress?: string;
  checkInDate?: string;
  checkOutDate?: string;
  dietaryRestrictions?: string;
  tags?: string;
  inviteSent: boolean;
  relationship?: string;
}

export interface InsertGuest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  group?: string;
  rsvpStatus?: 'pending' | 'confirmed' | 'declined' | 'maybe';
  mealPreference?: string;
  plusOne?: boolean;
  notes?: string;
  projectId: number;
  addedBy: number;
  partySize?: number;
  hotel?: string;
  hotelAddress?: string;
  checkInDate?: string;
  checkOutDate?: string;
  dietaryRestrictions?: string;
  tags?: string;
  inviteSent?: boolean;
  relationship?: string;
}

// Vendor Types
export interface Vendor {
  id: number;
  name: string;
  category: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  contactPerson?: string;
  priceRange?: string;
  bookingStatus: 'researching' | 'contacted' | 'quoted' | 'meeting_scheduled' | 'proposal_received' | 'booked' | 'paid' | 'cancelled';
  rating: number;
  notes?: string;
  isBooked: boolean;
  contractSigned: boolean;
  depositPaid: boolean;
  finalPaymentDue?: string;
  projectId: number;
  addedBy: number;
  createdAt: string;
  updatedAt: string;
  estimatedCost?: number;
  actualCost?: number;
  services?: string;
  portfolio?: string;
}

export interface InsertVendor {
  name: string;
  category: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  contactPerson?: string;
  priceRange?: string;
  bookingStatus?: 'researching' | 'contacted' | 'quoted' | 'meeting_scheduled' | 'proposal_received' | 'booked' | 'paid' | 'cancelled';
  rating?: number;
  notes?: string;
  isBooked?: boolean;
  contractSigned?: boolean;
  depositPaid?: boolean;
  finalPaymentDue?: string;
  projectId: number;
  addedBy: number;
  estimatedCost?: number;
  actualCost?: number;
  services?: string;
  portfolio?: string;
}

// Activity Types
export interface Activity {
  id: number;
  action: string;
  userId: number;
  projectId: number;
  entityType?: string;
  entityId?: number;
  entityName?: string;
  details?: Record<string, any>;
  isVisible: boolean;
  timestamp: string;
}

export interface InsertActivity {
  action: string;
  userId: number;
  projectId: number;
  entityType?: string;
  entityId?: number;
  entityName?: string;
  details?: Record<string, any>;
  isVisible?: boolean;
  timestamp?: string;
}

// Session Types
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

// Collaborator Types
export interface Collaborator {
  id: number;
  projectId: number;
  userId: number;
  role: 'Owner' | 'Planner' | 'Collaborator' | 'Viewer';
  status: string;
  invitedBy: number;
  joinedAt: string;
  updatedAt: string;
  permissions?: Record<string, any>;
}

export interface InsertCollaborator {
  projectId: number;
  userId: number;
  role: 'Owner' | 'Planner' | 'Collaborator' | 'Viewer';
  status?: string;
  invitedBy: number;
  joinedAt?: string;
  permissions?: Record<string, any>;
} 