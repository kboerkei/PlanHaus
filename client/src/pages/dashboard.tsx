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
import { Calendar, DollarSign, Users, Store, Palette, Bot, Clock, Globe, ArrowRight, Heart, CheckCircle2, TrendingUp, Plus } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, SectionHeader } from "@/components/design-system";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays } from "date-fns";

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

// Enhanced Dashboard Components
function PersonalizedGreeting() {
  const { data: intakeData } = useQuery({
    queryKey: ['/api/intake'],
    enabled: !!localStorage.getItem('sessionId')
  });

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!localStorage.getItem('sessionId')
  });

  const projectsArray = Array.isArray(projects) ? projects : [];
  const currentProject = projectsArray.find((p: any) => p.name === "Emma & Jake's Wedding") || projectsArray[0];
  const firstName = (intakeData as any)?.partner1FirstName || "Demo User";
  const weddingDate = currentProject?.date;
  const daysUntil = weddingDate ? differenceInDays(new Date(weddingDate), new Date()) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-6 sm:mb-8"
    >
      <div className="text-center sm:text-left">
        <h1 className="text-xl font-bold text-gradient mb-2">
          {firstName !== "Demo User" ? `Welcome back, ${firstName}!` : "Welcome to PlanHaus!"}
          <Heart className="inline-block ml-2 h-6 w-6 text-rose-500" fill="currentColor" />
        </h1>
        {daysUntil && daysUntil > 0 && (
          <p className="text-sm sm:text-base text-muted-foreground">
            Only <span className="font-semibold text-rose-600 dark:text-rose-400">{daysUntil} days</span> until your special day!
          </p>
        )}
      </div>
    </motion.div>
  );
}

