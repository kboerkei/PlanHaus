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
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const demoData = await response.json();
        setUser(demoData.user);
        setSessionId(demoData.sessionId);
        localStorage.setItem('sessionId', demoData.sessionId);
        localStorage.setItem('user', JSON.stringify(demoData.user));
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
      const storedSessionId = localStorage.getItem('sessionId');
      const storedUserData = localStorage.getItem('user');

      if (storedSessionId && storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          
          // Try to verify existing session
          const isValidSession = await verifySession(storedSessionId, userData);
          
          if (!isValidSession) {
            // Session expired, try demo login for seamless experience
            console.log('Session expired, attempting demo login...');
            const demoLoginSuccess = await attemptDemoLogin();
            
            if (!demoLoginSuccess) {
              clearStoredSession();
              toast({
                title: "Session Expired",
                description: "Your session has expired. Please log in again.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Session Restored",
                description: "Automatically logged in with demo account.",
              });
            }
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          clearStoredSession();
        }
      } else {
        // No stored session, try demo login for development
        console.log('No stored session, attempting demo login...');
        const demoLoginSuccess = await attemptDemoLogin();
        
        if (!demoLoginSuccess) {
          console.log('Demo login failed, showing auth page');
          toast({
            title: "Connection Issue",
            description: "Unable to connect automatically. Please log in manually.",
            variant: "destructive",
          });
        }
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
    localStorage.setItem('sessionId', newSessionId);
    localStorage.setItem('user', JSON.stringify(userData));
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