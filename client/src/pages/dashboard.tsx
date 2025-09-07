import * as React from "react";
import { useState } from "react";
import { Link } from "wouter";
import { differenceInDays } from "date-fns";
import { Plus, Calendar, Users, DollarSign, MapPin, Clock, CheckCircle, ArrowRight, Sparkles, Heart, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

// Import only components that exist
import { FEATURE_FLAGS } from "@/lib/constants";
import AIAssistantCard from "@/components/dashboard/ai-assistant-card";

// Type definitions
interface DashboardStats {
  tasks: {
    total: number;
    completed: number;
  };
  guests: {
    total: number;
    confirmed: number;
  };
  budget: {
    total: number;
    spent: number;
  };
  vendors: {
    total: number;
    booked: number;
  };
  daysUntilWedding: number;
}

interface Project {
  id: number;
  name: string;
  date: string;
  budget: string;
}

// Quick access items (these can stay as they're navigation links)
const quickAccessItems = [
  {
    title: "Timeline",
    description: "Manage your wedding schedule",
    href: "/timeline",
    icon: Clock,
    emoji: "⏰",
    gradient: "from-blue-400 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50"
  },
  {
    title: "Guests",
    description: "Track RSVPs and seating",
    href: "/guests",
    icon: Users,
    emoji: "👥",
    gradient: "from-emerald-400 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50"
  },
  {
    title: "Budget",
    description: "Monitor expenses and payments",
    href: "/budget",
    icon: DollarSign,
    emoji: "💰",
    gradient: "from-purple-400 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50"
  },
  {
    title: "Vendors",
    description: "Find and manage suppliers",
    href: "/vendors",
    icon: MapPin,
    emoji: "🏛️",
    gradient: "from-orange-400 to-red-500",
    bgGradient: "from-orange-50 to-red-50"
  }
];

const planningTools = [
  {
    title: "Intake Form",
    description: "Complete your wedding details",
    href: "/intake",
    icon: CheckCircle,
    emoji: "📝",
    gradient: "from-indigo-400 to-purple-500",
    bgGradient: "from-indigo-50 to-purple-50"
  },
  {
    title: "Checklist",
    description: "Track your planning progress",
    href: "/checklist",
    icon: CheckCircle,
    emoji: "✅",
    gradient: "from-green-400 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50"
  },
  {
    title: "Inspiration",
    description: "Browse wedding ideas",
    href: "/inspiration",
    icon: CheckCircle,
    emoji: "💡",
    gradient: "from-yellow-400 to-orange-500",
    bgGradient: "from-yellow-50 to-orange-50"
  },
  {
    title: "Settings",
    description: "Manage your preferences",
    href: "/settings",
    icon: CheckCircle,
    emoji: "⚙️",
    gradient: "from-gray-400 to-slate-500",
    bgGradient: "from-gray-50 to-slate-50"
  }
];

// Mock hook for performance monitoring
const usePerformanceMonitor = () => {
  return { isOptimized: true };
};

// Mock hook for prefetching
const usePrefetchPageData = () => {
  return (key: string) => {
    console.log(`Prefetching data for: ${key}`);
  };
};

const PersonalizedGreeting = () => {
  // Use real API data for the greeting
  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: !!localStorage.getItem('sessionId'),
  });

  const { data: dashboardStats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!localStorage.getItem('sessionId'),
  });

  // Get current project (Emma & Jake's Wedding)
  const currentProject = projects?.find((p: Project) => p.name === "Emma & Jake's Wedding") || projects?.[0];

  // Calculate real values
  const weddingDate = currentProject ? new Date(currentProject.date) : new Date();
  const today = new Date();
  const daysUntil = Math.max(0, Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // Calculate overall progress
  const taskProgress = dashboardStats?.tasks?.total > 0 
    ? Math.round((dashboardStats.tasks.completed / dashboardStats.tasks.total) * 100)
    : 0;

  const budgetProgress = dashboardStats?.budget?.total > 0
    ? Math.round((dashboardStats.budget.spent / dashboardStats.budget.total) * 100)
    : 0;

  const guestProgress = dashboardStats?.guests?.total > 0
    ? Math.round((dashboardStats.guests.confirmed / dashboardStats.guests.total) * 100)
    : 0;

  const vendorProgress = dashboardStats?.vendors?.total > 0
    ? Math.round((dashboardStats.vendors.booked / dashboardStats.vendors.total) * 100)
    : 0;

  const overallProgress = Math.round((taskProgress + budgetProgress + guestProgress + vendorProgress) / 4);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 via-white to-rose-50 p-8 mb-8 border border-pink-100 shadow-lg">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200/20 to-rose-200/20 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/20 to-yellow-200/20 rounded-full translate-y-12 -translate-x-12"></div>
      
      <div className="relative text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-6 w-6 text-pink-500 mr-2" />
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Welcome back! 👋
          </h2>
          <Sparkles className="h-6 w-6 text-pink-500 ml-2" />
        </div>
        
        <div className="space-y-2">
          <p className="text-lg text-slate-700 font-medium">
            Only <span className="font-bold text-pink-600 text-xl">{daysUntil} days</span> until your magical day! 🎉
          </p>
        </div>
        
        <p className="text-slate-600 mt-3 font-medium">
          Let's make your wedding dreams come true ✨
        </p>
        
        {/* Progress indicator */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Planning Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${overallProgress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClickableStatsCards = () => {
  // Use real API data instead of mock data
  const { data: dashboardStats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!localStorage.getItem('sessionId'),
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: !!localStorage.getItem('sessionId'),
  });

  // Get current project (Emma & Jake's Wedding)
  const currentProject = projects?.find((p: Project) => p.name === "Emma & Jake's Wedding") || projects?.[0];

  if (isLoading || !dashboardStats || !currentProject) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border shadow-sm p-6 bg-white min-w-[240px] h-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              <div className="h-2 bg-slate-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate real stats from API data
  const weddingDate = new Date(currentProject.date);
  const today = new Date();
  const daysUntil = Math.max(0, Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // Calculate percentages
  const taskProgress = dashboardStats.tasks?.total > 0 
    ? Math.round((dashboardStats.tasks.completed / dashboardStats.tasks.total) * 100)
    : 0;

  const budgetProgress = dashboardStats.budget?.total > 0
    ? Math.round((dashboardStats.budget.spent / dashboardStats.budget.total) * 100)
    : 0;

  const guestProgress = dashboardStats.guests?.total > 0
    ? Math.round((dashboardStats.guests.confirmed / dashboardStats.guests.total) * 100)
    : 0;

  const vendorProgress = dashboardStats.vendors?.total > 0
    ? Math.round((dashboardStats.vendors.booked / dashboardStats.vendors.total) * 100)
    : 0;

  // Create real stats array
  const realStats = [
    {
      title: "Days Until Wedding",
      value: daysUntil > 0 ? daysUntil.toString() : "Today!",
      icon: Calendar,
      href: "/timeline",
      emoji: "📅",
      description: daysUntil > 0 ? `Countdown to ${weddingDate.toLocaleDateString()}` : "Your big day!",
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
      progress: daysUntil > 0 ? Math.min(100, Math.max(0, 100 - (daysUntil / 365) * 100)) : 100
    },
    {
      title: "Total Guests",
      value: dashboardStats.guests?.total?.toString() || "0",
      icon: Users,
      href: "/guests",
      emoji: "👥",
      description: `${dashboardStats.guests?.confirmed || 0} confirmed RSVPs`,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
      progress: guestProgress
    },
    {
      title: "Budget Spent",
      value: `$${dashboardStats.budget?.spent?.toLocaleString() || "0"}`,
      icon: DollarSign,
      href: "/budget",
      emoji: "💰",
      description: `${budgetProgress}% of $${dashboardStats.budget?.total?.toLocaleString() || "0"}`,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
      progress: budgetProgress
    },
    {
      title: "Vendors Booked",
      value: `${dashboardStats.vendors?.booked || 0}/${dashboardStats.vendors?.total || 0}`,
      icon: MapPin,
      href: "/vendors",
      emoji: "🏛️",
      description: `${vendorProgress}% secured`,
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-50 to-red-50",
      progress: vendorProgress
    }
  ];

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900">Your Wedding Progress</h2>
          <p className="text-slate-600 mt-1">Track your planning milestones and achievements</p>
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium text-amber-700">Live Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {realStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} href={stat.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                          <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                        </div>
                      </div>
                      <div className="text-2xl opacity-60 group-hover:opacity-80 transition-opacity">
                        {stat.emoji}
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3">{stat.description}</p>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${stat.gradient}`}
                        style={{ width: `${stat.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Progress</span>
                      <span className="font-medium">{stat.progress}%</span>
                    </div>
                    
                    <div className="flex items-center mt-3 text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                      <span>View details</span>
                      <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const QuickAccessCards = () => {
  const prefetchPageData = usePrefetchPageData();

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-3"></div>
        <h2 className="text-xl font-bold text-slate-800">Quick Access</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {quickAccessItems.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <div 
                className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl transform group-hover:scale-110 transition-transform duration-300">{card.emoji}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-slate-700 transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-sm text-slate-500 group-hover:text-slate-700 transition-colors duration-300">
                    <span>Open {card.title.toLowerCase()}</span>
                    <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const PlanningToolsSection = () => {
  const prefetchPageData = usePrefetchPageData();

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-3"></div>
        <h2 className="text-xl font-bold text-slate-800">Planning Tools</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {planningTools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.href} href={tool.href}>
              <div 
                className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-md`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl transform group-hover:scale-110 transition-transform duration-300">{tool.emoji}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-slate-700 transition-colors duration-300">
                      {tool.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-sm text-slate-500 group-hover:text-slate-700 transition-colors duration-300">
                    <span>Open {tool.title.toLowerCase()}</span>
                    <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { isOptimized } = usePerformanceMonitor();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-24">
        
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-10 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-slate-500 text-sm mt-1">Your wedding planning command center</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">
                {FEATURE_FLAGS.DASHBOARD_SMART_ACTIONS ? "Enhanced View" : "Classic View"}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Personalized Greeting */}
        <div className="mb-8">
          <PersonalizedGreeting />
        </div>

        {/* Enhanced Stats Cards */}
        <div className="mb-8">
          <ClickableStatsCards />
        </div>

        {/* Enhanced AI Assistant Card */}
        <div className="mb-8">
          <AIAssistantCard />
        </div>

        {/* Enhanced Quick Access */}
        <div className="mb-8">
          <QuickAccessCards />
        </div>

        {/* Enhanced Planning Tools */}
        <div className="mb-8">
          <PlanningToolsSection />
        </div>
      </div>

      {/* Enhanced Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          className="group relative w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-500/40 transform hover:scale-110"
          aria-label="Quick actions"
        >
          <Plus className="h-7 w-7 transform group-hover:rotate-90 transition-transform duration-300" />
          
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;