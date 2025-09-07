import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface CSRFContextType {
  token: string | null;
  getHeaders: () => Record<string, string>;
}

const CSRFContext = createContext<CSRFContextType>({
  token: null,
  getHeaders: () => ({})
});

export function useCSRF() {
  return useContext(CSRFContext);
}

interface CSRFProviderProps {
  children: ReactNode;
}

export function CSRFProvider({ children }: CSRFProviderProps) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get CSRF token from cookie or generate one
    const getCsrfToken = () => {
      const cookies = document.cookie.split(';');
      const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrfToken='));
      
      if (csrfCookie) {
        return csrfCookie.split('=')[1];
      }
      
      // Generate a simple token if none exists
      const newToken = Math.random().toString(36).substr(2, 9);
      document.cookie = `csrfToken=${newToken}; path=/; secure; samesite=strict`;
      return newToken;
    };

    setToken(getCsrfToken());
  }, []);

  const getHeaders = (): Record<string, string> => {
    if (!token) return {};
    
    return {
      'X-CSRF-Token': token,
      'Content-Type': 'application/json'
    };
  };

  return (
    <CSRFContext.Provider value={{ token, getHeaders: () => getHeaders() }}>
      {children}
    </CSRFContext.Provider>
  );
}

// CSRF-protected component wrapper
interface CSRFProtectionProps {
  children: ReactNode;
}

export function CSRFProtection({ children }: CSRFProtectionProps) {
  return (
    <CSRFProvider>
      {children}
    </CSRFProvider>
  );
}