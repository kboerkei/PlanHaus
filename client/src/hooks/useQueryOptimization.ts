import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";

// Centralized query key factory to prevent duplicates
export const queryKeys = {
  // Authentication
  auth: {
    me: () => ['/api/auth/me'] as const,
  },
  
  // Projects
  projects: {
    all: () => ['/api/projects'] as const,
    detail: (id: string) => ['/api/projects', id] as const,
    
    // Project-specific data with consistent patterns
    tasks: (projectId: string) => ['/api/projects', projectId, 'tasks'] as const,
    guests: (projectId: string) => ['/api/projects', projectId, 'guests'] as const,
    budget: (projectId: string) => ['/api/projects', projectId, 'budget'] as const,
    vendors: (projectId: string) => ['/api/projects', projectId, 'vendors'] as const,
    activities: (projectId: string) => ['/api/projects', projectId, 'activities'] as const,
    collaborators: (projectId: string) => ['/api/projects', projectId, 'collaborators'] as const,
    inspiration: (projectId: string) => ['/api/projects', projectId, 'inspiration'] as const,
  },

  // Global data
  dashboard: {
    stats: () => ['/api/dashboard/stats'] as const,
  },
  
  // User data
  intake: {
    data: () => ['/api/intake'] as const,
  },
  
  // Generic tasks (global)
  tasks: {
    all: () => ['/api/tasks'] as const,
  },
  
  // Inspiration (global)
  inspiration: {
    all: () => ['/api/inspiration'] as const,
  },
} as const;

// Cache configuration constants
export const cacheConfig = {
  // Short-lived data (user activities, real-time updates)
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  },
  
  // Medium-lived data (dashboard stats, project lists)
  dashboard: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  
  // Long-lived data (user profile, project details)
  static: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  
  // Frequently changing data (tasks, guests)
  dynamic: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
} as const;

// Session-aware enabled condition
export const useSessionEnabled = () => {
  const hasSession = !!localStorage.getItem('sessionId');
  return hasSession;
};

// Project-aware enabled condition
export const useProjectEnabled = (projectId?: string | null) => {
  const hasSession = useSessionEnabled();
  return hasSession && !!projectId && projectId !== 'undefined';
};

// Prefetching hook for dashboard navigation
export const useDashboardPrefetch = (currentProject?: { id: string } | null) => {
  const queryClient = useQueryClient();
  
  const prefetchProjectData = useCallback(async (projectId: string) => {
    if (!projectId) return;
    
    // Prefetch likely next-page data based on dashboard usage patterns
    const prefetchPromises = [
      // High-priority data (commonly accessed from dashboard)
      queryClient.prefetchQuery({
        queryKey: queryKeys.projects.tasks(projectId),
        staleTime: cacheConfig.dynamic.staleTime,
      }),
      
      queryClient.prefetchQuery({
        queryKey: queryKeys.projects.guests(projectId),
        staleTime: cacheConfig.dynamic.staleTime,
      }),
      
      queryClient.prefetchQuery({
        queryKey: queryKeys.projects.budget(projectId),
        staleTime: cacheConfig.dynamic.staleTime,
      }),
      
      // Medium-priority data (sometimes accessed)
      queryClient.prefetchQuery({
        queryKey: queryKeys.projects.vendors(projectId),
        staleTime: cacheConfig.static.staleTime,
      }),
      
      // Low-priority data (prefetch during idle time)
      queryClient.prefetchQuery({
        queryKey: queryKeys.projects.activities(projectId),
        staleTime: cacheConfig.realtime.staleTime,
      }),
    ];
    
    try {
      await Promise.allSettled(prefetchPromises);
    } catch (error) {
      console.debug('Prefetch error (non-critical):', error);
    }
  }, [queryClient]);
  
  // Auto-prefetch when current project changes
  useEffect(() => {
    if (currentProject?.id) {
      // Debounce prefetching to avoid excessive requests
      const timeoutId = setTimeout(() => {
        prefetchProjectData(currentProject.id);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentProject?.id, prefetchProjectData]);
  
  return { prefetchProjectData };
};

// Optimized query hook with consistent patterns
export const useOptimizedQuery = <TData = unknown>(
  options: {
    queryKey: readonly unknown[];
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery<TData>({
    refetchOnWindowFocus: false, // Prevent redundant fetches on tab focus
    refetchOnMount: false, // Use cached data if available and fresh
    refetchOnReconnect: 'always', // Refetch on network reconnection
    retry: 2, // Reasonable retry count
    ...options,
  });
};

// Tab visibility optimization
export const useTabVisibilityOptimization = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only invalidate realtime data when returning to tab
        queryClient.invalidateQueries({
          queryKey: ['/api/projects'],
          predicate: (query) => {
            // Only invalidate activities and collaborators (realtime data)
            const key = query.queryKey;
            return key.includes('activities') || key.includes('collaborators');
          },
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient]);
};