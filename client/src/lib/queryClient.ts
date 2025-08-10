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
