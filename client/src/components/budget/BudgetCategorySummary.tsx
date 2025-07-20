import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface Category {
  category: string;
  estimated: number;
  actual: number;
  items: number;
}

interface BudgetCategorySummaryProps {
  categories: Category[];
  totalBudget: number;
  totalSpent: number;
}

export default function BudgetCategorySummary({ 
  categories, 
  totalBudget, 
  totalSpent 
}: BudgetCategorySummaryProps) {
  const formatCurrency = (amount: number | undefined | null) => {
    const safeAmount = parseFloat(String(amount)) || 0;
    if (isNaN(safeAmount)) return '$0';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  };

  const getProgressPercentage = (spent: number, budget: number) => {
    const safeSpent = parseFloat(String(spent)) || 0;
    const safeBudget = parseFloat(String(budget)) || 0;
    if (safeBudget === 0) return 0;
    return Math.min((safeSpent / safeBudget) * 100, 100);
  };

  const getProgressColor = (spent: number, budget: number) => {
    const safeSpent = parseFloat(String(spent)) || 0;
    const safeBudget = parseFloat(String(budget)) || 0;
    if (safeBudget === 0) return "bg-gray-500";
    const percentage = (safeSpent / safeBudget) * 100;
    if (percentage > 100) return "bg-red-500";
    if (percentage > 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const safeTotalSpent = parseFloat(String(totalSpent)) || 0;
  const safeTotalBudget = parseFloat(String(totalBudget)) || 0;
  const overallProgress = getProgressPercentage(safeTotalSpent, safeTotalBudget);
  const isOverBudget = safeTotalSpent > safeTotalBudget;

  return (
    <div className="space-y-6">
      {/* Overall Budget Summary */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Overall Budget Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Budget:</span>
              <span className="font-bold text-lg">{formatCurrency(safeTotalBudget)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Spent:</span>
              <span className={`font-bold text-lg ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(safeTotalSpent)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {isOverBudget ? 'Over Budget:' : 'Remaining:'}
              </span>
              <div className="flex items-center gap-2">
                {isOverBudget ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                )}
                <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(Math.abs(safeTotalBudget - safeTotalSpent))}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress 
                value={overallProgress} 
                className="h-3"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const categoryProgress = getProgressPercentage(category.actual, category.estimated);
          const isOverCategory = category.actual > category.estimated;
          
          return (
            <Card key={category.category} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg capitalize flex items-center justify-between">
                  {category.category}
                  <span className="text-sm font-normal text-gray-500">
                    {category.items} item{category.items !== 1 ? 's' : ''}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated:</span>
                  <span className="font-medium">{formatCurrency(category.estimated)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Actual:</span>
                  <span className={`font-medium ${isOverCategory ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(category.actual)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {isOverCategory ? 'Over:' : 'Under:'}
                  </span>
                  <span className={`font-medium ${isOverCategory ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(category.estimated - category.actual))}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Spent</span>
                    <span>{Math.round(categoryProgress)}%</span>
                  </div>
                  <Progress 
                    value={categoryProgress} 
                    className="h-2"
                  />
                </div>
                
                {/* Budget allocation percentage */}
                <div className="text-xs text-gray-500 pt-1 border-t">
                  {((category.estimated / totalBudget) * 100).toFixed(1)}% of total budget
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No budget categories yet</h3>
            <p className="text-gray-600">
              Add budget items to see your category breakdown and spending analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}