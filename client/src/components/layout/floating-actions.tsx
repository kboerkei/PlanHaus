import { useState } from "react";
import { Link } from "wouter";
import { Plus, Calendar, DollarSign, Users, Store, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      icon: Calendar,
      label: "Add Task",
      href: "/timeline",
      color: "bg-blue-500 hover:bg-blue-600",
      textColor: "text-blue-600"
    },
    {
      icon: DollarSign,
      label: "Add Expense",
      href: "/budget",
      color: "bg-green-500 hover:bg-green-600",
      textColor: "text-green-600"
    },
    {
      icon: Users,
      label: "Add Guest",
      href: "/guests",
      color: "bg-purple-500 hover:bg-purple-600",
      textColor: "text-purple-600"
    },
    {
      icon: Store,
      label: "Find Vendor",
      href: "/vendors",
      color: "bg-orange-500 hover:bg-orange-600",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Action buttons */}
      <div className={cn(
        "flex flex-col space-y-3 mb-4 transition-all duration-300",
        isOpen ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4 pointer-events-none"
      )}>
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={action.label}
              className="flex items-center space-x-3 group"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div className={cn(
                "bg-white px-3 py-2 rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                "whitespace-nowrap text-sm font-medium",
                action.textColor
              )}>
                {action.label}
              </div>
              <Link href={action.href}>
                <Button
                  size="sm"
                  className={cn(
                    "w-12 h-12 rounded-full shadow-lg border-2 border-white",
                    "transform hover:scale-110 transition-all duration-200",
                    action.color
                  )}
                  onClick={() => setIsOpen(false)}
                  aria-label={action.label}
                >
                  <Icon size={20} className="text-white" />
                </Button>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Main FAB */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-xl",
          "gradient-blush-rose border-2 border-white",
          "transform transition-all duration-300 hover:scale-110",
          isOpen && "rotate-45"
        )}
        aria-label={isOpen ? "Close quick actions menu" : "Open quick actions menu"}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Plus size={24} className="text-white" />
        )}
      </Button>
    </div>
  );
}