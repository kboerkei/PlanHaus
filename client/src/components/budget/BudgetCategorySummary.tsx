import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import BudgetProgressBar from "./BudgetProgressBar";

interface CategoryData {
  category: string;
  estimated: number;
  actual: number;
  items: number;
}

interface BudgetCategorySummaryProps {
  categories: CategoryData[];
  totalBudget: number;
  totalSpent: number;
  className?: string;
}

export default function BudgetCategorySummary({ 
  categories, 
  totalBudget, 
  totalSpent,
  className = "" 
}: BudgetCategorySummaryProps) {
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const sortedCategories = categories
    .filter(cat => cat.estimated > 0 || cat.actual > 0)
    .sort((a, b) => b.actual - a.actual);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Budget Summary */}
      <Card className="border-l-4 border-l-rose-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-rose-500" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Total Budget</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(totalBudget)}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Total Spent</div>
              <div className="text-lg font-semibold text-blue-600">
                {formatCurrency(totalSpent)}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Remaining</div>
              <div className={`text-lg font-semibold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(totalRemaining))}
                {totalRemaining < 0 && " over"}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  {overallPercentage.toFixed(1)}%
                </span>
                {overallPercentage > 100 ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Overall Budget Progress</span>
              <span>{overallPercentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.min(overallPercentage, 100)} 
              className="h-3"
              indicatorClassName={overallPercentage > 100 ? "bg-red-500" : "bg-rose-500"}
            />
          </div>

          {overallPercentage > 90 && (
            <div className={`p-3 rounded-lg border ${
              overallPercentage > 100 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                {overallPercentage > 100 
                  ? `Over budget by ${formatCurrency(totalSpent - totalBudget)}`
                  : 'Approaching budget limit'
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCategories.map((category) => (
            <BudgetProgressBar
              key={category.category}
              category={category.category}
              estimated={category.estimated}
              actual={category.actual}
              remaining={category.estimated - category.actual}
            />
          ))}
        </div>
      </div>

      {/* Category Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Category Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedCategories.map((category, index) => {
              const percentage = totalSpent > 0 ? (category.actual / totalSpent) * 100 : 0;
              
              return (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-rose-500 rounded-full" style={{
                      backgroundColor: `hsl(${(index * 45) % 360}, 70%, 60%)`
                    }} />
                    <span className="capitalize text-sm font-medium">
                      {category.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({category.items} items)
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatCurrency(category.actual)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}