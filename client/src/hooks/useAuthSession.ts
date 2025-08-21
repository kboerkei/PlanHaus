import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { logInfo, logError } from '@/lib/logger';

interface User {
  id: string;
  email: string;
  username: string;
  hasCompletedIntake: boolean;
}

interface AuthSessionState {
  user: User | null;
  sessionId: string | null;
  isLoading: boolean;
  isNewUser: boolean;
}

interface AuthSessionActions {
  handleAuth: (userData: User, newSessionId: string, isRegistration?: boolean) => void;
  handleLogout: () => void;
  handleForceClear: () => void;
  handleIntakeComplete: () => void;
}

export function useAuthSession(): AuthSessionState & AuthSessionActions {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Session verification function
  const verifySession = async (storedSessionId: string, storedUser: User) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedSessionId}` }
      });

      if (response.ok) {
        const serverUser = await response.json();
        setSessionId(storedSessionId);
        setUser({ ...storedUser, hasCompletedIntake: serverUser.hasCompletedIntake });
        return true;
      }
      return false;
    } catch (error) {
      logError('Auth', 'Session verification failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  };

  // Demo login function for fallback authentication
  const attemptDemoLogin = async () => {
    try {
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const demoData = await response.json();
        
        // Set user state immediately to transition away from auth page
        if (demoData.user && demoData.sessionId) {
          setUser(demoData.user);
          setSessionId(demoData.sessionId);
          setIsNewUser(false); // Demo user is not new
          setIsLoading(false); // Stop loading immediately
          
          // Store in localStorage for persistence
          localStorage.setItem('sessionId', demoData.sessionId);
          localStorage.setItem('user', JSON.stringify(demoData.user));
          
          logInfo('Auth', 'Demo login successful', { userId: demoData.user.id });
          return true;
        } else {
          logError('Auth', 'Missing user or sessionId in demo login response', { demoData });
          return false;
        }
      } else {
        logError('Auth', 'Demo login failed', { status: response.status });
        return false;
      }
    } catch (error) {
      logError('Auth', 'Demo login error', { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  };

  // Clear stored session data
  const clearStoredSession = () => {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
  };

  // Initialize session on app load
  useEffect(() => {
    const initializeSession = async () => {
      // Check for existing valid session first
      const storedSessionId = localStorage.getItem('sessionId');
      const storedUserData = localStorage.getItem('user');
      
      if (storedSessionId && storedUserData) {
        try {
          const storedUser = JSON.parse(storedUserData);
          const isValid = await verifySession(storedSessionId, storedUser);
          
          if (isValid) {
            setIsLoading(false);
            return;
          }
        } catch (error) {
          // Session validation failed, continue to demo login
        }
      }
      
      // Clear any invalid session data
      clearStoredSession();
      
      const demoLoginSuccess = await attemptDemoLogin();
      
      if (!demoLoginSuccess) {
        toast({
          title: "Connection Issue",
          description: "Unable to connect automatically. Please log in manually.",
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
    };

    initializeSession();
  }, []);

  // Handle successful authentication
  const handleAuth = (userData: User, newSessionId: string, isRegistration = false) => {
    setUser(userData);
    setSessionId(newSessionId);
    setIsNewUser(isRegistration && !userData.hasCompletedIntake);
    setIsLoading(false); // Ensure loading stops
    localStorage.setItem('sessionId', newSessionId);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Success toast notification
    toast({
      title: isRegistration ? "Account Created!" : "Welcome Back!",
      description: isRegistration ? 
        "Your account has been created successfully." : 
        "You've been logged in successfully.",
    });
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setSessionId(null);
    setIsNewUser(false);
    clearStoredSession();
  };

  // Force clear session for testing/debugging
  const handleForceClear = () => {
    localStorage.clear();
    setUser(null);
    setSessionId(null);
    setIsNewUser(false);
    window.location.reload();
  };

  // Handle intake completion
  const handleIntakeComplete = () => {
    setIsNewUser(false);
    
    if (user) {
      const updatedUser = { ...user, hasCompletedIntake: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return {
    // State
    user,
    sessionId,
    isLoading,
    isNewUser,
    
    // Actions
    handleAuth,
    handleLogout,
    handleForceClear,
    handleIntakeComplete,
  };
}