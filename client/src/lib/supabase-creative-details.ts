// Supabase Creative Details Service with localStorage fallback
import { queryClient } from '@/lib/queryClient';

// Types for Creative Details
export interface CreativeDetail {
  id: number;
  projectId: number;
  category: string;
  title: string;
  description?: string;
  notes?: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  assignedTo?: number;
  dueDate?: string;
  status: 'Not Started' | 'In Progress' | 'Complete';
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Collaborator {
  id: number;
  projectId: number;
  userId: number;
  role: 'Owner' | 'Planner' | 'Collaborator' | 'Viewer';
  user?: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

// Check if user is authenticated (has valid session)
const isAuthenticated = (): boolean => {
  const sessionId = localStorage.getItem('sessionId');
  const user = localStorage.getItem('user');
  return !!(sessionId && user);
};

// Get current user
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Local Storage Keys
const CREATIVE_DETAILS_KEY = 'creative_details';
const COLLABORATORS_KEY = 'collaborators';

// ===== Creative Details Operations =====

export const getCreativeDetails = async (projectId: number): Promise<CreativeDetail[]> => {
  if (isAuthenticated()) {
    // Use API (the backend now handles projectId automatically)
    try {
      const response = await fetch('/api/creative-details', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch creative details');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch from API, falling back to localStorage:', error);
      return getCreativeDetailsFromLocalStorage(projectId);
    }
  } else {
    // Use localStorage
    return getCreativeDetailsFromLocalStorage(projectId);
  }
};

const getCreativeDetailsFromLocalStorage = (projectId: number): CreativeDetail[] => {
  const stored = localStorage.getItem(CREATIVE_DETAILS_KEY);
  if (!stored) return [];
  
  try {
    const allDetails: CreativeDetail[] = JSON.parse(stored);
    return allDetails.filter(detail => detail.projectId === projectId);
  } catch {
    return [];
  }
};

export const createCreativeDetail = async (detail: Omit<CreativeDetail, 'id' | 'createdAt' | 'updatedAt'>): Promise<CreativeDetail> => {
  if (isAuthenticated()) {
    // Use Supabase/API
    try {
      const response = await fetch('/api/creative-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
        body: JSON.stringify(detail),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create creative detail');
      }
      
      const created = await response.json();
      
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['/api/creative-details'] });
      
      return created;
    } catch (error) {
      console.error('Failed to create via API, falling back to localStorage:', error);
      return createCreativeDetailInLocalStorage(detail);
    }
  } else {
    // Use localStorage
    return createCreativeDetailInLocalStorage(detail);
  }
};

const createCreativeDetailInLocalStorage = (detail: Omit<CreativeDetail, 'id' | 'createdAt' | 'updatedAt'>): CreativeDetail => {
  const stored = localStorage.getItem(CREATIVE_DETAILS_KEY);
  const existing: CreativeDetail[] = stored ? JSON.parse(stored) : [];
  
  const newDetail: CreativeDetail = {
    ...detail,
    id: Date.now(), // Simple ID generation for local storage
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  existing.push(newDetail);
  localStorage.setItem(CREATIVE_DETAILS_KEY, JSON.stringify(existing));
  
  return newDetail;
};

export const updateCreativeDetail = async (id: number, updates: Partial<CreativeDetail>): Promise<CreativeDetail> => {
  if (isAuthenticated()) {
    // Use Supabase/API
    try {
      const response = await fetch(`/api/creative-details/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update creative detail');
      }
      
      const updated = await response.json();
      
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['/api/creative-details'] });
      
      return updated;
    } catch (error) {
      console.error('Failed to update via API, falling back to localStorage:', error);
      return updateCreativeDetailInLocalStorage(id, updates);
    }
  } else {
    // Use localStorage
    return updateCreativeDetailInLocalStorage(id, updates);
  }
};

const updateCreativeDetailInLocalStorage = (id: number, updates: Partial<CreativeDetail>): CreativeDetail => {
  const stored = localStorage.getItem(CREATIVE_DETAILS_KEY);
  const existing: CreativeDetail[] = stored ? JSON.parse(stored) : [];
  
  const index = existing.findIndex(detail => detail.id === id);
  if (index === -1) {
    throw new Error('Creative detail not found');
  }
  
  existing[index] = {
    ...existing[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(CREATIVE_DETAILS_KEY, JSON.stringify(existing));
  
  return existing[index];
};

export const deleteCreativeDetail = async (id: number): Promise<void> => {
  if (isAuthenticated()) {
    // Use Supabase/API
    try {
      const response = await fetch(`/api/creative-details/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete creative detail');
      }
      
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['/api/creative-details'] });
    } catch (error) {
      console.error('Failed to delete via API, falling back to localStorage:', error);
      deleteCreativeDetailFromLocalStorage(id);
    }
  } else {
    // Use localStorage
    deleteCreativeDetailFromLocalStorage(id);
  }
};

const deleteCreativeDetailFromLocalStorage = (id: number): void => {
  const stored = localStorage.getItem(CREATIVE_DETAILS_KEY);
  const existing: CreativeDetail[] = stored ? JSON.parse(stored) : [];
  
  const filtered = existing.filter(detail => detail.id !== id);
  localStorage.setItem(CREATIVE_DETAILS_KEY, JSON.stringify(filtered));
};

// ===== Collaborator Operations =====

export const getCollaborators = async (projectId: number): Promise<Collaborator[]> => {
  if (isAuthenticated()) {
    // Use API (backend handles project automatically)
    try {
      const response = await fetch('/api/collaborators', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch collaborators');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch collaborators from API, returning empty array:', error);
      return [];
    }
  } else {
    // No collaborators in localStorage mode
    return [];
  }
};

// Check user permission for editing
export const canEdit = async (projectId: number): Promise<boolean> => {
  if (!isAuthenticated()) {
    return true; // Allow editing in localStorage mode
  }
  
  try {
    const collaborators = await getCollaborators(projectId);
    const currentUser = getCurrentUser();
    
    if (!currentUser) return false;
    
    const userRole = collaborators.find(c => c.userId === currentUser.id)?.role;
    return ['Owner', 'Planner', 'Collaborator'].includes(userRole || '');
  } catch {
    return true; // Default to allowing edit if we can't check
  }
};

// Sync localStorage data to Supabase when user logs in
export const syncLocalStorageToSupabase = async (): Promise<void> => {
  if (!isAuthenticated()) return;
  
  const localDetails = localStorage.getItem(CREATIVE_DETAILS_KEY);
  if (!localDetails) return;
  
  try {
    const details: CreativeDetail[] = JSON.parse(localDetails);
    
    // Upload each detail to Supabase
    for (const detail of details) {
      await createCreativeDetail({
        ...detail,
        createdBy: getCurrentUser()?.id || 1,
      });
    }
    
    // Clear localStorage after successful sync
    localStorage.removeItem(CREATIVE_DETAILS_KEY);
    console.log('Successfully synced creative details to Supabase');
  } catch (error) {
    console.error('Failed to sync localStorage to Supabase:', error);
  }
};

// Activity logging
export const logActivity = async (action: string, resourceType: string, resourceId: number, details?: any): Promise<void> => {
  if (!isAuthenticated()) return;
  
  try {
    await fetch('/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
      },
      body: JSON.stringify({
        action,
        entityType: resourceType, // Updated to match backend
        entityId: resourceId,
        details: details ? JSON.stringify(details) : null,
      }),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};