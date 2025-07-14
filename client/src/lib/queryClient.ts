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
    console.log('API request got 401, attempting demo login...');
    try {
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
      console.log('Demo login retry failed:', error);
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

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
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
      staleTime: 30000, // 30 seconds cache
      gcTime: 300000, // 5 minutes garbage collection
      retry: 2,
      retryDelay: 1000,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.warn('Mutation failed:', error);
      },
    },
  },
});
