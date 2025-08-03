import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Sparkles, ChevronRight, Clock, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format, addDays, differenceInDays } from "date-fns";

interface NextStep {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  daysUntilDue?: number;
  estimatedTime?: string;
  actionUrl?: string;
}

interface AINextStepsPanelProps {
  projectId?: string;
  weddingDate?: string;
  className?: string;
}

const mockNextSteps: NextStep[] = [
  {
    id: '1',
    title: 'Book Wedding Venue',
    description: 'Secure your preferred venue as availability is limited for your wedding date.',
    priority: 'high',
    category: 'Venue',
    daysUntilDue: 7,
    estimatedTime: '2-3 hours',
    actionUrl: '/vendors'
  },
  {
    id: '2', 
    title: 'Send Save the Dates',
    description: 'Notify guests of your wedding date 6-8 months in advance.',
    priority: 'medium',
    category: 'Communication',
    daysUntilDue: 14,
    estimatedTime: '1 hour',
    actionUrl: '/guests'
  },
  {
    id: '3',
    title: 'Create Wedding Budget',
    description: 'Establish a detailed budget to guide all wedding decisions.',
    priority: 'high',
    category: 'Budget',
    daysUntilDue: 3,
    estimatedTime: '30 minutes',
    actionUrl: '/budget'
  }
];

export const AINextStepsPanel = memo(({ 
  projectId, 
  weddingDate, 
  className 
}: AINextStepsPanelProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // In a real implementation, this would fetch AI-generated recommendations
  const { data: nextSteps = mockNextSteps, isLoading, refetch } = useQuery({
    queryKey: ['ai-next-steps', projectId],
    queryFn: async () => {
      // Simulate AI recommendation generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockNextSteps.map(step => ({
        ...step,
        daysUntilDue: weddingDate ? 
          Math.max(1, Math.floor(Math.random() * 30)) : 
          step.daysUntilDue
      }));
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getPriorityIcon = (priority: NextStep['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'low':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const getPriorityVariant = (priority: NextStep['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI-Powered Next Steps
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={className}
    >
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 dark:from-purple-950/20 dark:to-pink-950/20 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI-Powered Next Steps
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Personalized recommendations based on your wedding timeline
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AnimatePresence>
              {nextSteps.slice(0, 3).map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-background/50 transition-all hover:bg-background hover:shadow-md">
                    <div className="flex-shrink-0 mt-1">
                      {getPriorityIcon(step.priority)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm leading-tight">
                          {step.title}
                        </h4>
                        <Badge variant={getPriorityVariant(step.priority)} className="text-xs">
                          {step.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {step.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {step.daysUntilDue && (
                            <span>Due in {step.daysUntilDue} days</span>
                          )}
                          {step.estimatedTime && (
                            <span>~{step.estimatedTime}</span>
                          )}
                        </div>
                        
                        {step.actionUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => window.location.href = step.actionUrl!}
                          >
                            Take Action
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {nextSteps.length > 3 && (
              <Button variant="outline" className="w-full" size="sm">
                View All Recommendations ({nextSteps.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

AINextStepsPanel.displayName = "AINextStepsPanel";