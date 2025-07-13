import ProgressOverview from "@/components/dashboard/progress-overview";
import AIAssistantCard from "@/components/dashboard/ai-assistant-card";
import EnhancedQuickActions from "@/components/dashboard/enhanced-quick-actions";
import UpcomingTasks from "@/components/dashboard/upcoming-tasks";
import RecentActivity from "@/components/dashboard/recent-activity";
import InspirationPreview from "@/components/dashboard/inspiration-preview";
import MilestoneCelebration from "@/components/dashboard/milestone-celebration";
import CollaborativeFeatures from "@/components/dashboard/collaborative-features";
import SmartOnboarding from "@/components/dashboard/smart-onboarding";

export default function Dashboard() {
  return (
    <div className="p-6 bg-cream min-h-full">
      <MilestoneCelebration />
      <SmartOnboarding />
      <ProgressOverview />
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AIAssistantCard />
        <EnhancedQuickActions />
      </div>

      {/* Tasks and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <UpcomingTasks />
        <RecentActivity />
      </div>

      <CollaborativeFeatures />
      <InspirationPreview />
    </div>
  );
}
