import { storage } from '../storage.js';
import type { InsertActivityLogEntry, User } from '@shared/schema';

/**
 * Logs activity to the activity log table
 * This function provides automatic change tracking for all wedding planning activities
 */
export async function logActivity(params: {
  projectId: number;
  userId: number;
  userName: string;
  section: string; // 'Creative Details', 'Budget', 'Guest List', etc.
  action: string; // 'Created', 'Updated', 'Deleted', 'Completed'
  entityType: string; // 'creative_detail', 'budget_item', 'guest', etc.  
  entityId?: number;
  details: string; // Human readable description
}): Promise<void> {
  try {
    await storage.createActivityLogEntry({
      projectId: params.projectId,
      userId: params.userId,
      userName: params.userName,
      section: params.section,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw error - activity logging shouldn't break main functionality
  }
}

/**
 * Helper to create human-readable activity descriptions
 */
export function createActivityDescription(action: string, entityType: string, entityName: string, details?: string): string {
  const actionText = action.toLowerCase();
  
  switch (actionText) {
    case 'created':
      return `added ${entityName} to ${entityType}${details ? ` (${details})` : ''}`;
    case 'updated':
      return `updated ${entityName} in ${entityType}${details ? ` - ${details}` : ''}`;
    case 'deleted':
      return `removed ${entityName} from ${entityType}`;
    case 'completed':
      return `completed ${entityName}${details ? `. ${details}` : ''}`;
    default:
      return `${actionText} ${entityName}${details ? ` - ${details}` : ''}`;
  }
}

/**
 * Activity tracking for creative details
 */
export async function logCreativeDetailActivity(params: {
  projectId: number;
  userId: number;
  userName: string;
  action: 'Created' | 'Updated' | 'Deleted' | 'Completed';
  creativeDetailId?: number;
  category: string;
  title: string;
  details?: string;
}) {
  await logActivity({
    projectId: params.projectId,
    userId: params.userId,
    userName: params.userName,
    section: 'Creative Details',
    action: params.action,
    entityType: 'creative_detail',
    entityId: params.creativeDetailId,
    details: createActivityDescription(
      params.action,
      params.category,
      params.title,
      params.details
    )
  });
}

/**
 * Activity tracking for budget items
 */
export async function logBudgetActivity(params: {
  projectId: number;
  userId: number;
  userName: string;
  action: 'Created' | 'Updated' | 'Deleted';
  budgetItemId?: number;
  item: string;
  category: string;
  amount?: number;
  details?: string;
}) {
  const amountText = params.amount ? ` ($${params.amount})` : '';
  
  await logActivity({
    projectId: params.projectId,
    userId: params.userId,
    userName: params.userName,
    section: 'Budget',
    action: params.action,
    entityType: 'budget_item',
    entityId: params.budgetItemId,
    details: createActivityDescription(
      params.action,
      params.category,
      `${params.item}${amountText}`,
      params.details
    )
  });
}

/**
 * Activity tracking for guest list
 */
export async function logGuestActivity(params: {
  projectId: number;
  userId: number;
  userName: string;
  action: 'Created' | 'Updated' | 'Deleted';
  guestId?: number;
  guestName: string;
  details?: string;
}) {
  await logActivity({
    projectId: params.projectId,
    userId: params.userId,
    userName: params.userName,
    section: 'Guest List',
    action: params.action,
    entityType: 'guest',
    entityId: params.guestId,
    details: createActivityDescription(
      params.action,
      'guest list',
      params.guestName,
      params.details
    )
  });
}

/**
 * Activity tracking for vendor management
 */
export async function logVendorActivity(params: {
  projectId: number;
  userId: number;
  userName: string;
  action: 'Created' | 'Updated' | 'Deleted';
  vendorId?: number;
  vendorName: string;
  category: string;
  details?: string;
}) {
  await logActivity({
    projectId: params.projectId,
    userId: params.userId,
    userName: params.userName,
    section: 'Vendors',
    action: params.action,
    entityType: 'vendor',
    entityId: params.vendorId,
    details: createActivityDescription(
      params.action,
      `${params.category} vendor`,
      params.vendorName,
      params.details
    )
  });
}

/**
 * Activity tracking for tasks
 */
export async function logTaskActivity(params: {
  projectId: number;
  userId: number;
  userName: string;
  action: 'Created' | 'Updated' | 'Deleted' | 'Completed';
  taskId?: number;
  taskTitle: string;
  details?: string;
}) {
  await logActivity({
    projectId: params.projectId,
    userId: params.userId,
    userName: params.userName,
    section: 'Timeline',
    action: params.action,
    entityType: 'task',
    entityId: params.taskId,
    details: createActivityDescription(
      params.action,
      'task',
      params.taskTitle,
      params.details
    )
  });
}