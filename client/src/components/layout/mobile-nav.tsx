import { Link, useLocation } from "wouter";
import { Home, Bot, Calendar, DollarSign, Users, Store, Clock, Palette, User, MoreHorizontal, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-pb">
      <div className="grid grid-cols-5 py-2">
        {primaryNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-1 transition-colors",
                isActive ? "text-blush" : "text-gray-400"
              )}
            >
              <Icon size={18} />
              <span className="text-xs mt-1 truncate">{item.name}</span>
            </Link>
          );
        })}
        
        <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center py-2 px-1 transition-colors text-gray-400">
              <MoreHorizontal size={18} />
              <span className="text-xs mt-1">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <div className="grid grid-cols-2 gap-4 p-4">
              {secondaryNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                      isActive ? "bg-blush text-white" : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
