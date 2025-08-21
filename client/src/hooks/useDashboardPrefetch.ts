import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchStrategies } from "@/lib/queryClient";
import { useProjects } from "./useProjects";
import { logDebug } from '@/lib/logger';

// Dashboard prefetching hook that intelligently prefetches next-page data
export function useDashboardPrefetch() {
  const queryClient = useQueryClient();
  const { data: projects } = useProjects();
  
  // Get the current project (first project or Emma & Jake's Wedding)
  const currentProject = projects?.find((p: any) => p.name === "Emma & Jake's Wedding") || projects?.[0];
  
  useEffect(() => {
    if (!currentProject?.id) return;
    
    const prefetchDashboardData = useCallback(async (projectId: string) => {
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery({
            queryKey: ['projects', projectId, 'stats'],
            queryFn: () => fetch(`/api/projects/${projectId}/stats`).then(res => res.json()),
            staleTime: 5 * 60 * 1000,
          }),
          queryClient.prefetchQuery({
            queryKey: ['projects', projectId, 'recent-activity'],
            queryFn: () => fetch(`/api/projects/${projectId}/recent-activity`).then(res => res.json()),
            staleTime: 2 * 60 * 1000,
          }),
        ]);
      } catch (error) {
        logDebug('DashboardPrefetch', 'Dashboard prefetch error (non-critical)', { 
          projectId,
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }, [queryClient]);

    const prefetchNavigationData = useCallback(async (projectId: string) => {
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery({
            queryKey: ['projects', projectId, 'guests'],
            queryFn: () => fetch(`/api/projects/${projectId}/guests`).then(res => res.json()),
            staleTime: 10 * 60 * 1000,
          }),
          queryClient.prefetchQuery({
            queryKey: ['projects', projectId, 'budget'],
            queryFn: () => fetch(`/api/projects/${projectId}/budget`).then(res => res.json()),
            staleTime: 5 * 60 * 1000,
          }),
        ]);
      } catch (error) {
        logDebug('DashboardPrefetch', 'Navigation prefetch error (non-critical)', { 
          projectId,
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }, [queryClient]);
    
    // Immediate prefetch for critical data
    prefetchDashboardData(currentProject.id.toString());
    
    // Delayed prefetch for navigation targets (non-blocking)
    const navigationTimeout = setTimeout(() => {
      prefetchNavigationData(currentProject.id.toString());
    }, 2000);
    
    return () => {
      clearTimeout(navigationTimeout);
    };
  }, [currentProject?.id, queryClient]);
  
  // Return prefetch utilities for manual prefetching
  return {
    prefetchDashboardEssentials: (projectId: string) => 
      prefetchStrategies.prefetchDashboardEssentials(projectId),
    prefetchNavigationTargets: (projectId: string) => 
      prefetchStrategies.prefetchNavigationTargets(projectId),
    currentProject,
  };
}

// Tab visibility optimization to prevent redundant fetches
export function useTabVisibilityOptimization() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only invalidate realtime data when returning to tab
        // Avoid invalidating all queries to prevent redundant fetches
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
}

// Hook to manage stale data cleanup
export function useStaleDataCleanup() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Clean up stale data every 15 minutes
    const cleanupInterval = setInterval(() => {
      // Remove queries older than 30 minutes
      const maxAge = 30 * 60 * 1000;
      const now = Date.now();
      
      queryClient.getQueryCache().findAll().forEach((query) => {
        if (query.state.dataUpdatedAt < now - maxAge) {
          queryClient.removeQueries({ queryKey: query.queryKey });
        }
      });
    }, 15 * 60 * 1000);
    
    return () => clearInterval(cleanupInterval);
  }, [queryClient]);
}