import React from "react";
import { Calendar, DollarSign, CheckSquare, TrendingUp, TrendingDown, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, isAfter, addDays, startOfWeek, endOfWeek, isSameWeek } from "date-fns";

interface QuickStatsData {
  weddingDate: string;
  totalBudget: number;
  spentBudget: number;
  totalTasks: number;
  completedTasks: number;
  tasks: Array<{
    id: number;
    title: string;
    dueDate?: string;
    isCompleted: boolean;
    priority: 'low' | 'medium' | 'high';
  }>;
}

interface QuickStatsBarProps {
  data: QuickStatsData;
  className?: string;
}

export function QuickStatsBar({ data, className }: QuickStatsBarProps) {
  const weddingDate = new Date(data.weddingDate);
  const today = new Date();
  const daysUntilWedding = differenceInDays(weddingDate, today);
  const isPastDue = daysUntilWedding < 0;
  
  // Budget calculations
  const budgetRemaining = data.totalBudget - data.spentBudget;
  const budgetPercentage = data.totalBudget > 0 ? (data.spentBudget / data.totalBudget) * 100 : 0;
  const isOverBudget = budgetRemaining < 0;
  
  // Task calculations
  const taskCompletionRate = data.totalTasks > 0 ? (data.completedTasks / data.totalTasks) * 100 : 0;
  
  // Tasks due this week
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const tasksThisWeek = data.tasks.filter(task => {
    if (!task.dueDate || task.isCompleted) return false;
    const taskDate = new Date(task.dueDate);
    return isSameWeek(taskDate, today);
  });
  
  // Overdue tasks
  const overdueTasks = data.tasks.filter(task => {
    if (!task.dueDate || task.isCompleted) return false;
    const taskDate = new Date(task.dueDate);
    return isAfter(today, taskDate);
  });

  const stats = [
    {
      id: "countdown",
      icon: Calendar,
      label: "Days to Wedding",
      value: isPastDue ? "Past Due" : Math.abs(daysUntilWedding).toString(),
      subtext: isPastDue 
        ? `${Math.abs(daysUntilWedding)} days ago`
        : format(weddingDate, "MMMM do, yyyy"),
      trend: isPastDue ? "down" : daysUntilWedding <= 30 ? "alert" : "neutral",
      urgent: daysUntilWedding <= 7 && !isPastDue,
    },
    {
      id: "budget",
      icon: DollarSign,
      label: "Budget Remaining",
      value: isOverBudget 
        ? `$${Math.abs(budgetRemaining).toLocaleString()}`
        : `$${budgetRemaining.toLocaleString()}`,
      subtext: `${budgetPercentage.toFixed(1)}% used`,
      trend: isOverBudget ? "down" : budgetPercentage > 80 ? "alert" : "up",
      urgent: isOverBudget,
      prefix: isOverBudget ? "Over by " : "",
    },
    {
      id: "tasks",
      label: "Tasks Complete",
      icon: CheckSquare,
      value: `${data.completedTasks}/${data.totalTasks}`,
      subtext: `${taskCompletionRate.toFixed(1)}% complete`,
      trend: taskCompletionRate >= 75 ? "up" : taskCompletionRate >= 50 ? "neutral" : "down",
      urgent: false,
    },
    {
      id: "weekly",
      icon: Clock,
      label: "Due This Week",
      value: tasksThisWeek.length.toString(),
      subtext: overdueTasks.length > 0 
        ? `${overdueTasks.length} overdue`
        : "On track",
      trend: overdueTasks.length > 0 ? "down" : tasksThisWeek.length <= 3 ? "up" : "alert",
      urgent: overdueTasks.length > 0,
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      case "alert":
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <Card 
            key={stat.id} 
            className={cn(
              "p-4 transition-all duration-200 hover:shadow-md",
              stat.urgent && "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "p-2 rounded-md",
                  stat.urgent 
                    ? "bg-red-100 dark:bg-red-900/30" 
                    : "bg-primary/10"
                )}>
                  <Icon className={cn(
                    "h-4 w-4",
                    stat.urgent ? "text-red-600 dark:text-red-400" : "text-primary"
                  )} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              
              {getTrendIcon(stat.trend)}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-baseline space-x-1">
                {stat.prefix && (
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {stat.prefix}
                  </span>
                )}
                <span className={cn(
                  "text-2xl font-bold",
                  stat.urgent 
                    ? "text-red-600 dark:text-red-400" 
                    : "text-foreground"
                )}>
                  {stat.value}
                </span>
              </div>
              
              <p className={cn(
                "text-xs",
                stat.urgent 
                  ? "text-red-600/80 dark:text-red-400/80" 
                  : "text-muted-foreground"
              )}>
                {stat.subtext}
              </p>
            </div>
            
            {stat.urgent && (
              <Badge 
                variant="destructive" 
                className="mt-2 text-xs"
              >
                Needs Attention
              </Badge>
            )}
          </Card>
        );
      })}
    </div>
  );
}