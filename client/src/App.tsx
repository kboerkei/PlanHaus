import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AIAssistant from "@/pages/ai-assistant";
import Timeline from "@/pages/timeline";
import Budget from "@/pages/budget";
import Guests from "@/pages/guests";
import Vendors from "@/pages/vendors";
import Inspiration from "@/pages/inspiration";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/timeline" component={Timeline} />
      <Route path="/budget" component={Budget} />
      <Route path="/guests" component={Guests} />
      <Route path="/vendors" component={Vendors} />
      <Route path="/inspiration" component={Inspiration} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
