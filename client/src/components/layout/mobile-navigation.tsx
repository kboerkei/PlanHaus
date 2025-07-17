import { Link, useLocation } from "wouter";
import { Home, Bot, Calendar, DollarSign, Users, Store, Palette, Clock, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const primaryNavigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Timeline", href: "/timeline", icon: Calendar },
  { name: "Budget", href: "/budget", icon: DollarSign },
  { name: "Guests", href: "/guests", icon: Users },
];

const secondaryNavigation = [
  { name: "Vendors", href: "/vendors", icon: Store },
  { name: "Schedules", href: "/schedules", icon: Clock },
  { name: "Inspiration", href: "/inspiration", icon: Palette },
  { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
];

export default function MobileNavigation() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 lg:hidden z-40">
        <div className="flex items-center justify-around">
          {/* Primary navigation items */}
          {primaryNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link 
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors",
                  isActive 
                    ? "text-rose-600" 
                    : "text-gray-500"
                )}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          {/* More menu button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-gray-500"
              >
                <Menu size={20} />
                <span className="text-xs font-medium">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[50vh]">
              <SheetHeader>
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {secondaryNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <Link 
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-lg border transition-colors",
                        isActive 
                          ? "border-rose-200 bg-rose-50 text-rose-600" 
                          : "border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* Profile link */}
                <Link 
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border transition-colors",
                    location === "/profile"
                      ? "border-rose-200 bg-rose-50 text-rose-600" 
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <Users size={20} />
                  <span className="font-medium">Profile</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      
      {/* Mobile bottom padding to account for fixed navigation */}
      <div className="h-20 lg:hidden" />
    </>
  );
}