import { ApiResponse, ApiError } from '@/types';

class ApiClient {
  private baseURL: string;
  
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  private async handleResponse<T = unknown>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Centralized 401 handling - attempt silent refresh
        try {
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });
          
          if (refreshResponse.ok) {
            // Retry original request
            const retryResponse = await fetch(response.url, {
              method: response.url.includes('POST') ? 'POST' : 'GET',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            });
            
            if (retryResponse.ok) {
              return retryResponse.json();
            }
          }
        } catch (error) {
          console.warn('Silent refresh failed:', error);
        }
        
        // Redirect to login with return URL
        const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?returnTo=${returnTo}`;
        throw new Error('Authentication required');
      }
      
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Use default error message if response is not JSON
      }
      
      const error: ApiError = {
        message: errorMessage,
        status: response.status,
        code: response.status.toString(),
      };
      throw error;
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    try {
      return await response.json();
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      return {} as T;
    }
  }

  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  async get<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient();

// Runtime type guards
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

export function hasApiData<T>(response: unknown): response is { data: T } {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response
  );
}