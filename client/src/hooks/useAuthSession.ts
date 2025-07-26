import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

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
      console.error('Session verification failed:', error);
      return false;
    }
  };

  // Demo login function for fallback authentication
  const attemptDemoLogin = async () => {
    try {
      console.log('Attempting demo login...');
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const demoData = await response.json();
        console.log('Demo login successful, setting user data:', demoData.user);
        
        // Set user state immediately to transition away from auth page
        setUser(demoData.user);
        setSessionId(demoData.sessionId);
        setIsNewUser(false); // Demo user is not new
        setIsLoading(false); // Stop loading immediately
        
        localStorage.setItem('sessionId', demoData.sessionId);
        localStorage.setItem('user', JSON.stringify(demoData.user));
        
        // Success notification
        toast({
          title: "Welcome to PlanHaus!",
          description: "You're now logged in as the demo user.",
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Demo login failed:', error);
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
      // Always clear any old session data and start fresh with demo login
      clearStoredSession();
      
      console.log('Session expired, attempting demo login...');
      const demoLoginSuccess = await attemptDemoLogin();
      
      if (!demoLoginSuccess) {
        console.log('Demo login failed, showing auth page');
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
    console.log('handleAuth called:', { userData, newSessionId, isRegistration });
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