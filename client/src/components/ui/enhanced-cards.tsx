import { memo, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { MoreHorizontal, ArrowRight } from "lucide-react";

interface EnhancedCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  menu?: React.ReactNode;
}

export const EnhancedCard = memo(forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ 
    title, 
    subtitle, 
    badge, 
    badgeVariant = "default",
    children, 
    className, 
    hover = true, 
    onClick,
    action,
    menu
  }, ref) => {
    const cardContent = (
      <Card 
        ref={ref}
        className={cn(
          "relative transition-all duration-200",
          hover && "hover:shadow-lg hover:-translate-y-1",
          onClick && "cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        {(title || subtitle || badge || menu) && (
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                {title && (
                  <CardTitle className="text-lg font-medium leading-tight">
                    {title}
                  </CardTitle>
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {badge && (
                  <Badge variant={badgeVariant} className="shrink-0">
                    {badge}
                  </Badge>
                )}
                {menu && (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        )}
        
        <CardContent className={cn("pt-0", !title && !subtitle && "pt-6")}>
          {children}
        </CardContent>
        
        {action && (
          <div className="px-6 pb-6">
            <Button 
              variant={action.variant || "outline"} 
              onClick={action.onClick}
              className="w-full group"
            >
              {action.label}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        )}
      </Card>
    );

    if (hover && !onClick) {
      return (
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {cardContent}
        </motion.div>
      );
    }

    return cardContent;
  }
));

EnhancedCard.displayName = "EnhancedCard";

// Statistics Card with animations
interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export const StatCard = memo(({ 
  title, 
  value, 
  change, 
  icon, 
  className,
  loading = false 
}: StatCardProps) => {
  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("p-6 hover:shadow-md transition-shadow", className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <motion.p 
              className="text-2xl font-bold"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              {value}
            </motion.p>
            {change && (
              <div className={cn(
                "text-xs flex items-center gap-1",
                change.trend === "up" && "text-green-600",
                change.trend === "down" && "text-red-600",
                change.trend === "neutral" && "text-muted-foreground"
              )}>
                <span>{change.value}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="text-muted-foreground opacity-60">
              {icon}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
});

StatCard.displayName = "StatCard";

// Progress Card
interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  description?: string;
  color?: "default" | "wedding" | "success" | "warning";
  className?: string;
}

export const ProgressCard = memo(({ 
  title, 
  current, 
  total, 
  description,
  color = "default",
  className 
}: ProgressCardProps) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  const colorClasses = {
    default: "bg-primary",
    wedding: "bg-blush",
    success: "bg-green-500",
    warning: "bg-yellow-500"
  };

  return (
    <EnhancedCard title={title} subtitle={description} className={className}>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{current} of {total}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className={cn("h-2 rounded-full", colorClasses[color])}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        
        <div className="text-right">
          <motion.span 
            className="text-lg font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {Math.round(percentage)}%
          </motion.span>
        </div>
      </div>
    </EnhancedCard>
  );
});

ProgressCard.displayName = "ProgressCard";

// Action Card
interface ActionCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const ActionCard = memo(({ 
  title, 
  description, 
  icon, 
  primaryAction, 
  secondaryAction,
  className 
}: ActionCardProps) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <Card className={cn("p-6 hover:shadow-lg transition-shadow", className)}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="p-2 bg-blush/10 rounded-lg text-blush">
            {icon}
          </div>
        )}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {description}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={primaryAction.onClick} className="flex-1">
              {primaryAction.label}
            </Button>
            {secondaryAction && (
              <Button 
                variant="outline" 
                onClick={secondaryAction.onClick}
                className="flex-1"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
));

ActionCard.displayName = "ActionCard";