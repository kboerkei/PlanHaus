import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";
import { 
  Menu, 
  X, 
  Calendar, 
  DollarSign, 
  Users, 
  Store, 
  Palette, 
  Bot, 
  Clock, 
  Heart,
  Home,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "Planning",
    items: [
      { 
        href: "/", 
        label: "Dashboard", 
        icon: <Home className="h-4 w-4" />,
        description: "Overview of your wedding plans"
      },
      { 
        href: "/timeline", 
        label: "Timeline", 
        icon: <Calendar className="h-4 w-4" />,
        description: "Wedding planning timeline"
      },
      { 
        href: "/budget", 
        label: "Budget", 
        icon: <DollarSign className="h-4 w-4" />,
        description: "Track expenses and costs"
      },
      { 
        href: "/guests", 
        label: "Guests", 
        icon: <Users className="h-4 w-4" />,
        description: "Manage your guest list"
      },
      { 
        href: "/vendors", 
        label: "Vendors", 
        icon: <Store className="h-4 w-4" />,
        description: "Find and manage vendors"
      },
    ]
  },
  {
    title: "Creative & Support",
    items: [
      { 
        href: "/inspiration", 
        label: "Inspiration", 
        icon: <Palette className="h-4 w-4" />,
        description: "Save ideas and inspiration"
      },
      { 
        href: "/schedules", 
        label: "Schedules", 
        icon: <Clock className="h-4 w-4" />,
        description: "Plan your wedding day"
      },
      { 
        href: "/ai-assistant", 
        label: "AI Assistant", 
        icon: <Bot className="h-4 w-4" />,
        description: "Get personalized advice",
        badge: "New"
      },
    ]
  }
];

// Desktop Sidebar Navigation
interface SidebarProps {
  className?: string;
}

export const Sidebar = memo(({ className }: SidebarProps) => {
  const [location] = useLocation();
  
  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40",
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-blush to-rose-gold rounded-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blush transition-colors">
                PlanHaus
              </h1>
              <p className="text-xs text-muted-foreground">
                Your wedding, simplified
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6">
          {navigationSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <li key={item.href}>
                      <Link href={item.href}>
                        <motion.div
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                            isActive 
                              ? "bg-blush/10 text-blush" 
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                          )}
                        >
                          <div className={cn(
                            "transition-colors duration-200",
                            isActive ? "text-blush" : "text-muted-foreground group-hover:text-current"
                          )}>
                            {item.icon}
                          </div>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-blush text-white rounded">
                              {item.badge}
                            </span>
                          )}
                          {isActive && (
                            <motion.div
                              layoutId="sidebar-indicator"
                              className="absolute left-0 top-0 bottom-0 w-0.5 bg-blush rounded-r"
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                        </motion.div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-muted-foreground text-center">
            Made with <Heart className="h-3 w-3 inline text-red-500" /> for your special day
          </div>
        </div>
      </div>
    </motion.aside>
  );
});

Sidebar.displayName = "Sidebar";

// Mobile Navigation
interface MobileNavProps {
  className?: string;
}

export const MobileNav = memo(({ className }: MobileNavProps) => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile nav when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <div className={cn("lg:hidden", className)}>
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blush to-rose-gold rounded-lg">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="font-serif text-lg font-semibold text-gray-900 dark:text-white">
              PlanHaus
            </span>
          </Link>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                {/* Mobile Nav Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blush to-rose-gold rounded-lg">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-semibold text-gray-900 dark:text-white">
                        PlanHaus
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Your wedding, simplified
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 p-4 space-y-6">
                  {navigationSections.map((section) => (
                    <div key={section.title}>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        {section.title}
                      </h3>
                      <ul className="space-y-2">
                        {section.items.map((item) => {
                          const isActive = location === item.href;
                          return (
                            <li key={item.href}>
                              <Link href={item.href}>
                                <div className={cn(
                                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                  isActive 
                                    ? "bg-blush/10 text-blush" 
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                )}>
                                  <div className={cn(
                                    "transition-colors duration-200",
                                    isActive ? "text-blush" : "text-muted-foreground"
                                  )}>
                                    {item.icon}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{item.label}</span>
                                      {item.badge && (
                                        <span className="px-1.5 py-0.5 text-xs font-medium bg-blush text-white rounded">
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                    {item.description && (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </nav>

                {/* Mobile Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="text-xs text-muted-foreground text-center">
                    Made with <Heart className="h-3 w-3 inline text-red-500" /> for your special day
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  );
});

MobileNav.displayName = "MobileNav";

// Breadcrumb Navigation
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = memo(({ items, className }: BreadcrumbProps) => (
  <nav className={cn("flex items-center space-x-2 text-sm", className)}>
    <Link href="/" className="text-muted-foreground hover:text-current transition-colors">
      <Home className="h-4 w-4" />
    </Link>
    {items.map((item, index) => (
      <div key={index} className="flex items-center space-x-2">
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        {item.href ? (
          <Link href={item.href} className="text-muted-foreground hover:text-current transition-colors">
            {item.label}
          </Link>
        ) : (
          <span className="font-medium text-current">{item.label}</span>
        )}
      </div>
    ))}
  </nav>
));

Breadcrumb.displayName = "Breadcrumb";