// Client-side cookie authentication utilities
import { apiRequest } from '@/lib/queryClient';

export interface User {
  id: string;
  username: string;
  email: string;
  hasCompletedIntake: boolean;
}

export interface AuthResponse {
  user: User;
}

class CookieAuthService {
  private user: User | null = null;
  private authListeners: ((user: User | null) => void)[] = [];

  // Subscribe to auth state changes
  onAuthChange(callback: (user: User | null) => void) {
    this.authListeners.push(callback);
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  private notifyAuthChange() {
    this.authListeners.forEach(callback => callback(this.user));
  }

  // Get current user (no localStorage needed - cookies handle auth)
  getCurrentUser(): User | null {
    return this.user;
  }

  // Set user after successful authentication
  setUser(user: User) {
    this.user = user;
    this.notifyAuthChange();
  }

  // Check if user is authenticated by making a request
  async checkAuth(): Promise<User | null> {
    try {
      const response = await apiRequest<AuthResponse>('/api/auth/me');
      this.user = response.user;
      this.notifyAuthChange();
      return this.user;
    } catch (error) {
      this.user = null;
      this.notifyAuthChange();
      return null;
    }
  }

  // Login with credentials
  async login(email: string, password: string): Promise<User> {
    const response = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.user = response.user;
    this.notifyAuthChange();
    return this.user;
  }

  // Demo login
  async demoLogin(): Promise<User> {
    console.log('Session expired, attempting demo login...');
    const response = await apiRequest<AuthResponse>('/api/auth/demo-login', {
      method: 'POST',
    });
    
    this.user = response.user;
    this.notifyAuthChange();
    return this.user;
  }

  // Register new user
  async register(username: string, email: string, password: string): Promise<User> {
    const response = await apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    
    this.user = response.user;
    this.notifyAuthChange();
    return this.user;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Continue with logout even if request fails
      console.error('Logout request failed:', error);
    }
    
    this.user = null;
    this.notifyAuthChange();
  }

  // Clear cached user data (for manual session cleanup)
  clearAuth() {
    this.user = null;
    this.notifyAuthChange();
  }
}

export const cookieAuth = new CookieAuthService();

// React hook for authentication
import { useState, useEffect } from 'react';

export function useCookieAuth() {
  const [user, setUser] = useState<User | null>(cookieAuth.getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    cookieAuth.checkAuth().finally(() => setIsLoading(false));

    // Subscribe to auth changes
    const unsubscribe = cookieAuth.onAuthChange(setUser);
    return unsubscribe;
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: cookieAuth.login.bind(cookieAuth),
    register: cookieAuth.register.bind(cookieAuth),
    demoLogin: cookieAuth.demoLogin.bind(cookieAuth),
    logout: cookieAuth.logout.bind(cookieAuth),
    checkAuth: cookieAuth.checkAuth.bind(cookieAuth),
  };
}