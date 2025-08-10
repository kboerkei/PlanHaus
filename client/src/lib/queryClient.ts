import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Runtime guard to validate API responses
function isValidApiResponse<T>(data: unknown): data is T {
  // Basic runtime validation - can be extended with more specific checks
  return data !== null && data !== undefined;
}

export async function apiRequest<T = unknown>(
  url: string,
  options?: RequestInit,
  signal?: AbortSignal // Add support for request cancellation
): Promise<T> {
  // Get sessionId from localStorage for Authorization header
  const sessionId = localStorage.getItem('sessionId');
  
  const res = await fetch(url, {
    ...options,
    signal, // Pass abort signal
    credentials: 'include', // Include cookies in requests
    headers: {
      'Content-Type': 'application/json',
      ...(sessionId && { 'Authorization': `Bearer ${sessionId}` }),
      ...options?.headers,
    },
  });

  // If we get a 401, try to refresh session with demo login
  if (res.status === 401) {
    try {
      const demoResponse = await fetch('/api/auth/demo-login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (demoResponse.ok) {
        const demoData = await demoResponse.json();
        // Update localStorage with new session data
        if (demoData.sessionId) {
          localStorage.setItem('sessionId', demoData.sessionId);
          localStorage.setItem('user', JSON.stringify(demoData.user));
        }
        
        // Retry the original request with Authorization header
        const retryRes = await fetch(url, {
          ...options,
          signal,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(demoData.sessionId && { 'Authorization': `Bearer ${demoData.sessionId}` }),
            ...options?.headers,
          },
        });
        
        await throwIfResNotOk(retryRes);
        const retryData = await retryRes.json();
        
        if (!isValidApiResponse<T>(retryData)) {
          throw new Error('Invalid API response format on retry');
        }
        
        return retryData;
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  }

  await throwIfResNotOk(res);
  const data = await res.json();
  
  if (!isValidApiResponse<T>(data)) {
    throw new Error('Invalid API response format');
  }
  
  return data;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <T = unknown>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> =>
  async ({ queryKey }) => {
    const sessionId = localStorage.getItem('sessionId');
    
    const res = await fetch(queryKey.join("/") as string, {
      headers: sessionId ? { Authorization: `Bearer ${sessionId}` } : {},
    });

    if (res.status === 401) {
      // Try demo login first
      try {
        // Clear old session data first
        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
        
        const demoResponse = await fetch('/api/auth/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (demoResponse.ok) {
          const demoData = await demoResponse.json();
          localStorage.setItem('sessionId', demoData.sessionId);
          localStorage.setItem('user', JSON.stringify(demoData.user));
          
          // Retry the original request
          const retryRes = await fetch(queryKey.join("/") as string, {
            headers: { Authorization: `Bearer ${demoData.sessionId}` },
          });
          
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            if (isValidApiResponse(retryData)) {
              return retryData;
            }
          }
        }
      } catch (error) {
        console.error('Query retry failed:', error);
      }
      
      if (options.on401 === "returnNull") {
        return null as T;
      }
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    
    if (!isValidApiResponse<T>(data)) {
      throw new Error('Invalid API response format');
    }
    
    return data;
  };

// Enhanced query client with optimized caching and deduplication
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false, // Prevent redundant fetches on tab focus
      refetchOnMount: false, // Use cached data if available and fresh
      refetchOnReconnect: 'always', // Refetch on network reconnection
      staleTime: 5 * 60 * 1000, // 5 minutes - more aggressive caching
      gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
      retry: 2, // Reasonable retry attempts
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      
      // Network optimization
      networkMode: 'online', // Only run queries when online
      
      // Deduplication settings
      structuralSharing: true, // Enable structural sharing for better performance
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'online',
    },
  },
});

// Enhanced prefetch utilities
export const prefetchStrategies = {
  // Prefetch critical dashboard data
  async prefetchDashboardEssentials(projectId?: string) {
    if (!projectId) return;
    
    const prefetchPromises = [
      queryClient.prefetchQuery({
        queryKey: ['/api/projects', projectId, 'tasks'],
        staleTime: 2 * 60 * 1000, // 2 minutes for dynamic data
      }),
      queryClient.prefetchQuery({
        queryKey: ['/api/projects', projectId, 'guests'],
        staleTime: 2 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['/api/dashboard/stats'],
        staleTime: 5 * 60 * 1000, // 5 minutes for dashboard stats
      }),
    ];
    
    return Promise.allSettled(prefetchPromises);
  },
  
  // Prefetch likely navigation targets
  async prefetchNavigationTargets(projectId?: string) {
    if (!projectId) return;
    
    const prefetchPromises = [
      queryClient.prefetchQuery({
        queryKey: ['/api/projects', projectId, 'budget'],
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['/api/projects', projectId, 'vendors'],
        staleTime: 10 * 60 * 1000, // Vendors change less frequently
      }),
      queryClient.prefetchQuery({
        queryKey: ['/api/projects', projectId, 'activities'],
        staleTime: 30 * 1000, // Activities are more dynamic
      }),
    ];
    
    return Promise.allSettled(prefetchPromises);
  },
};

// Cache invalidation utilities
export const cacheUtils = {
  // Smart invalidation that only invalidates related data
  invalidateProjectData(projectId: string, dataType?: 'tasks' | 'guests' | 'budget' | 'vendors' | 'all') {
    if (dataType === 'all' || !dataType) {
      // Invalidate all project data
      queryClient.invalidateQueries({
        queryKey: ['/api/projects', projectId],
        exact: false,
      });
      // Also invalidate dashboard stats that depend on project data
      queryClient.invalidateQueries({
        queryKey: ['/api/dashboard/stats'],
      });
    } else {
      // Invalidate specific data type
      queryClient.invalidateQueries({
        queryKey: ['/api/projects', projectId, dataType],
      });
      
      // Invalidate global queries of the same type
      queryClient.invalidateQueries({
        queryKey: [`/api/${dataType}`],
      });
      
      // Conditionally invalidate dashboard if it affects stats
      if (['tasks', 'guests', 'budget'].includes(dataType)) {
        queryClient.invalidateQueries({
          queryKey: ['/api/dashboard/stats'],
        });
      }
    }
  },
  
  // Remove stale data based on time
  removeStaleData(maxAge: number = 30 * 60 * 1000) { // 30 minutes default
    queryClient.getQueryCache().findAll().forEach((query) => {
      if (query.state.dataUpdatedAt < Date.now() - maxAge) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  },
};
