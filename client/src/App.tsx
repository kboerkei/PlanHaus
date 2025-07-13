import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Auth from "@/pages/auth";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AIAssistant from "@/pages/ai-assistant";
import Timeline from "@/pages/timeline";
import Budget from "@/pages/budget";
import Guests from "@/pages/guests";
import Vendors from "@/pages/vendors";
import Inspiration from "@/pages/inspiration";
import Schedules from "@/pages/schedules";
import Intake from "@/pages/intake";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";

function Router({ user, onLogout, isNewUser, onIntakeComplete }: { user: any; onLogout: () => void; isNewUser: boolean; onIntakeComplete: () => void }) {
  // If user is new and hasn't completed intake, redirect them to intake form
  if (isNewUser && !user.hasCompletedIntake) {
    return (
      <Switch>
        <Route path="/intake">
          <Intake onComplete={onIntakeComplete} />
        </Route>
        <Route>
          {() => {
            // Redirect any other route to intake for new users only
            window.location.href = '/intake';
            return null;
          }}
        </Route>
      </Switch>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-auto">
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
            <Route path="/schedules" component={Schedules} />
            <Route path="/profile">
              <Profile user={user} onLogout={onLogout} />
            </Route>
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <MobileNav />
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
      setSessionId(storedSessionId);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
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
          <div className="w-16 h-16 gradient-blush-rose rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading Gatherly...</p>
        </div>
      </div>
    );
  }

  return (
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
  );
}

export default App;
