import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import ProgressOverview from "@/components/dashboard/progress-overview";
import AIAssistantCard from "@/components/dashboard/ai-assistant-card";
import QuickActions from "@/components/dashboard/quick-actions";
import UpcomingTasks from "@/components/dashboard/upcoming-tasks";
import RecentActivity from "@/components/dashboard/recent-activity";
import InspirationPreview from "@/components/dashboard/inspiration-preview";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <Header />
        
        <div className="p-6">
          <ProgressOverview />
          
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AIAssistantCard />
            <QuickActions />
          </div>

          {/* Tasks and Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <UpcomingTasks />
            <RecentActivity />
          </div>

          <InspirationPreview />
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
