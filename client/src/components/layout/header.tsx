import { Bell, Menu, X, Home, Bot, Calendar, DollarSign, Users, Store, Clock, Palette, User, Globe } from "lucide-react";
import SmartNotifications from "@/components/ui/smart-notifications";
import KeyboardShortcuts from "@/components/ui/keyboard-shortcuts";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { cn } from "@/lib/utils";

function getCoupleInitials(partner1FirstName?: string, partner2FirstName?: string): string {
  const initial1 = partner1FirstName?.charAt(0)?.toUpperCase() || '';
  const initial2 = partner2FirstName?.charAt(0)?.toUpperCase() || '';
  return initial1 + initial2 || 'G';
}

function getCoupleNames(partner1FirstName?: string, partner2FirstName?: string): string {
  if (partner1FirstName && partner2FirstName) {
    return `${partner1FirstName} & ${partner2FirstName}`;
  }
  if (partner1FirstName) {
    return partner1FirstName;
  }
  if (partner2FirstName) {
    return partner2FirstName;
  }
  return '';
}

function calculateDaysUntilWedding(weddingDate?: string): number | null {
  if (!weddingDate) return null;
  const wedding = new Date(weddingDate);
  const today = new Date();
  const diffTime = wedding.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : null;
}

interface HeaderProps {
  user?: any;
  onLogout?: () => void;
}

const navigationSections = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", href: "/", icon: Home },
      { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
      { name: "Timeline", href: "/timeline", icon: Calendar },
      { name: "Budget", href: "/budget", icon: DollarSign },
    ]
  },
  {
    title: "Planning",
    items: [
      { name: "Guest List", href: "/guests", icon: Users },
      { name: "Vendors", href: "/vendors", icon: Store },
      { name: "Schedules", href: "/schedules", icon: Clock },
      { name: "Inspiration", href: "/inspiration", icon: Palette },
    ]
  },
  {
    title: "Account",
    items: [
      { name: "Resources", href: "/resources", icon: Globe },
      { name: "Profile", href: "/profile", icon: User },
    ]
  }
];

export default function Header({ user, onLogout }: HeaderProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: intakeData } = useQuery({
    queryKey: ['/api/intake'],
    enabled: !!user,
  });

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!user,
  });

  // Prioritize Austin farmhouse wedding demo
  const currentProject = projects?.find(p => p.name === "Emma & Jake's Wedding") || projects?.[0];
  
  // For demo, use project data if intake data is not available
  const isDemo = user?.email === "demo@example.com";
  const partner1Name = intakeData?.partner1FirstName || (isDemo && currentProject?.name === "Emma & Jake's Wedding" ? "Emma" : "");
  const partner2Name = intakeData?.partner2FirstName || (isDemo && currentProject?.name === "Emma & Jake's Wedding" ? "Jake" : "");
  const weddingDate = intakeData?.weddingDate || (isDemo ? currentProject?.date : "");

  const coupleInitials = getCoupleInitials(partner1Name, partner2Name);
  const coupleNames = getCoupleNames(partner1Name, partner2Name);
  const daysUntilWedding = calculateDaysUntilWedding(weddingDate);

  return (
    <>
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile/Desktop Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-50"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {/* Desktop Quick Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationSections[0].items.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                      isActive 
                        ? "bg-blush text-white" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    )}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 truncate">
                {coupleNames ? `Welcome back, ${coupleNames}!` : 'Welcome to Gatherly!'}
              </h1>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm truncate">
                {daysUntilWedding 
                  ? `${daysUntilWedding} days until your special day`
                  : coupleNames 
                    ? 'Let\'s plan your dream wedding!'
                    : 'Complete your intake form to get started'
                }
              </p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-3">
              <SmartNotifications />
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="hidden sm:block px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-50"
                >
                  Logout
                </button>
              )}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 gradient-blush-rose rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{coupleInitials}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Full Navigation Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-0 left-0 right-0 bg-white shadow-lg max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 gradient-blush-rose rounded-xl flex items-center justify-center">
                    <span className="text-white font-medium">{coupleInitials}</span>
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-gray-800">Gatherly</h2>
                    <p className="text-xs text-gray-500">AI Wedding Planning</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <nav className="p-6">
              {navigationSections.map((section) => (
                <div key={section.title} className="mb-8">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    {section.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.href;
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            "flex flex-col items-center p-4 rounded-lg transition-colors text-center space-y-2 touch-manipulation",
                            isActive 
                              ? "gradient-blush-rose text-white" 
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-800 active:bg-gray-100"
                          )}
                        >
                          <Icon size={24} />
                          <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {onLogout && (
                <div className="pt-6 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      onLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
