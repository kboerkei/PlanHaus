import ProgressOverview from "@/components/dashboard/progress-overview";
import AIAssistantCard from "@/components/dashboard/ai-assistant-card";
import EnhancedQuickActions from "@/components/dashboard/enhanced-quick-actions";
import UpcomingTasks from "@/components/dashboard/upcoming-tasks";
import RecentActivity from "@/components/dashboard/recent-activity";
import InspirationPreview from "@/components/dashboard/inspiration-preview";
import MilestoneCelebration from "@/components/dashboard/milestone-celebration";
import CollaborativeFeatures from "@/components/dashboard/collaborative-features";
import SmartOnboarding from "@/components/dashboard/smart-onboarding";
// Removed navigation sections for cleaner design - navigation is now only in header

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-rose-400/10 to-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-purple-400/5 to-rose-400/10 rounded-full blur-2xl" />
        
        <div className="relative p-4 sm:p-8">
          <MilestoneCelebration />
          <SmartOnboarding />

          {/* Enhanced Progress Overview */}
          <div className="mb-8">
            <ProgressOverview />
          </div>
          
          {/* Main Dashboard Grid with Enhanced Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <AIAssistantCard />
            </div>
            <div>
              <EnhancedQuickActions />
            </div>
          </div>

          {/* Enhanced Tasks and Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="card-wedding p-6 hover-lift">
              <UpcomingTasks />
            </div>
            <div className="card-wedding p-6 hover-lift">
              <RecentActivity />
            </div>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card-wedding p-6 hover-lift">
              <CollaborativeFeatures />
            </div>
            <div className="card-wedding p-6 hover-lift">
              <InspirationPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
