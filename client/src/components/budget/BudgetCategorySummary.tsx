import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react";
import BudgetEntryDialog from "./BudgetEntryDialog";
import { useDeleteBudgetItem, useBudget } from "@/hooks/useBudget";
import { useToast } from "@/hooks/use-toast";

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
  budgetItems: any[];
  projectId: string;
}

export default function BudgetCategorySummary({ 
  categories, 
  totalBudget, 
  totalSpent,
  budgetItems = [],
  projectId
}: BudgetCategorySummaryProps) {
  // Re-fetch the budget items directly in this component to ensure we have data
  const { data: freshBudgetItems } = useBudget(projectId);
  const actualBudgetItems = freshBudgetItems || budgetItems || [];
  
  console.log('BudgetCategorySummary Debug:');
  console.log('- projectId:', projectId);
  console.log('- freshBudgetItems length:', freshBudgetItems?.length);
  console.log('- passed budgetItems length:', budgetItems?.length);
  console.log('- actualBudgetItems length:', actualBudgetItems?.length);
  console.log('- categories length:', categories?.length);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const deleteBudgetItem = useDeleteBudgetItem(projectId);
  

  

  


  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryItems = (category: string) => {
    if (!actualBudgetItems || !Array.isArray(actualBudgetItems)) {
      return [];
    }
    
    // The issue is category case mismatch - categories are mixed case (Venue, Photography) vs lowercase (catering)
    // Let's try both exact match and lowercase match
    const exactMatch = actualBudgetItems.filter(item => 
      item && item.category && item.category === category
    );
    
    if (exactMatch.length > 0) {
      return exactMatch;
    }
    
    // Fallback to case-insensitive match
    return actualBudgetItems.filter(item => 
      item && 
      item.category && 
      item.category.toLowerCase() === category.toLowerCase()
    );
  };
  


  const handleDeleteItem = async (itemId: number) => {
    if (window.confirm(`Are you sure you want to delete this budget item?`)) {
      try {
        await deleteBudgetItem.mutateAsync(itemId);
        toast({ title: "Budget item deleted successfully!" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete budget item",
          variant: "destructive"
        });
      }
    }
  };
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

  // Early return if no categories
  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <DollarSign className="mx-auto mb-4 w-16 h-16 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No budget categories yet</h3>
          <p className="text-gray-600 mb-4">
            Add budget items to see your category breakdown and spending analysis.
          </p>
          <BudgetEntryDialog projectId={projectId} />
        </CardContent>
      </Card>
    );
  }

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {categories.map((category) => {
          const categoryProgress = getProgressPercentage(category.actual, category.estimated);
          const isOverCategory = category.actual > category.estimated;
          const isExpanded = expandedCategories.has(category.category);
          const categoryItems = getCategoryItems(category.category);
          

          
          return (
            <Card key={category.category} className="hover:shadow-md transition-shadow">
              <CardHeader 
                className="pb-3 cursor-pointer" 
                onClick={() => toggleCategory(category.category)}
              >
                <CardTitle className="text-lg capitalize flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    {category.category}
                  </div>
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

                {/* Expanded Items */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Individual Items:</h4>
                    {categoryItems.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No items found for this category</p>
                    ) : (
                      categoryItems.map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">{item.item}</h5>
                          <div className="flex gap-1">
                            <BudgetEntryDialog
                              projectId={projectId}
                              budgetItem={item}
                              trigger={
                                <Button variant="ghost" size="sm" className="p-1">
                                  <Edit className="w-3 h-3" />
                                </Button>
                              }
                            />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-1 hover:bg-red-50"
                              onClick={() => handleDeleteItem(item.id, item.item)}
                              disabled={deleteBudgetItem.isPending}
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estimated:</span>
                            <span className="font-medium">{formatCurrency(parseFloat(item.estimatedCost) || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Actual:</span>
                            <span className="font-medium">{formatCurrency(parseFloat(item.actualCost) || 0)}</span>
                          </div>
                        </div>
                        
                        {item.vendor && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-600">Vendor:</span>
                            <Badge variant="outline" className="text-xs">{item.vendor}</Badge>
                          </div>
                        )}
                        
                        {item.isPaid && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            Paid
                          </Badge>
                        )}
                        
                        {item.notes && (
                          <p className="text-xs text-gray-600 italic">{item.notes}</p>
                        )}
                      </div>
                      ))
                    )}
                  </div>
                )}
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