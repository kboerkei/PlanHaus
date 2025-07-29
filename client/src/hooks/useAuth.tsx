import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${sessionId}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        setAuthState({ user, isAuthenticated: true, isLoading: false });
      } else {
        // Session expired, try demo login
        const demoResponse = await fetch('/api/auth/demo-login', {
          method: 'POST',
        });
        
        if (demoResponse.ok) {
          const { user, sessionId: newSessionId } = await demoResponse.json();
          localStorage.setItem('sessionId', newSessionId);
          setAuthState({ user, isAuthenticated: true, isLoading: false });
        } else {
          setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { user, sessionId } = await response.json();
        localStorage.setItem('sessionId', sessionId);
        setAuthState({ user, isAuthenticated: true, isLoading: false });
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('sessionId');
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const hasPermission = (requiredRole: string) => {
    if (!authState.user) return false;
    
    const roleHierarchy = {
      'Owner': 4,
      'Planner': 3,
      'Collaborator': 2,
      'Viewer': 1,
    };

    const userRoleLevel = roleHierarchy[authState.user.role as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userRoleLevel >= requiredRoleLevel;
  };

  const canEdit = () => {
    return hasPermission('Collaborator');
  };

  const canManageCollaborators = () => {
    return hasPermission('Planner');
  };

  return {
    ...authState,
    login,
    logout,
    hasPermission,
    canEdit,
    canManageCollaborators,
    refetch: checkAuthStatus,
  };
}