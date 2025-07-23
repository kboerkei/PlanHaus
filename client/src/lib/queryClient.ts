import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const sessionId = localStorage.getItem('sessionId');
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
      ...(sessionId && { Authorization: `Bearer ${sessionId}` }),
    },
  });

  // If we get a 401, try to refresh session with demo login
  if (res.status === 401) {
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
        
        // Retry the original request with new session
        const retryRes = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
            Authorization: `Bearer ${demoData.sessionId}`,
          },
        });
        
        await throwIfResNotOk(retryRes);
        return await retryRes.json();
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  }

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
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
            return await retryRes.json();
          }
        }
      } catch (error) {
        console.error('Query retry failed:', error);
      }
      
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5000, // 5 seconds cache
      gcTime: 300000, // 5 minutes garbage collection
      retry: 1,
      retryDelay: 500,
    },
    mutations: {
      retry: 1,
    },
  },
});
