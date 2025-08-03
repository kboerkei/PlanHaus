import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Progress } from "./progress";
import { Calendar, TrendingUp, TrendingDown, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface QuickStatsBarProps {
  weddingDate?: string;
  budgetRemaining?: number;
  totalBudget?: number;
  tasksDueThisWeek?: number;
  totalTasks?: number;
  completedTasks?: number;
}

export const QuickStatsBar = memo(({ 
  weddingDate, 
  budgetRemaining = 0, 
  totalBudget = 0,
  tasksDueThisWeek = 0,
  totalTasks = 0,
  completedTasks = 0
}: QuickStatsBarProps) => {
  const countdown = useMemo(() => {
    if (!weddingDate) return null;
    const days = differenceInDays(new Date(weddingDate), new Date());
    return days > 0 ? days : 0;
  }, [weddingDate]);

  const budgetProgress = totalBudget > 0 ? ((totalBudget - budgetRemaining) / totalBudget) * 100 : 0;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
    >
      {/* Wedding Countdown */}
      <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 dark:from-rose-950/20 dark:to-pink-950/20 dark:border-rose-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Days Until Wedding</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {countdown !== null ? countdown : '--'}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-rose-500" />
          </div>
        </CardContent>
      </Card>

      {/* Budget Remaining */}
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 dark:from-emerald-950/20 dark:to-green-950/20 dark:border-emerald-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Budget Remaining</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${budgetRemaining.toLocaleString()}
              </p>
              <Progress value={budgetProgress} className="mt-1 h-2" />
            </div>
            <DollarSign className="h-8 w-8 text-emerald-500" />
          </div>
        </CardContent>
      </Card>

      {/* Tasks Due This Week */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-950/20 dark:to-cyan-950/20 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tasks Due This Week</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {tasksDueThisWeek}
              </p>
              <Progress value={taskProgress} className="mt-1 h-2" />
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'neutral';
  value?: string;
  className?: string;
}

export const TrendIndicator = memo(({ trend, value, className }: TrendIndicatorProps) => {
  const getIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
    }
  };

  const getBadgeVariant = () => {
    switch (trend) {
      case 'up':
        return 'default';
      case 'down':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge variant={getBadgeVariant()} className={cn("gap-1", className)}>
      {getIcon()}
      {value && <span className="text-xs">{value}</span>}
    </Badge>
  );
});

interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  variant?: 'default' | 'wedding' | 'success' | 'warning';
}

export const ProgressCard = memo(({ 
  title, 
  current, 
  total, 
  trend = 'neutral',
  trendValue,
  icon: Icon,
  className,
  variant = 'default'
}: ProgressCardProps) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'wedding':
        return "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 dark:from-rose-950/20 dark:to-pink-950/20 dark:border-rose-800";
      case 'success':
        return "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 dark:from-emerald-950/20 dark:to-green-950/20 dark:border-emerald-800";
      case 'warning':
        return "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-950/20 dark:to-yellow-950/20 dark:border-amber-800";
      default:
        return "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-950/20 dark:to-cyan-950/20 dark:border-blue-800";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className={cn("cursor-pointer", className)}
    >
      <Card className={cn(
        "transition-all duration-300 hover:shadow-wedding-medium",
        getVariantStyles()
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
            <div className="flex items-center gap-2">
              <TrendIndicator trend={trend} value={trendValue} />
              {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{current}</span>
              <span className="text-lg text-muted-foreground">of {total}</span>
            </div>
            <Progress value={percentage} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {percentage.toFixed(1)}% complete
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

QuickStatsBar.displayName = "QuickStatsBar";
TrendIndicator.displayName = "TrendIndicator";
ProgressCard.displayName = "ProgressCard";