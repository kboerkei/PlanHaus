import { Link, useLocation } from "wouter";
import { Heart, Home, Bot, MessageCircle, Calendar, DollarSign, Users, Store, Palette, User, Clock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "The Details", href: "/overview", icon: Heart },
  { name: "Timeline", href: "/timeline", icon: Calendar },
  { name: "Budget", href: "/budget", icon: DollarSign },
  { name: "Guest List", href: "/guests", icon: Users },
  { name: "Vendors", href: "/vendors", icon: Store },
  { name: "Schedules", href: "/schedules", icon: Clock },
  { name: "Inspiration", href: "/inspiration", icon: Palette },
  { name: "Resources", href: "/resources", icon: Globe },
];

const accountNavigation = [
  { name: "Profile", href: "/profile", icon: User },
];

export default function Sidebar() {
  const [location] = useLocation();

  const gradients = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-pink-600', 
    'from-emerald-400 to-teal-600',
    'from-green-400 to-emerald-600',
    'from-orange-400 to-red-600',
    'from-amber-400 to-orange-600',
    'from-indigo-400 to-purple-600',
    'from-pink-400 to-rose-600',
    'from-cyan-400 to-blue-600'
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white/98 backdrop-blur-xl border-r border-gray-100/50 shadow-lg hidden lg:block z-30">
      {/* Enhanced Logo Section */}
      <div className="p-6 border-b border-gray-100/50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 flex items-center justify-center shadow-md ring-2 ring-white ring-opacity-20">
            <Heart className="h-6 w-6 text-white" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight font-heading">PlanHaus</h2>
            <p className="text-xs text-gray-500 font-medium tracking-wide">Wedding Planning</p>
          </div>
        </div>
      </div>
      
      {/* Enhanced Navigation */}
      <nav className="p-6 flex-1 overflow-y-auto">
        <ul className="space-y-3">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            const gradient = gradients[index % gradients.length];
            
            return (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={cn(
                    "relative group flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 font-medium",
                    isActive 
                      ? "bg-gradient-to-r from-rose-50 to-pink-50 text-gray-800 shadow-md border border-rose-100/50" 
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/80 hover:shadow-sm"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-rose-400 to-pink-500 rounded-r-full" />
                  )}
                  
                  {/* Icon with enhanced styling */}
                  <div className={cn(
                    "relative p-2.5 rounded-xl shadow-sm transition-all duration-300 group-hover:scale-105",
                    isActive 
                      ? `bg-gradient-to-br ${gradient} shadow-md` 
                      : "bg-gray-100 group-hover:bg-gray-200"
                  )}>
                    <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-600")} />
                  </div>
                  
                  <span className="relative text-sm font-medium">{item.name}</span>
                  
                  {/* Subtle hover effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        
        {/* Account Section */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">Account</h3>
          <ul className="space-y-2">
            {accountNavigation.map((item, index) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              const gradient = 'from-gray-400 to-gray-600';
              
              return (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={cn(
                      "relative group flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-300 hover-lift font-semibold",
                      isActive 
                        ? "glass-wedding shadow-wedding text-gray-800" 
                        : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 rounded-2xl" />
                    )}
                    
                    <div className={`relative p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    
                    <span className="relative z-10 text-sm">{item.name}</span>
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Enhanced Footer Section */}
        <div className="mt-8">
          <div className="relative p-4 glass-wedding rounded-2xl hover-lift">
            <div className="absolute top-0 left-0 right-0 h-1 gradient-rainbow-wedding rounded-t-2xl" />
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full animate-pulse-glow" />
                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Heart className="h-6 w-6 text-rose-500 animate-pulse" />
                </div>
              </div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Your Perfect Day Awaits</p>
              <p className="text-xs text-gray-500">Plan with Love ❤️</p>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}