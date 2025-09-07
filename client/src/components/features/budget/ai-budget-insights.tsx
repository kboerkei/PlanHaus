import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb, 
  Target,
  DollarSign,
  PieChart
} from "lucide-react";

interface BudgetInsight {
  type: 'warning' | 'suggestion' | 'milestone' | 'optimization';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  category?: string;
  amount?: number;
}

export default function AIBudgetInsights() {
  const [insights, setInsights] = useState<BudgetInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ['/api/projects'],
    enabled: true,
  });

  const currentProject = projects.find((p: any) => p.name === "Emma & Jake's Wedding") || projects[0];

  const { data: budgetItems = [] } = useQuery<any[]>({
    queryKey: ['/api/projects', currentProject?.id, 'budget'],
    enabled: !!currentProject?.id,
  });

  const { data: dashboardStats } = useQuery<any>({
    queryKey: ['/api/dashboard/stats'],
    enabled: true,
  });

  useEffect(() => {
    if (!budgetItems || !dashboardStats || !currentProject) return;

    // Generate AI-powered insights based on budget data
    const newInsights: BudgetInsight[] = [];

    const totalBudget = parseFloat(currentProject.budget) || 0;
    const totalSpent = budgetItems.reduce((sum: number, item: any) => 
      sum + (parseFloat(item.actualCost) || 0), 0);
    const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Budget usage warnings
    if (spentPercentage > 90) {
      newInsights.push({
        type: 'warning',
        title: 'Budget Limit Approaching',
        description: `You've used ${spentPercentage.toFixed(1)}% of your budget. Consider adjusting remaining expenses.`,
        priority: 'high',
        actionable: true,
        amount: totalBudget - totalSpent
      });
    } else if (spentPercentage > 75) {
      newInsights.push({
        type: 'warning',
        title: 'Budget Watch Zone',
        description: `Monitor spending closely. ${(100 - spentPercentage).toFixed(1)}% budget remaining.`,
        priority: 'medium',
        actionable: true,
        amount: totalBudget - totalSpent
      });
    }

    // Category analysis
    const categorySpending = budgetItems.reduce((acc: any, item: any) => {
      if (!acc[item.category]) acc[item.category] = 0;
      acc[item.category] += parseFloat(item.actualCost) || 0;
      return acc;
    }, {});

    const sortedCategories = Object.entries(categorySpending)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);

    if (sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      newInsights.push({
        type: 'suggestion',
        title: 'Top Spending Category',
        description: `${topCategory} accounts for $${(topAmount as number).toLocaleString()} of your budget. Consider if this allocation aligns with your priorities.`,
        priority: 'medium',
        actionable: true,
        category: topCategory as string,
        amount: topAmount as number
      });
    }

    // Vendor optimization
    const unpaidItems = budgetItems.filter((item: any) => !item.isPaid && item.actualCost > 0);
    if (unpaidItems.length > 0) {
      const unpaidTotal = unpaidItems.reduce((sum: number, item: any) => 
        sum + parseFloat(item.actualCost), 0);
      newInsights.push({
        type: 'optimization',
        title: 'Payment Optimization',
        description: `You have $${unpaidTotal.toLocaleString()} in unpaid vendor costs. Consider negotiating payment plans or early payment discounts.`,
        priority: 'medium',
        actionable: true,
        amount: unpaidTotal
      });
    }

    // Milestone celebrations
    if (spentPercentage >= 25 && spentPercentage < 30) {
      newInsights.push({
        type: 'milestone',
        title: 'Quarter Budget Milestone',
        description: 'Great progress! You\'ve allocated 25% of your budget efficiently.',
        priority: 'low',
        actionable: false
      });
    }

    // Smart recommendations based on Austin wedding data
    if (currentProject.name === "Emma & Jake's Wedding") {
      newInsights.push({
        type: 'suggestion',
        title: 'Austin Wedding Tip',
        description: 'Consider booking local Austin food trucks for late-night snacks - typically 30% less than traditional catering add-ons.',
        priority: 'low',
        actionable: true,
        category: 'Catering'
      });
    }

    setInsights(newInsights);
  }, [budgetItems, dashboardStats, currentProject]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'suggestion': return Lightbulb;
      case 'milestone': return CheckCircle;
      case 'optimization': return Target;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (type === 'warning') return 'border-red-200 bg-red-50';
    if (type === 'milestone') return 'border-green-200 bg-green-50';
    if (priority === 'high') return 'border-orange-200 bg-orange-50';
    return 'border-blue-200 bg-blue-50';
  };

  if (!budgetItems || insights.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>AI Budget Insights</span>
          <Badge variant="outline" className="ml-2">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            return (
              <Card key={index} className={getInsightColor(insight.type, insight.priority)}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-800">{insight.title}</h4>
                        <Badge 
                          variant={insight.priority === 'high' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                      {insight.amount && (
                        <div className="flex items-center space-x-2 text-sm">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">${insight.amount.toLocaleString()}</span>
                        </div>
                      )}
                      {insight.actionable && (
                        <Button size="sm" variant="outline" className="text-xs mt-2">
                          Take Action
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {isGenerating && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Generating insights...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}