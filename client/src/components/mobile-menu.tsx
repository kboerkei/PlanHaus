import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Heart, Home, Bot, Calendar, DollarSign, Users, Store, Palette, User, Clock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
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

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 bg-white shadow-lg lg:hidden">
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-6 border-b border-gray-100">
            <SheetTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-blush-rose rounded-xl flex items-center justify-center">
                <Heart className="text-white" size={20} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-semibold text-gray-800">PlanHaus</h2>
                <p className="text-xs text-gray-500">AI Wedding Planning</p>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          <nav className="p-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blush focus:ring-offset-2",
                        isActive 
                          ? "gradient-blush-rose text-white" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                      )}
                    >
                      <Icon size={16} />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account</h3>
                <ul className="space-y-2">
                  {accountNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    
                    return (
                      <li key={item.name}>
                        <Link 
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blush focus:ring-offset-2",
                            isActive 
                              ? "gradient-blush-rose text-white" 
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                          )}
                        >
                          <Icon size={16} />
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}