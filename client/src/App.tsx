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

function Router({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/timeline" component={Timeline} />
      <Route path="/budget" component={Budget} />
      <Route path="/guests" component={Guests} />
      <Route path="/vendors" component={Vendors} />
      <Route path="/inspiration" component={Inspiration} />
      <Route path="/profile">
        <Profile user={user} onLogout={onLogout} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleAuth = (userData: any, newSessionId: string) => {
    setUser(userData);
    setSessionId(newSessionId);
    localStorage.setItem('sessionId', newSessionId);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setSessionId(null);
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
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
        <Toaster />
        {user && sessionId ? (
          <Router user={user} onLogout={handleLogout} />
        ) : (
          <Auth onAuth={handleAuth} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
