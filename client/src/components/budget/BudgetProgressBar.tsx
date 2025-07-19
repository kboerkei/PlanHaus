import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";

interface BudgetProgressBarProps {
  category: string;
  estimated: number;
  actual: number;
  remaining: number;
  className?: string;
}

export default function BudgetProgressBar({ 
  category, 
  estimated, 
  actual, 
  remaining,
  className = "" 
}: BudgetProgressBarProps) {
  const percentage = estimated > 0 ? Math.min((actual / estimated) * 100, 100) : 0;
  const isOverBudget = actual > estimated;
  const isNearLimit = percentage > 80 && !isOverBudget;

  const getProgressColor = () => {
    if (isOverBudget) return "bg-red-500";
    if (isNearLimit) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusIcon = () => {
    if (isOverBudget) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (isNearLimit) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-green-500" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className={`transition-all hover:shadow-md ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span className="capitalize">{category}</span>
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Spent: {formatCurrency(actual)}</span>
            <span>Budget: {formatCurrency(estimated)}</span>
          </div>
          <Progress 
            value={percentage} 
            className="h-2"
            indicatorClassName={getProgressColor()}
          />
          <div className="text-xs text-gray-500 text-center">
            {percentage.toFixed(1)}% of budget used
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-gray-400" />
              <span className="text-gray-600">Remaining</span>
            </div>
            <div className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(Math.abs(remaining))}
              {remaining < 0 && " over"}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-gray-600">Status</div>
            <div className={`font-medium text-xs ${
              isOverBudget ? 'text-red-600' : 
              isNearLimit ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {isOverBudget ? 'Over Budget' : 
               isNearLimit ? 'Near Limit' : 
               'On Track'}
            </div>
          </div>
        </div>

        {isOverBudget && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <div className="flex items-center gap-2 text-red-800 text-xs">
              <AlertTriangle className="w-3 h-3" />
              <span>Over budget by {formatCurrency(actual - estimated)}</span>
            </div>
          </div>
        )}

        {isNearLimit && !isOverBudget && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
            <div className="flex items-center gap-2 text-yellow-800 text-xs">
              <AlertTriangle className="w-3 h-3" />
              <span>Approaching budget limit</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}