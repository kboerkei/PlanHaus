import { useState, useMemo, Suspense, memo } from "react";
import { useDebounce, usePerformanceMonitor } from "@/hooks/usePerformance";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/design-system";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DollarSign, PieChart, TrendingUp, TrendingDown, AlertTriangle, Filter, Target, CreditCard, Calendar, Download, RefreshCw } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useBudget, useBudgetSummary } from "@/hooks/useBudget";
import type { BudgetItem, BudgetCategory, BudgetSummary } from "@/types/budget";
import BudgetEntryDialog from "@/components/budget/BudgetEntryDialog";
import BudgetCategorySummary from "@/components/budget/BudgetCategorySummary";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ExportDialog from "@/components/export/ExportDialog";
// Lazy load charts for better performance
import { BudgetPieChart, BudgetBarChart } from "@/components/lazy/LazyBudgetCharts";
import { ChartSkeleton } from "@/components/ui/skeleton";
// Import missing Recharts components
import { 
  ResponsiveContainer, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";
import UnifiedPageLayout from "@/components/layout/UnifiedPageLayout";
import { UnifiedSection, UnifiedGrid, UnifiedCard } from "@/components/layout/UnifiedSection";

const categoryFilters = [
  { value: "all", label: "All Categories" },
  { value: "venue", label: "Venue" },
  { value: "catering", label: "Catering" },
  { value: "photography", label: "Photography" },
  { value: "flowers", label: "Flowers" },
  { value: "music", label: "Music" },
  { value: "attire", label: "Attire" },
  { value: "rings", label: "Rings" },
  { value: "transportation", label: "Transportation" },
  { value: "other", label: "Other" }
];

const Budget = memo(() => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showPaidOnly, setShowPaidOnly] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | undefined>(undefined);
  
  // Performance monitoring
  usePerformanceMonitor('Budget');
  
  // Debounce search input for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch data using hooks
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const currentProject = Array.isArray(projects) 
    ? projects.find((p: any) => p.name === "Emma & Jake's Wedding") || projects[0]
    : null;
  const projectId = currentProject?.id?.toString();
  
  const { data: budgetItems = [], isLoading: budgetLoading, error: budgetError } = useBudget(projectId);
  const budgetSummary = useBudgetSummary(projectId);

  // Filter logic with debounced search
  const filteredItems = useMemo(() => {
    if (!budgetItems) return [];
    
    return budgetItems.filter((item: BudgetItem) => {
      const matchesSearch = !debouncedSearchTerm || 
        item.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.notes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      const matchesPaid = !showPaidOnly || item.isPaid;
      
      return matchesSearch && matchesCategory && matchesPaid;
    });
  }, [budgetItems, debouncedSearchTerm, filterCategory, showPaidOnly]);

  // Calculate totals from filtered items
  const filteredTotals = useMemo(() => {
    return filteredItems.reduce((acc: { estimated: number; actual: number; paid: number }, item: BudgetItem) => {
      // Parse string values to numbers, handling both string and number types
      const estimatedCost = typeof item.estimatedCost === 'string' 
        ? parseFloat(item.estimatedCost) || 0 
        : (item.estimatedCost || 0);
      const actualCost = typeof item.actualCost === 'string' 
        ? parseFloat(item.actualCost) || 0 
        : (item.actualCost || 0);
      
      acc.estimated += estimatedCost;
      acc.actual += actualCost;
      if (item.isPaid) acc.paid += actualCost || estimatedCost;
      return acc;
    }, { estimated: 0, actual: 0, paid: 0 });
  }, [filteredItems]);

  const formatCurrency = (amount: number | string | undefined | null) => {
    // Handle string inputs and ensure proper number parsing
    let safeAmount = 0;
    
    if (typeof amount === 'string') {
      // Remove any non-numeric characters except decimal points
      const cleanString = amount.replace(/[^0-9.]/g, '');
      safeAmount = parseFloat(cleanString) || 0;
    } else if (typeof amount === 'number') {
      safeAmount = amount;
    } else {
      safeAmount = 0;
    }
    
    // Ensure the amount is a valid number and not excessively large
    if (isNaN(safeAmount) || !isFinite(safeAmount) || safeAmount > 1000000000) {
      safeAmount = 0;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  };

  // Loading and error states
  if (projectsLoading) {
    return <LoadingSpinner />;
  }

  if (projectsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load budget data</h3>
          <p className="text-muted-foreground mb-4">
            {projectsError instanceof Error ? projectsError.message : 'An unexpected error occurred'}
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600">
          <p>No wedding project found. Please create a project first.</p>
        </div>
      </div>
    );
  }

  return (
    <UnifiedPageLayout
      title="Budget Tracker"
      subtitle="Track your wedding expenses and stay on budget with our comprehensive budget management tools"
      animation="slideUp"
      headerBackground="gradient"
    >
      {/* Header Actions */}
      <UnifiedSection animation="fadeIn">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <ExportDialog
              projectId={projectId}
              projectName={currentProject?.name || "Wedding Project"}
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export Budget</span>
                </Button>
              }
            />
            <Button 
              size="sm" 
              className="gap-2"
              onClick={() => {
                setEditingItem(undefined);
                setIsDialogOpen(true);
              }}
            >
              <DollarSign className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <UnifiedGrid cols={4} gap="md">
          <UnifiedCard variant="elegant" className="text-center">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(budgetSummary?.totalEstimated || 0)}
            </div>
            <div className="text-sm text-neutral-600">Total Budget</div>
          </UnifiedCard>
          <UnifiedCard variant="elegant" className="text-center">
            <div className="text-2xl font-bold text-success">
              {formatCurrency(budgetSummary?.totalActual || 0)}
            </div>
            <div className="text-sm text-neutral-600">Total Spent</div>
          </UnifiedCard>
          <UnifiedCard variant="elegant" className="text-center">
            <div className="text-2xl font-bold text-warning">
              {formatCurrency(Math.abs(budgetSummary?.totalRemaining || 0))}
            </div>
            <div className="text-sm text-neutral-600">
              {(budgetSummary?.totalRemaining || 0) >= 0 ? 'Remaining' : 'Over Budget'}
            </div>
          </UnifiedCard>
          <UnifiedCard variant="elegant" className="text-center">
            <div className="text-2xl font-bold text-secondary">
              {budgetSummary?.items || 0}
            </div>
            <div className="text-sm text-neutral-600">Budget Items</div>
          </UnifiedCard>
        </UnifiedGrid>
      </UnifiedSection>

      {/* Filters */}
      <UnifiedSection animation="fadeIn">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <Input
              placeholder="Search budget items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categoryFilters.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="show-paid-only"
              checked={showPaidOnly}
              onChange={(e) => setShowPaidOnly(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="show-paid-only" className="text-sm">
              Show paid items only
            </label>
          </div>
        </div>
      </UnifiedSection>

      {/* Main Content */}
      <UnifiedSection animation="fadeIn">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="items" className="text-xs sm:text-sm">Items</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <BudgetOverviewAnalytics 
              budgetItems={budgetItems || []}
              budgetSummary={budgetSummary}
            />
          </TabsContent>

          <TabsContent value="items" className="space-y-3 sm:space-y-4">
            {filteredItems.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 sm:py-12">
                  <DollarSign className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No budget items found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || filterCategory 
                      ? "Try adjusting your filters to see more items."
                      : "Get started by adding your first budget item."
                    }
                  </p>
                  {(!searchTerm && !filterCategory) && (
                    <Button className="gap-2">
                      <DollarSign className="h-4 w-4" />
                      Add Budget Item
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredItems.map((item: any) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">{String(item.item || item.name || 'Untitled')}</h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                              {String(item.category || 'uncategorized')}
                            </span>
                            {item.isPaid && (
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                Paid
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Estimated:</span>
                              <div className="font-medium">{formatCurrency(item.estimatedCost || 0)}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Actual:</span>
                              <div className="font-medium">{formatCurrency(item.actualCost || 0)}</div>
                            </div>
                            {item.vendor && (
                              <div>
                                <span className="text-gray-500">Vendor:</span>
                                <div className="font-medium">{String(item.vendor)}</div>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingItem(item);
                                  setIsDialogOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                          
                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-2">{String(item.notes)}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <BudgetCategorySummary 
              categories={(budgetSummary?.categories as any) || []}
              totalBudget={budgetSummary?.totalEstimated || 0}
              totalSpent={budgetSummary?.totalActual || 0}
              budgetItems={budgetItems || []}
              projectId={projectId}
            />
          </TabsContent>
        </Tabs>
      </UnifiedSection>

      {/* Budget Entry Dialog */}
      {projectId && (
        <BudgetEntryDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          budgetItem={editingItem as any}
          projectId={projectId}
        />
      )}
    </UnifiedPageLayout>
  );
});

Budget.displayName = 'Budget';

// Budget Overview Analytics Component
function BudgetOverviewAnalytics({ budgetItems, budgetSummary }: { 
  budgetItems: any[], 
  budgetSummary: any 
}) {
  const formatCurrency = (amount: number | string | undefined | null) => {
    // Handle string inputs and ensure proper number parsing
    let safeAmount = 0;
    
    if (typeof amount === 'string') {
      // Remove any non-numeric characters except decimal points
      const cleanString = amount.replace(/[^0-9.]/g, '');
      safeAmount = parseFloat(cleanString) || 0;
    } else if (typeof amount === 'number') {
      safeAmount = amount;
    } else {
      safeAmount = 0;
    }
    
    // Ensure the amount is a valid number
    if (isNaN(safeAmount) || !isFinite(safeAmount)) {
      safeAmount = 0;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  };

  // Calculate analytics data
  const totalEstimated = budgetSummary?.totalEstimated || 0;
  const totalActual = budgetSummary?.totalActual || 0;
  const totalVariance = totalActual - totalEstimated;
  const budgetUsage = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;

  // Category display names mapping
  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'venue': 'Venue',
      'catering': 'Catering', 
      'photography': 'Photography',
      'flowers': 'Flowers',
      'music': 'Music',
      'transportation': 'Transportation',
      'attire': 'Attire',
      'rings': 'Rings',
      'invitations': 'Invitations',
      'decorations': 'Decorations',
      'beauty': 'Beauty',
      'favors': 'Favors',
      'other': 'Other'
    };
    
    // Handle null, undefined, or empty values
    if (!category || category === 'undefined' || category === 'null') {
      return 'Uncategorized';
    }
    
    // If it's a string category, use the mapping or capitalize the first letter
    if (typeof category === 'string') {
      const cleanCategory = category.trim();
      if (cleanCategory === '') return 'Uncategorized';
      
      return categoryMap[cleanCategory.toLowerCase()] || cleanCategory.charAt(0).toUpperCase() + cleanCategory.slice(1).toLowerCase();
    }
    
    // If it's a number (legacy data), convert to string and use mapping
    return categoryMap[String(category)] || `Category ${category}`;
  };

  // Category data for charts
  const categoryData = useMemo(() => {
    // Try to use budgetSummary.categories first, fallback to budgetItems
    let categories = [];
    
    if (budgetSummary?.categories && Array.isArray(budgetSummary.categories)) {
      console.log('Using budgetSummary.categories:', budgetSummary.categories);
      categories = budgetSummary.categories;
    } else if (budgetItems && Array.isArray(budgetItems)) {
      console.log('Using budgetItems to calculate categories');
      // Calculate categories from budgetItems
      const categoryMap: { [key: string]: { estimated: number; actual: number; count: number } } = {};
      
      budgetItems.forEach(item => {
        const category = String(item?.category || 'Uncategorized');
        const estimated = Number(item?.estimatedCost) || 0;
        const actual = Number(item?.actualCost) || 0;
        
        if (!categoryMap[category]) {
          categoryMap[category] = { estimated: 0, actual: 0, count: 0 };
        }
        
        categoryMap[category].estimated += estimated;
        categoryMap[category].actual += actual;
        categoryMap[category].count += 1;
      });
      
      categories = Object.entries(categoryMap).map(([category, data]) => ({
        category: getCategoryDisplayName(category),
        estimated: data.estimated,
        actual: data.actual,
        count: data.count
      }));
    }
    
    return categories;
  }, [budgetItems, budgetSummary]);

  // Payment status data for pie chart
  const paymentData = useMemo(() => {
    if (!budgetItems || !Array.isArray(budgetItems)) return [];
    
    const paid = budgetItems.filter(item => item.isPaid).length;
    const unpaid = budgetItems.length - paid;
    
    return [
      { name: 'Paid', value: paid, color: '#10b981' },
      { name: 'Unpaid', value: unpaid, color: '#f59e0b' }
    ];
  }, [budgetItems]);

  // Top spending categories
  const topCategories = useMemo(() => {
    return categoryData
      .sort((a: any, b: any) => (b.actual || 0) - (a.actual || 0))
      .slice(0, 5)
      .map((cat: any) => ({
        ...cat,
        variance: (cat.actual || 0) - (cat.estimated || 0)
      }));
  }, [categoryData]);

  return (
    <div className="space-y-6">
      {/* Budget Progress Overview */}
      <Card className="card-elegant animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-heading">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
              <Target className="h-5 w-5 text-white" />
            </div>
            Budget Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Budget Usage</span>
              <span className="text-sm text-gray-600">{budgetUsage.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(budgetUsage, 100)} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Total Budget:</span>
                <div className="font-semibold">{formatCurrency(totalEstimated)}</div>
              </div>
              <div>
                <span className="text-gray-500">Total Spent:</span>
                <div className="font-semibold">{formatCurrency(totalActual)}</div>
              </div>
            </div>
            {totalVariance !== 0 && (
              <Alert className={totalVariance > 0 ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
                <AlertDescription>
                  {totalVariance > 0 
                    ? `Over budget by ${formatCurrency(totalVariance)}`
                    : `Under budget by ${formatCurrency(Math.abs(totalVariance))}`
                  }
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Status Chart */}
      <Card className="card-elegant animate-slide-in-right">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-heading">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ChartSkeleton />}>
            <BudgetPieChart data={paymentData.filter(item => item && typeof item.value === 'number' && item.value > 0)} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Budget vs Actual Chart */}
      <Card className="card-elegant animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-heading">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-sm">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Budget vs Actual by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="estimated" fill="#8b5cf6" name="Estimated" />
                <Bar dataKey="actual" fill="#06b6d4" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No category data to display
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Spending Categories */}
      <Card className="card-elegant animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-heading">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
            Top Spending Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topCategories.length > 0 ? (
            <div className="space-y-4">
              {topCategories.map((categoryItem: any, index: number) => {
                const categoryName = String(categoryItem?.category || 'Uncategorized');
                const categoryActual = Number(categoryItem?.actual) || 0;
                const categoryVariance = Number(categoryItem?.variance) || 0;
                const categoryCount = Number(categoryItem?.count) || 0;
                
                return (
                  <div key={categoryItem?.id || `category-${index}`} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-gray-700 bg-white rounded-full w-8 h-8 flex items-center justify-center">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 capitalize">{categoryName}</div>
                        <div className="text-sm text-gray-600">{categoryCount} items</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">{formatCurrency(categoryActual)}</div>
                      <Badge variant={categoryVariance > 0 ? 'destructive' : 'default'} className="text-xs">
                        {categoryVariance > 0 ? '+' : ''}{formatCurrency(Math.abs(categoryVariance))}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No spending data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Budget;