import { Link, useLocation } from "wouter";
import { Home, Bot, Calendar, DollarSign, Users, Store, Clock, Palette, User, MoreHorizontal, Globe, Heart, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const primaryNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Timeline", href: "/timeline", icon: Calendar },
  { name: "Budget", href: "/budget", icon: DollarSign },
  { name: "Guests", href: "/guests", icon: Users },
];

const secondaryNavigation = [
  { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
  { name: "Vendors", href: "/vendors", icon: Store },
  { name: "Schedules", href: "/schedules", icon: Clock },
  { name: "Inspiration", href: "/inspiration", icon: Palette },
  { name: "Resources", href: "/resources", icon: Globe },
  { name: "Profile", href: "/profile", icon: User },
];

export default function MobileNav() {
  const [location] = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const gradients = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-pink-600',
    'from-green-400 to-emerald-600',
    'from-orange-400 to-red-600'
  ];

  const secondaryGradients = [
    'from-amber-400 to-orange-600',
    'from-indigo-400 to-purple-600', 
    'from-pink-400 to-rose-600',
    'from-cyan-400 to-blue-600',
    'from-emerald-400 to-teal-600',
    'from-gray-400 to-gray-600'
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-lg lg:hidden z-50 safe-area-pb">
      <div className="grid grid-cols-5 py-3">
        {primaryNavigation.map((item, index) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          const gradient = gradients[index % gradients.length];
          
          return (
            <Link
              key={item.name} 
              href={item.href}
              className={cn(
                "relative flex flex-col items-center py-2 px-1 transition-all duration-300 hover-lift touch-manipulation min-h-[60px] group",
                isActive ? "text-gray-800" : "text-gray-500"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-rose-400 to-pink-600 rounded-b-full" />
              )}
              
              {/* Icon with enhanced styling */}
              <div className={`relative p-2 rounded-xl bg-gradient-to-br ${gradient} shadow-md mb-1.5 transition-all duration-300 ${
                isActive ? 'scale-105 shadow-lg' : 'scale-95 opacity-80'
              } transition-all duration-300 group-hover:scale-95`}>
                <Icon className="h-3.5 w-3.5 text-white" />
              </div>
              
              <span className={`text-[10px] font-semibold truncate max-w-[60px] ${
                isActive ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {item.name}
              </span>
              
              {/* Pulse effect for active item */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer rounded-lg" />
              )}
            </Link>
          );
        })}
        
        <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <SheetTrigger asChild>
            <button className="relative flex flex-col items-center py-2 px-1 transition-all duration-300 hover-lift text-gray-500 touch-manipulation min-h-[60px] group">
              <div className="relative p-1.5 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 shadow-md mb-1 scale-90 opacity-70 group-hover:scale-95 transition-all duration-300">
                <MoreHorizontal className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-[10px] font-semibold truncate max-w-[60px]">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto glass-wedding backdrop-blur-xl border-t border-white/30">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-gradient-wedding text-xl">More Pages</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-3 p-4">
              {secondaryNavigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                const gradient = secondaryGradients[index % secondaryGradients.length];
                
                return (
                  <Link
                    key={item.name} 
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      "relative group flex items-center space-x-3 p-3 rounded-2xl transition-all duration-300 hover-lift touch-manipulation w-full min-h-[56px] font-semibold",
                      isActive 
                        ? "glass-wedding shadow-wedding text-gray-800" 
                        : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 rounded-2xl" />
                    )}
                    
                    {/* Icon with gradient background */}
                    <div className={`relative p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    
                    <span className="relative z-10 text-sm">{item.name}</span>
                    
                    {/* Hover shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-2xl" />
                  </Link>
                );
              })}
            </div>
            
            {/* Enhanced Footer in Sheet */}
            <div className="mt-6 mb-4 mx-4">
              <div className="p-4 glass-wedding rounded-2xl">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-3 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full animate-pulse" />
                    <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-rose-500" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">Your Perfect Day Awaits</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}