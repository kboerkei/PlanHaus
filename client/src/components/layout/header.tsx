import { Heart, Calendar, Users, DollarSign, Camera, Sparkles, Settings, Home, Clock, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/timeline", label: "Timeline", icon: Calendar },
  { href: "/budget", label: "Budget", icon: DollarSign },
  { href: "/guests", label: "Guests", icon: Users },
  { href: "/vendors", label: "Vendors", icon: Settings },
  { href: "/schedules", label: "Schedules", icon: Clock },
  { href: "/inspiration", label: "Inspiration", icon: Camera },
  { href: "/ai-assistant", label: "AI Assistant", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="nav-elegant sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Heart 
                className="h-8 w-8 text-rose-400 group-hover:text-rose-500 transition-colors" 
                fill="currentColor"
              />
              <div className="absolute inset-0 bg-rose-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="logo">Gatherly</span>
          </Link>

          {/* Desktop Navigation - Removed since sidebar handles navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Navigation moved to sidebar for cleaner design */}
          </div>

          {/* Mobile Navigation Indicator */}
          <div className="lg:hidden">
            <span className="text-sm text-gray-600 font-medium">
              Your Wedding Planning Journey
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}