function NextUpSection() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/tasks'],
    enabled: !!localStorage.getItem('sessionId')
  });

  const tasksArray = Array.isArray(tasks) ? tasks : [];
  const nextTasks = tasksArray.filter((task: any) => !task.isCompleted)
    .sort((a: any, b: any) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return 0;
    })
    .slice(0, 2);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 sm:mb-8"
      >
        <Card className="p-4 sm:p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-6 sm:mb-8"
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-rose-500" />
            <CardTitle className="text-lg sm:text-xl">Next Up</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {!nextTasks || nextTasks.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">All caught up! Great work.</p>
              <Link href="/timeline">
                <Button variant="wedding">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Task
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {nextTasks.map((task: any, index: number) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground truncate">{task.title}</h4>
                      {task.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs px-2 py-0">High</Badge>
                      )}
                    </div>
                    {task.dueDate && (
                      <p className="text-sm text-muted-foreground">
                        Due {format(new Date(task.dueDate), 'MMM d')}
                      </p>
                    )}
                  </div>
                  <Link href="/timeline">
                    <Button size="sm" variant="ghost" className="ml-2">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AnimatedDashboardStats() {
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!localStorage.getItem('sessionId')
  });

  const statsData = dashboardStats || {};
  const stats = [
    {
      label: "Tasks Complete",
      value: (statsData as any).tasksCompleted || 0,
      total: (statsData as any).totalTasks || 0,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      emptyMessage: "No tasks yet",
      emptyAction: { href: "/timeline", text: "Start planning →" }
    },
    {
      label: "Budget Used",
      value: `$${(statsData as any).totalSpent?.toLocaleString() || 0}`,
      total: `$${(statsData as any).totalBudget?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      emptyMessage: "No budget set",
      emptyAction: { href: "/budget", text: "Set budget →" }
    },
    {
      label: "RSVP Responses",
      value: (statsData as any).rsvpResponses || 0,
      total: (statsData as any).totalGuests || 0,
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      emptyMessage: "No guests added",
      emptyAction: { href: "/guests", text: "Add guests →" }
    },
    {
      label: "Vendors Booked",
      value: (statsData as any).vendorsBooked || 0,
      total: (statsData as any).totalVendors || 0,
      icon: Store,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/30",
      emptyMessage: "No vendors yet",
      emptyAction: { href: "/vendors", text: "Find vendors →" }
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isEmpty = stat.value === 0 || stat.value === "$0";
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                {isEmpty ? (
                  <div className="text-center">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">{stat.emptyMessage}</p>
                    <Link href={stat.emptyAction.href}>
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        {stat.emptyAction.text}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-lg sm:text-xl font-bold text-foreground">
                        {stat.value}
                        {stat.total && stat.total !== "$0" && (
                          <span className="text-sm font-normal text-muted-foreground">
                            /{typeof stat.total === 'string' ? stat.total : stat.total}
                          </span>
                        )}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cream/50 to-background dark:from-background dark:via-background dark:to-background">
      <div className="relative overflow-hidden">
        {/* Enhanced background decorations */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-rose-400/8 to-pink-400/15 rounded-full blur-3xl animate-float dark:from-rose-600/10 dark:to-pink-600/20" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-purple-400/5 to-rose-400/10 rounded-full blur-2xl dark:from-purple-600/8 dark:to-rose-600/15" />
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-champagne/20 to-rose-400/10 rounded-full blur-xl dark:from-champagne/10 dark:to-rose-600/15" />
        
        <div className="relative p-3 sm:p-4 lg:p-8 mobile-safe-spacing">
          {/* Personalized Greeting */}
          <PersonalizedGreeting />
          
          {/* Animated Dashboard Stats */}
          <AnimatedDashboardStats />
          
          {/* Next Up Section */}
          <NextUpSection />
          
          <SmartOnboarding />
          
          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <ProgressOverview />
          </motion.div>
          
          {/* Main Dashboard Grid with Enhanced Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8"
          >
            <div className="lg:col-span-2">
              <AIAssistantCard />
            </div>
            <div>
              <EnhancedQuickActions />
            </div>
          </motion.div>

          {/* Enhanced Tasks and Activity Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8"
          >
            <div className="transition-all duration-300 hover:scale-[1.02]">
              <UpcomingTasks />
            </div>
            <div className="transition-all duration-300 hover:scale-[1.02]">
              <RecentActivity />
            </div>
          </motion.div>

          {/* Enhanced Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8"
          >
            <div className="transition-all duration-300 hover:scale-[1.02]">
              <CollaborativeFeatures />
            </div>
            <div className="transition-all duration-300 hover:scale-[1.02]">
              <InspirationPreview />
            </div>
          </motion.div>

          {/* Planning Tools Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="mb-6 sm:mb-8"
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
                        <div className="w-1 sm:w-2 h-6 sm:h-8 bg-gradient-to-b from-rose-400 to-pink-500 rounded-full"></div>
                        {section.title}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm sm:text-base font-medium">{section.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 gap-2 sm:gap-3">
                        {section.items.map((item, itemIndex) => {
                          const Icon = item.icon;
                          return (
                            <Link key={item.href} href={item.href}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start h-auto p-3 sm:p-4 lg:p-6 hover:bg-rose-50 hover:border-rose-200 border border-transparent transition-all duration-200 group hover:scale-105"
                              >
                                <div className="flex items-center space-x-3 lg:space-x-4 w-full min-w-0">
                                  <div className="flex-shrink-0">
                                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-rose-400 group-hover:text-rose-500 transition-colors" />
                                  </div>
                                  <div className="flex-1 text-left min-w-0">
                                    <div className="font-medium text-foreground group-hover:text-rose-600 transition-colors text-sm sm:text-base lg:text-lg truncate">
                                      {item.label}
                                    </div>
                                    <div className="text-xs sm:text-sm lg:text-base text-muted-foreground truncate">
                                      {item.description}
                                    </div>
                                  </div>
                                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-rose-500 transition-colors flex-shrink-0" />
                                </div>
                              </Button>
                            </Link>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
