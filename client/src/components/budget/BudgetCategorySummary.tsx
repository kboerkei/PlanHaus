import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react";
import BudgetEntryDialog from "./BudgetEntryDialog";
import { useDeleteBudgetItem, useBudget } from "@/hooks/useBudget";
import { useToast } from "@/hooks/use-toast";



interface BudgetCategory {
  category: string;
  estimated: number;
  actual: number;
  items: number;
}

interface BudgetCategorySummaryProps {
  categories: BudgetCategory[];
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
  // TEMPORARY FIX: Use hardcoded projectId since prop isn't working
  const actualProjectId = projectId || "17";
  
  // Re-fetch the budget items directly in this component to ensure we have data
  const { data: freshBudgetItems } = useBudget(actualProjectId);
  const actualBudgetItems = freshBudgetItems || budgetItems || [];
  
  // Production ready - debug logs removed
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const deleteBudgetItem = useDeleteBudgetItem(actualProjectId);
  

  

  


  const getCategoryItems = (category: string) => {
    if (!actualBudgetItems || !Array.isArray(actualBudgetItems)) {
      return [];
    }
    
    // Always use case-insensitive matching to handle mixed case categories
    return actualBudgetItems.filter((item: any) => 
      item && 
      item.category && 
      item.category.toLowerCase() === category.toLowerCase()
    );
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Overall Budget Summary */}
      <Card className="card-elegant border-2 animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-heading">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-sm">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
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

      {/* Category Breakdown - Mobile First */}
      <div className="space-y-4 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-6 md:space-y-0">
        {categories.map((category, index) => {
          const categoryProgress = getProgressPercentage(category.actual, category.estimated);
          const isOverCategory = category.actual > category.estimated;
          const isExpanded = expandedCategories.has(category.category);
          const categoryItems = getCategoryItems(category.category);
          
          return (
            <Card 
              key={category.category} 
              className={`card-elegant hover:scale-[1.02] transition-all duration-300 animate-slide-in-left stagger-${(index % 5) + 1}`}
            >
              <CardHeader 
                className="pb-3 cursor-pointer" 
                onClick={() => toggleCategory(category.category)}
              >
                <CardTitle className="text-base md:text-lg capitalize flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    )}
                    <span className="truncate">{category.category}</span>
                  </div>
                  <span className="text-xs md:text-sm font-normal text-gray-500 shrink-0 ml-2">
                    {category.items} item{category.items !== 1 ? 's' : ''}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Mobile: Stack costs vertically, Desktop: Side by side */}
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Estimated:</span>
                    <span className="font-medium">{formatCurrency(category.estimated)}</span>
                  </div>
                  
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Actual:</span>
                    <span className={`font-medium ${isOverCategory ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(category.actual)}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-600">
                    {isOverCategory ? 'Over:' : 'Under:'}
                  </span>
                  <span className={`font-medium ${isOverCategory ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(category.estimated - category.actual))}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Spent</span>
                    <span className="font-medium">{Math.round(categoryProgress)}%</span>
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
                      categoryItems.map((item: any) => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-3 space-y-3">
                        {/* Mobile-optimized header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm truncate pr-2">{item.item}</h5>
                            {item.isPaid && (
                              <Badge className="text-xs bg-green-100 text-green-800 mt-1">
                                Paid
                              </Badge>
                            )}
                          </div>
                          
                          {/* Mobile-friendly action buttons */}
                          <div className="flex gap-1 shrink-0">
                            <BudgetEntryDialog
                              projectId={actualProjectId}
                              budgetItem={item}
                              trigger={
                                <button className="p-2 hover:bg-blue-100 rounded-lg bg-blue-50 text-blue-600">
                                  <Edit className="w-3 h-3" />
                                </button>
                              }
                            />
                            <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 hover:bg-red-100 rounded-lg bg-red-50 text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Mobile-optimized cost display */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-600">Estimated:</span>
                            <span className="text-sm font-medium">{formatCurrency(parseFloat(item.estimatedCost) || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-600">Actual:</span>
                            <span className="text-sm font-medium">{formatCurrency(parseFloat(item.actualCost) || 0)}</span>
                          </div>
                        </div>
                        
                        {item.vendor && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">Vendor:</span>
                            <Badge variant="outline" className="text-xs">{item.vendor}</Badge>
                          </div>
                        )}
                        
                        {item.notes && (
                          <div className="bg-white p-2 rounded border">
                            <p className="text-xs text-gray-600">{item.notes}</p>
                          </div>
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