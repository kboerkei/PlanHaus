import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchStrategies } from "@/lib/queryClient";
import { useProjects } from "./useProjects";

// Dashboard prefetching hook that intelligently prefetches next-page data
export function useDashboardPrefetch() {
  const queryClient = useQueryClient();
  const { data: projects } = useProjects();
  
  // Get the current project (first project or Emma & Jake's Wedding)
  const currentProject = projects?.find((p: any) => p.name === "Emma & Jake's Wedding") || projects?.[0];
  
  useEffect(() => {
    if (!currentProject?.id) return;
    
    // Prefetch critical dashboard data immediately
    const prefetchCriticalData = async () => {
      try {
        await prefetchStrategies.prefetchDashboardEssentials(currentProject.id.toString());
      } catch (error) {
        console.debug('Dashboard prefetch error (non-critical):', error);
      }
    };
    
    // Prefetch likely navigation targets after a delay
    const prefetchNavigationData = async () => {
      try {
        await prefetchStrategies.prefetchNavigationTargets(currentProject.id.toString());
      } catch (error) {
        console.debug('Navigation prefetch error (non-critical):', error);
      }
    };
    
    // Immediate prefetch for critical data
    prefetchCriticalData();
    
    // Delayed prefetch for navigation targets (non-blocking)
    const navigationTimeout = setTimeout(prefetchNavigationData, 2000);
    
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