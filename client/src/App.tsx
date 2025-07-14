import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import KeyboardShortcuts from "@/components/ui/keyboard-shortcuts";
import { ErrorBoundary } from "@/components/error-boundary";
import LoadingSpinner from "@/components/loading-spinner";
import Auth from "@/pages/auth";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AIAssistant from "@/pages/ai-assistant";
import Timeline from "@/pages/timeline-enhanced";
import Budget from "@/pages/budget";
import Guests from "@/pages/guests";
import Vendors from "@/pages/vendors";
import Inspiration from "@/pages/inspiration";
import Resources from "@/pages/resources";
import Schedules from "@/pages/schedules";
import Intake from "@/pages/intake";
import Sidebar from "@/components/layout/sidebar-enhanced";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav-enhanced";
import FloatingActions from "@/components/layout/floating-actions";

function Router({ user, onLogout, isNewUser, onIntakeComplete }: { user: any; onLogout: () => void; isNewUser: boolean; onIntakeComplete: () => void }) {
  // Allow users to access all sections even without completing intake

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Header />
        <main className="flex-1 overflow-auto pb-16 lg:pb-0 safe-area-pb">
          <div className="min-h-full flex flex-col">
            <div className="flex-1">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/intake">
                  <Intake onComplete={onIntakeComplete} />
                </Route>
                <Route path="/ai-assistant" component={AIAssistant} />
                <Route path="/timeline" component={Timeline} />
                <Route path="/budget" component={Budget} />
                <Route path="/guests" component={Guests} />
                <Route path="/vendors" component={Vendors} />
                <Route path="/inspiration" component={Inspiration} />
                <Route path="/resources" component={Resources} />
                <Route path="/schedules" component={Schedules} />
                <Route path="/profile">
                  <Profile user={user} onLogout={onLogout} />
                </Route>
                <Route component={NotFound} />
              </Switch>
            </div>
            <Footer />
          </div>
        </main>
      </div>
      <MobileNav />
      <FloatingActions />
      <KeyboardShortcuts />
    </div>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Check for existing session
    const storedSessionId = localStorage.getItem('sessionId');
    const storedUser = localStorage.getItem('user');
    
    if (storedSessionId && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        
        // Verify session is still valid by checking with server
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedSessionId}` }
        })
        .then(async (response) => {
          if (response.ok) {
            const serverUser = await response.json();
            setSessionId(storedSessionId);
            setUser({ ...userData, hasCompletedIntake: serverUser.hasCompletedIntake });
          } else {
            // Session expired, try demo login for seamless user experience
            console.log('Session expired, attempting demo login...');
            fetch('/api/auth/demo-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            })
            .then(async (demoResponse) => {
              if (demoResponse.ok) {
                const demoData = await demoResponse.json();
                setUser(demoData.user);
                setSessionId(demoData.sessionId);
                localStorage.setItem('sessionId', demoData.sessionId);
                localStorage.setItem('user', JSON.stringify(demoData.user));
              } else {
                // Clear invalid session
                localStorage.removeItem('sessionId');
                localStorage.removeItem('user');
              }
            })
            .catch(() => {
              localStorage.removeItem('sessionId');
              localStorage.removeItem('user');
            });
          }
          setIsLoading(false);
        })
        .catch(() => {
          // Network error - try demo login for development
          console.log('Network error, attempting demo login...');
          fetch('/api/auth/demo-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
          .then(async (demoResponse) => {
            if (demoResponse.ok) {
              const demoData = await demoResponse.json();
              setUser(demoData.user);
              setSessionId(demoData.sessionId);
              localStorage.setItem('sessionId', demoData.sessionId);
              localStorage.setItem('user', JSON.stringify(demoData.user));
            } else {
              localStorage.removeItem('sessionId');
              localStorage.removeItem('user');
            }
          })
          .catch(() => {
            localStorage.removeItem('sessionId');
            localStorage.removeItem('user');
          })
          .finally(() => {
            setIsLoading(false);
          });
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
        setIsLoading(false);
      }
    } else {
      // No stored session, try demo login for development
      console.log('No stored session, attempting demo login...');
      fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(async (demoResponse) => {
        if (demoResponse.ok) {
          const demoData = await demoResponse.json();
          setUser(demoData.user);
          setSessionId(demoData.sessionId);
          localStorage.setItem('sessionId', demoData.sessionId);
          localStorage.setItem('user', JSON.stringify(demoData.user));
        }
      })
      .catch(() => {
        console.log('Demo login failed, showing auth page');
      })
      .finally(() => {
        setIsLoading(false);
      });
    }
  }, []);

  const handleAuth = (userData: any, newSessionId: string, isRegistration = false) => {
    setUser(userData);
    setSessionId(newSessionId);
    setIsNewUser(isRegistration && !userData.hasCompletedIntake);
    localStorage.setItem('sessionId', newSessionId);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setSessionId(null);
    setIsNewUser(false);
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
  };

  // Force clear session for testing
  const handleForceClear = () => {
    localStorage.clear();
    setUser(null);
    setSessionId(null);
    setIsNewUser(false);
    window.location.reload();
  };

  const handleIntakeComplete = () => {
    setIsNewUser(false);
    // Update user object to reflect completed intake
    if (user) {
      const updatedUser = { ...user, hasCompletedIntake: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Loading Gatherly..." />
          <button 
            onClick={handleForceClear}
            className="mt-6 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            Clear Cache
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-50">
            {user && sessionId ? (
              <Router 
                user={user} 
                onLogout={handleLogout} 
                isNewUser={isNewUser}
                onIntakeComplete={handleIntakeComplete}
              />
            ) : (
              <Auth onAuth={handleAuth} />
            )}
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
