import React, { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Users, Store, Palette, Bot, Clock, Globe, ArrowRight, Heart, CheckCircle2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, SectionHeader } from '@/components/design-system';
import { Badge } from '@/components/ui/badge';
import { differenceInDays } from 'date-fns';
import { usePerformanceMonitor } from '@/hooks/usePerformanceOptimization';
import type { 
  DashboardStats, 
  NavigationSection, 
  NavigationItem, 
  QuickAction,
  DashboardNotification 
} from '@/types';

// Import dashboard components
import AIAssistantCard from '@/components/dashboard/ai-assistant-card';
import EnhancedQuickActions from '@/components/dashboard/enhanced-quick-actions';
import { AINextStepsPanel } from '@/components/dashboard/AINextStepsPanel';
import { QuickStatsBar } from '@/components/dashboard/QuickStatsBar';

interface DashboardProps {
  variant?: 'default' | 'optimized' | 'enhanced';
  onAction?: (action: any) => void;
  className?: string;
}

const navigationSections: NavigationSection[] = [
  {
    title: "Planning",
    description: "Core wedding planning tools",
    items: [
      { 
        href: "/timeline", 
        label: "Timeline & Tasks", 
        icon: Calendar, 
        description: "Manage your wedding timeline", 
        prefetchKey: ['/api/projects', 1, 'tasks'] 
      },
      { 
        href: "/budget", 
        label: "Budget Tracker", 
        icon: DollarSign, 
        description: "Track expenses and costs", 
        prefetchKey: ['/api/projects', 1, 'budget'] 
      },
      { 
        href: "/guests", 
        label: "Guest Management", 
        icon: Users, 
        description: "Manage your guest list", 
        prefetchKey: ['/api/projects', 1, 'guests'] 
      },
      { 
        href: "/vendors", 
        label: "Vendor Directory", 
        icon: Store, 
        description: "Find and manage vendors", 
        prefetchKey: ['/api/projects', 1, 'vendors'] 
      },
    ]
  },
  {
    title: "Creative & Support",
    description: "Inspiration and assistance",
    items: [
      { 
        href: "/inspiration", 
        label: "Inspiration Board", 
        icon: Palette, 
        description: "Save ideas and inspiration" 
      },
      { 
        href: "/ai-assistant", 
        label: "AI Assistant", 
        icon: Bot, 
        description: "Get personalized advice" 
      },
      { 
        href: "/schedules", 
        label: "Event Schedules", 
        icon: Clock, 
        description: "Plan your wedding day" 
      },
      { 
        href: "/resources", 
        label: "Resources", 
        icon: Globe, 
        description: "Helpful guides and tips" 
      },
    ]
  }
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// Planning Tools Section with Data Prefetching
const PlanningToolsSection = memo(() => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="mb-8 sm:mb-10"
    >
      <SectionHeader
        variant="wedding"
        size="lg"
        alignment="center"
        title="Planning Tools"
        subtitle="Everything you need to plan your perfect wedding"
        showAccent={true}
        accentColor="rose"
        className="mb-6 sm:mb-8"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
        {navigationSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, x: sectionIndex % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * sectionIndex }}
          >
            <Card variant="wedding" className="h-full">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="font-heading text-lg sm:text-xl lg:text-2xl text-foreground flex items-center gap-3">
                  {section.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * itemIndex + 0.2 }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-auto p-4 hover:bg-rose-50 hover:border-rose-200 transition-all duration-200"
                      asChild
                    >
                      <a href={item.href}>
                        <div className="flex items-center gap-3 w-full">
                          <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm">{item.label}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </a>
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});

PlanningToolsSection.displayName = "PlanningToolsSection";

// Dashboard Stats Section
const DashboardStatsSection = memo(({ stats }: { stats: DashboardStats }) => {
  const taskProgress = stats.tasks.total > 0 
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) 
    : 0;

  const budgetProgress = stats.budget.total > 0 
    ? Math.round((stats.budget.spent / stats.budget.total) * 100) 
    : 0;

  const guestProgress = stats.guests.total > 0 
    ? Math.round((stats.guests.confirmed / stats.guests.total) * 100) 
    : 0;

  const vendorProgress = stats.vendors.total > 0 
    ? Math.round((stats.vendors.booked / stats.vendors.total) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="wedding" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tasks</p>
              <p className="text-2xl font-bold">{stats.tasks.completed}/{stats.tasks.total}</p>
              <p className="text-xs text-muted-foreground">{taskProgress}% complete</p>
            </div>
            <Calendar className="h-8 w-8 text-rose-600" />
          </div>
        </Card>

        <Card variant="wedding" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Budget</p>
              <p className="text-2xl font-bold">${stats.budget.spent.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{budgetProgress}% used</p>
            </div>
            <DollarSign className="h-8 w-8 text-rose-600" />
          </div>
        </Card>

        <Card variant="wedding" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Guests</p>
              <p className="text-2xl font-bold">{stats.guests.confirmed}/{stats.guests.total}</p>
              <p className="text-xs text-muted-foreground">{guestProgress}% confirmed</p>
            </div>
            <Users className="h-8 w-8 text-rose-600" />
          </div>
        </Card>

        <Card variant="wedding" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vendors</p>
              <p className="text-2xl font-bold">{stats.vendors.booked}/{stats.vendors.total}</p>
              <p className="text-xs text-muted-foreground">{vendorProgress}% booked</p>
            </div>
            <Store className="h-8 w-8 text-rose-600" />
          </div>
        </Card>
      </div>
    </motion.div>
  );
});

DashboardStatsSection.displayName = "DashboardStatsSection";

// Main Dashboard Component
export const Dashboard = memo(({ 
  variant = 'default', 
  onAction, 
  className 
}: DashboardProps) => {
  // Fetch dashboard data
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const greeting = useMemo(() => getGreeting(), []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Failed to load dashboard data</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-rose-50 to-white ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-2">
              {greeting}! 👋
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Let's make your wedding planning journey magical
            </p>
            {stats?.daysUntilWedding && (
              <Badge className="text-sm bg-rose-100 text-rose-800 hover:bg-rose-200">
                <Heart className="h-4 w-4 mr-1" />
                {stats.daysUntilWedding} days until your wedding
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Dashboard Stats */}
        {stats && <DashboardStatsSection stats={stats} />}

        {/* Planning Tools */}
        <PlanningToolsSection />

        {/* AI Assistant Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-8"
        >
          <AIAssistantCard />
        </motion.div>

        {/* Enhanced Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-8"
        >
          <EnhancedQuickActions />
        </motion.div>

        {/* AI Next Steps Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <AINextStepsPanel daysToGo={stats?.daysUntilWedding || 0} />
        </motion.div>
      </div>
    </div>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard; 