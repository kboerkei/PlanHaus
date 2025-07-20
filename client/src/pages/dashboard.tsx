import ProgressOverview from "@/components/dashboard/progress-overview";
import AIAssistantCard from "@/components/dashboard/ai-assistant-card";
import EnhancedQuickActions from "@/components/dashboard/enhanced-quick-actions";
import UpcomingTasks from "@/components/dashboard/upcoming-tasks";
import RecentActivity from "@/components/dashboard/recent-activity";
import InspirationPreview from "@/components/dashboard/inspiration-preview";

import CollaborativeFeatures from "@/components/dashboard/collaborative-features";
import SmartOnboarding from "@/components/dashboard/smart-onboarding";
import ProjectOverview from "@/components/ProjectOverview";
import { Link } from "wouter";
import { Calendar, DollarSign, Users, Store, Palette, Bot, Clock, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const navigationSections = [
  {
    title: "Planning",
    description: "Core wedding planning tools",
    items: [
      { href: "/timeline", label: "Timeline & Tasks", icon: Calendar, description: "Manage your wedding timeline" },
      { href: "/budget", label: "Budget Tracker", icon: DollarSign, description: "Track expenses and costs" },
      { href: "/guests", label: "Guest Management", icon: Users, description: "Manage your guest list" },
      { href: "/vendors", label: "Vendor Directory", icon: Store, description: "Find and manage vendors" },
    ]
  },
  {
    title: "Creative & Support",
    description: "Inspiration and assistance",
    items: [
      { href: "/inspiration", label: "Inspiration Board", icon: Palette, description: "Save ideas and inspiration" },
      { href: "/ai-assistant", label: "AI Assistant", icon: Bot, description: "Get personalized advice" },
      { href: "/schedules", label: "Event Schedules", icon: Clock, description: "Plan your wedding day" },
      { href: "/resources", label: "Resources", icon: Globe, description: "Helpful guides and tips" },
    ]
  }
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cream/50 to-background">
      <div className="relative overflow-hidden">
        {/* Enhanced background decorations */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-rose-400/8 to-pink-400/15 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-purple-400/5 to-rose-400/10 rounded-full blur-2xl" />
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-champagne/20 to-rose-400/10 rounded-full blur-xl" />
        
        <div className="relative p-3 sm:p-4 lg:p-8 mobile-safe-spacing">
          <SmartOnboarding />
          
          {/* Progress Overview */}
          <ProgressOverview />
          
          {/* Main Dashboard Grid with Enhanced Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10 mb-8">
            <div className="lg:col-span-2">
              <AIAssistantCard />
            </div>
            <div>
              <EnhancedQuickActions />
            </div>
          </div>

          {/* Enhanced Tasks and Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 mb-8">
            <div className="card-elegant hover:scale-[1.02] transition-all duration-300">
              <UpcomingTasks />
            </div>
            <div className="card-elegant hover:scale-[1.02] transition-all duration-300">
              <RecentActivity />
            </div>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 mb-8">
            <div className="card-elegant hover:scale-[1.02] transition-all duration-300">
              <CollaborativeFeatures />
            </div>
            <div className="card-elegant hover:scale-[1.02] transition-all duration-300">
              <InspirationPreview />
            </div>
          </div>

          {/* Planning Tools Section */}
          <div className="mb-8 animate-fade-in-up">
            <div className="text-center mb-8 animate-fade-in-up">
              <h2 className="font-heading text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">Planning Tools</h2>
              <p className="text-muted-foreground text-lg lg:text-xl font-medium">Everything you need to plan your perfect wedding</p>
              <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full mx-auto mt-4"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {navigationSections.map((section, sectionIndex) => (
                <Card key={section.title} className={`card-elegant animate-slide-in-right stagger-${sectionIndex + 1} hover:scale-[1.02] transition-all duration-300`}>
                  <CardHeader>
                    <CardTitle className="font-heading text-2xl text-foreground flex items-center gap-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-rose-400 to-pink-500 rounded-full"></div>
                      {section.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-base font-medium">{section.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      {section.items.map((item, itemIndex) => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.href} href={item.href}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start h-auto p-4 lg:p-6 hover:bg-rose-50 hover:border-rose-200 border border-transparent transition-all duration-200 group hover:scale-105"
                            >
                              <div className="flex items-center space-x-3 lg:space-x-4 w-full">
                                <div className="flex-shrink-0">
                                  <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-rose-400 group-hover:text-rose-500 transition-colors" />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="font-medium text-foreground group-hover:text-rose-600 transition-colors text-base lg:text-lg">
                                    {item.label}
                                  </div>
                                  <div className="text-sm lg:text-base text-muted-foreground">
                                    {item.description}
                                  </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-rose-500 transition-colors" />
                              </div>
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
