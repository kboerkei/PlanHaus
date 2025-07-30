import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import KeyboardShortcuts from "@/components/ui/keyboard-shortcuts";
import { ErrorBoundary } from "@/components/error-boundary";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ToastProvider from "@/components/ToastProvider";
import { useAuthSession } from "@/hooks/useAuthSession";
import Auth from "@/pages/auth";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AIAssistant from "@/pages/ai-assistant";
import Chat from "@/pages/Chat";

import Overview from "@/pages/overview";
import Timeline from "@/pages/timeline";
import Budget from "@/pages/budget";
import Guests from "@/pages/guests";
import Vendors from "@/pages/vendors";
import Inspiration from "@/pages/inspiration";
import Resources from "@/pages/resources";
import Schedules from "@/pages/schedules";
import CreativeDetails from "@/pages/creative-details-simple";
import Collaborators from "@/pages/collaborators";
import ActivityLog from "@/pages/activity-log";
import SeatingChart from "@/pages/seating-chart";
import Intake from "@/pages/intake";
import IntakeWizard from "@/pages/IntakeWizard";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav-enhanced";
import FloatingActions from "@/components/layout/floating-actions";
import MobileMenu from "@/components/mobile-menu";

interface User {
  id: string;
  email: string;
  username: string;
  hasCompletedIntake: boolean;
}

function Router({ user, onLogout, isNewUser, onIntakeComplete }: { user: User; onLogout: () => void; isNewUser: boolean; onIntakeComplete: () => void }) {
  // Allow users to access all sections even without completing intake

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <MobileMenu />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Header />
        <main className="flex-1 overflow-auto pb-20 lg:pb-0 px-4 lg:px-0 touch-manipulation">
          <div className="min-h-full flex flex-col max-w-full">
            <div className="flex-1 w-full">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/intake">
                  <Intake onComplete={onIntakeComplete} />
                </Route>
                <Route path="/intake-wizard">
                  <IntakeWizard />
                </Route>
                <Route path="/ai-assistant" component={AIAssistant} />
                <Route path="/chat" component={Chat} />

                <Route path="/overview" component={Overview} />
                <Route path="/timeline" component={Timeline} />
                <Route path="/budget" component={Budget} />
                <Route path="/guests" component={Guests} />
                <Route path="/seating-chart" component={SeatingChart} />
                <Route path="/vendors" component={Vendors} />
                <Route path="/inspiration" component={Inspiration} />
                <Route path="/creative-details" component={CreativeDetails} />
                <Route path="/collaborators" component={Collaborators} />
                <Route path="/activity-log" component={ActivityLog} />
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
  const {
    user,
    sessionId,
    isLoading,
    isNewUser,
    handleAuth,
    handleLogout,
    handleForceClear,
    handleIntakeComplete,
  } = useAuthSession();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Loading PlanHaus..." />
          {import.meta.env.NODE_ENV !== "production" && (
            <button 
              onClick={handleForceClear}
              className="mt-6 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              Clear Cache
            </button>
          )}
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
              <div>
                <Auth onAuth={handleAuth} />
                {/* Debug info in development */}
                {import.meta.env.NODE_ENV !== "production" && (
                  <div className="fixed bottom-4 left-4 bg-black text-white p-2 text-xs rounded">
                    User: {user ? 'Set' : 'None'} | SessionId: {sessionId ? 'Set' : 'None'}
                  </div>
                )}
              </div>
            )}
          </div>
          <Toaster />
          <ToastProvider />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
