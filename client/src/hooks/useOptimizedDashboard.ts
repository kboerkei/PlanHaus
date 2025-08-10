import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient, prefetchStrategies, cacheUtils } from "@/lib/queryClient";

// Optimized dashboard hook with deduplication and prefetching
export function useOptimizedDashboard() {
  // Dashboard stats query with optimized caching
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 15 * 60 * 1000, // 15 minutes GC
    refetchOnWindowFocus: false,
    enabled: !!localStorage.getItem('sessionId'),
  });

  // Projects query with extended cache
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
    staleTime: 15 * 60 * 1000, // 15 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes GC
    refetchOnWindowFocus: false,
    enabled: !!localStorage.getItem('sessionId'),
  });

  // Current project derivation
  const currentProject = projects?.find((p: any) => p.name === "Emma & Jake's Wedding") || projects?.[0];
  
  // Prefetch essential data when current project changes
  useEffect(() => {
    if (currentProject?.id) {
      // Debounced prefetch to avoid excessive requests
      const timeoutId = setTimeout(async () => {
        try {
          await prefetchStrategies.prefetchDashboardEssentials(currentProject.id.toString());
          // Prefetch navigation targets with lower priority
          setTimeout(() => {
            prefetchStrategies.prefetchNavigationTargets(currentProject.id.toString()).catch(console.debug);
          }, 3000);
        } catch (error) {
          console.debug('Dashboard prefetch error:', error);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [currentProject?.id]);

  // Tab visibility optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only invalidate realtime data, not all cached data
        queryClient.invalidateQueries({
          queryKey: ['/api/projects'],
          predicate: (query) => {
            const key = query.queryKey;
            return key.includes('activities') || key.includes('collaborators');
          },
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Stale data cleanup
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      cacheUtils.removeStaleData(30 * 60 * 1000); // 30 minutes
    }, 15 * 60 * 1000);
    
    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    dashboardStats,
    projects,
    currentProject,
    isLoading: statsLoading || projectsLoading,
    
    // Prefetch utilities
    prefetchProjectData: (projectId: string) => 
      prefetchStrategies.prefetchDashboardEssentials(projectId),
    invalidateProjectData: (projectId: string, type?: string) =>
      cacheUtils.invalidateProjectData(projectId, type as any),
  };
}