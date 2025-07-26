import { useEffect, useState, createContext, useContext } from 'react';

interface CSRFContextType {
  token: string | null;
  refreshToken: () => Promise<void>;
}

const CSRFContext = createContext<CSRFContextType>({
  token: null,
  refreshToken: async () => {},
});

export const useCSRF = () => useContext(CSRFContext);

interface CSRFProviderProps {
  children: React.ReactNode;
}

export function CSRFProtection({ children }: CSRFProviderProps) {
  const [token, setToken] = useState<string | null>(null);

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/csrf-token', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setToken(data.csrfToken);
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  };

  useEffect(() => {
    refreshToken();
  }, []);

  return (
    <CSRFContext.Provider value={{ token, refreshToken }}>
      {children}
    </CSRFContext.Provider>
  );
}

// HOC for components that need CSRF protection
export function withCSRFProtection<P extends object>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent = (props: P) => {
    const { token } = useCSRF();
    
    return <Component {...props} csrfToken={token} />;
  };
  
  WrappedComponent.displayName = `withCSRFProtection(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}