import { Link, useLocation } from "wouter";
import { Home, Bot, Calendar, DollarSign, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "AI", href: "/ai-assistant", icon: Bot },
  { name: "Timeline", href: "/timeline", icon: Calendar },
  { name: "Budget", href: "/budget", icon: DollarSign },
  { name: "More", href: "/guests", icon: MoreHorizontal },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-5 py-2">
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 transition-colors",
                isActive ? "text-blush" : "text-gray-400"
              )}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
