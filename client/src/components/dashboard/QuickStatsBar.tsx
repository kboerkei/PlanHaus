import { Calendar, CheckCircle, Users, DollarSign, Clock, TrendingUp } from "lucide-react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";

interface QuickStatsBarProps {
  stats?: {
    tasks?: { total: number; completed: number };
    guests?: { total: number; confirmed: number };
    budget?: { total: number; spent: number };
    daysUntilWedding?: number;
  };
  weddingDate?: string;
  className?: string;
}

export function QuickStatsBar({ stats, weddingDate, className }: QuickStatsBarProps) {
  // Add safety checks for undefined stats
  const safeStats = {
    tasks: stats?.tasks || { total: 0, completed: 0 },
    guests: stats?.guests || { total: 0, confirmed: 0 },
    budget: stats?.budget || { total: 0, spent: 0 }
  };

  const taskProgress = safeStats.tasks.total > 0 ? (safeStats.tasks.completed / safeStats.tasks.total) * 100 : 0;
  const guestProgress = safeStats.guests.total > 0 ? (safeStats.guests.confirmed / safeStats.guests.total) * 100 : 0;
  const budgetProgress = safeStats.budget.total > 0 ? (safeStats.budget.spent / safeStats.budget.total) * 100 : 0;
  
  const daysRemaining = weddingDate ? differenceInDays(new Date(weddingDate), new Date()) : null;
  
  const statCards = [
    {
      icon: Calendar,
      title: "Days to Wedding",
      value: daysRemaining !== null ? (daysRemaining > 0 ? daysRemaining : "Today!") : "—",
      subtitle: weddingDate ? format(new Date(weddingDate), "MMM dd, yyyy") : "",
      color: "rose",
      progress: null
    },
    {
      icon: CheckCircle,
      title: "Tasks Complete",
      value: `${safeStats.tasks.completed}/${safeStats.tasks.total}`,
      subtitle: `${taskProgress.toFixed(0)}% done`,
      color: "green",
      progress: taskProgress
    },
    {
      icon: Users,
      title: "RSVPs Confirmed",
      value: `${safeStats.guests.confirmed}/${safeStats.guests.total}`,
      subtitle: `${guestProgress.toFixed(0)}% confirmed`,
      color: "blue",
      progress: guestProgress
    },
    {
      icon: DollarSign,
      title: "Budget Used",
      value: `$${safeStats.budget.spent.toLocaleString()}`,
      subtitle: `of $${safeStats.budget.total.toLocaleString()}`,
      color: budgetProgress > 90 ? "red" : budgetProgress > 70 ? "yellow" : "green",
      progress: budgetProgress
    }
  ];

  const colorClasses = {
    rose: {
      icon: "text-rose-600 bg-rose-100",
      progress: "bg-rose-500",
      text: "text-rose-700"
    },
    green: {
      icon: "text-green-600 bg-green-100", 
      progress: "bg-green-500",
      text: "text-green-700"
    },
    blue: {
      icon: "text-blue-600 bg-blue-100",
      progress: "bg-blue-500", 
      text: "text-blue-700"
    },
    yellow: {
      icon: "text-yellow-600 bg-yellow-100",
      progress: "bg-yellow-500",
      text: "text-yellow-700"
    },
    red: {
      icon: "text-red-600 bg-red-100",
      progress: "bg-red-500", 
      text: "text-red-700"
    }
  };

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {statCards.map((stat, index) => {
        const colors = colorClasses[stat.color as keyof typeof colorClasses];
        const Icon = stat.icon;
        
        return (
          <Card
            key={index}
            className="relative overflow-hidden p-4 border border-rose-100 shadow-elegant bg-gradient-to-br from-white to-rose-50/30 hover:shadow-lg hover:border-rose-200 transition-all duration-200"
            data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn("p-1.5 rounded-md", colors.icon)}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-medium text-neutral-600">
                    {stat.title}
                  </span>
                </div>
                
                <div className="mb-1">
                  <span className="text-lg font-bold text-neutral-900">
                    {stat.value}
                  </span>
                </div>
                
                {stat.subtitle && (
                  <p className={cn("text-xs", colors.text)}>
                    {stat.subtitle}
                  </p>
                )}
              </div>
              
              {stat.progress !== null && (
                <div className="ml-2">
                  <div className="flex items-center justify-center w-8 h-8">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-neutral-200"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="8"
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 8}`}
                        strokeDashoffset={`${2 * Math.PI * 8 * (1 - stat.progress / 100)}`}
                        className={colors.progress}
                        style={{ transition: "stroke-dashoffset 0.5s ease" }}
                      />
                    </svg>
                    <span className={cn("absolute text-[10px] font-medium", colors.text)}>
                      {Math.round(stat.progress)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}