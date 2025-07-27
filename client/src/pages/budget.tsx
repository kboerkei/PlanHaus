import { useState, useMemo, Suspense, memo } from "react";
import { useDebouncedValue, useAbortController, usePerformanceMonitor } from "@/hooks/usePerformance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DollarSign, PieChart, TrendingUp, TrendingDown, AlertTriangle, Filter, Target, CreditCard, Calendar, Download } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useBudget, useBudgetSummary } from "@/hooks/useBudget";
import BudgetEntryDialog from "@/components/budget/BudgetEntryDialog";
import BudgetCategorySummary from "@/components/budget/BudgetCategorySummary";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ExportDialog from "@/components/export/ExportDialog";
// Lazy load charts for better performance
import { BudgetPieChart, BudgetBarChart } from "@/components/lazy/LazyBudgetCharts";
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
  
  // Performance monitoring
  usePerformanceMonitor('Budget');
  
  // Debounce search input for better performance
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const { getAbortSignal } = useAbortController();

  // Fetch data using hooks
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const currentProject = projects?.find(p => p.name === "Emma & Jake's Wedding") || projects?.[0];
  const projectId = currentProject?.id?.toString();
  

  
  const { data: budgetItems = [], isLoading: budgetLoading, error: budgetError } = useBudget(projectId);
  const budgetSummary = useBudgetSummary(projectId);
  
  // Ensure we have budget items data for the category summary
  const actualBudgetItems = budgetItems || [];
  


  // Filter logic with debounced search
  const filteredItems = useMemo(() => {
    if (!budgetItems) return [];
    
    return budgetItems.filter(item => {
      const matchesSearch = !debouncedSearchTerm || 
        item.item?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.vendor?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      const matchesPaid = !showPaidOnly || item.isPaid;
      
      return matchesSearch && matchesCategory && matchesPaid;
    });
  }, [budgetItems, debouncedSearchTerm, filterCategory, showPaidOnly]);

  // Calculate totals from filtered items
  const filteredTotals = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const estimatedCost = parseFloat(item.estimatedCost) || 0;
      const actualCost = parseFloat(item.actualCost) || 0;
      
      acc.estimated += estimatedCost;
      acc.actual += actualCost;
      if (item.isPaid) acc.paid += actualCost || estimatedCost;
      return acc;
    }, { estimated: 0, actual: 0, paid: 0 });
  }, [filteredItems]);

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

  // Loading and error states
  if (projectsLoading || budgetLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading your budget..." />
      </div>
    );
  }

  if (budgetError) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>Error loading budget. Please try again.</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
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
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-6 px-2 sm:px-4 animate-fade-in-up">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Budget</h1>
            <p className="text-sm sm:text-base text-gray-600 hidden sm:block">
              Track your wedding expenses and stay on budget
            </p>
          </div>
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
            <BudgetEntryDialog projectId={projectId} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card className="border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(budgetSummary?.totalEstimated || 0)}
              </div>
              <div className="text-sm text-gray-600">Total Budget</div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(budgetSummary?.totalActual || 0)}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </CardContent>
          </Card>
          <Card className="border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(Math.abs(budgetSummary?.totalRemaining || 0))}
              </div>
              <div className="text-sm text-gray-600">
                {(budgetSummary?.totalRemaining || 0) >= 0 ? 'Remaining' : 'Over Budget'}
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {budgetSummary?.items || 0}
              </div>
              <div className="text-sm text-gray-600">Budget Items</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
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
      </div>

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
                  <BudgetEntryDialog projectId={projectId} />
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
                          <h3 className="font-medium text-gray-900">{item.item}</h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                            {item.category}
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
                              <div className="font-medium">{item.vendor}</div>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <BudgetEntryDialog
                              projectId={projectId}
                              budgetItem={item}
                              trigger={
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              }
                            />
                          </div>
                        </div>
                        
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories">
          {projectId ? (
            <BudgetCategorySummary
              categories={(budgetSummary?.categories as any) || []}
              totalBudget={budgetSummary?.totalEstimated || 0}
              totalSpent={budgetSummary?.totalActual || 0}
              budgetItems={budgetItems || []}
              projectId={projectId}
            />
          ) : (
            <div className="flex items-center justify-center p-8">
              <p className="text-gray-500">Loading project...</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
});

Budget.displayName = 'Budget';

// Budget Overview Analytics Component
function BudgetOverviewAnalytics({ budgetItems, budgetSummary }: { 
  budgetItems: any[], 
  budgetSummary: any 
}) {
  const formatCurrency = (amount: number | undefined | null) => {
    const safeAmount = parseFloat(String(amount)) || 0;
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

  // Category mapping for chart display
  const CATEGORY_NAMES = {
    0: 'Venue',
    1: 'Catering',
    2: 'Photography',
    3: 'Flowers',
    4: 'Music',
    5: 'Transportation',
    6: 'Attire',
    7: 'Rings',
    8: 'Invitations',
    9: 'Decorations',
    10: 'Beauty',
    11: 'Favors',
    12: 'Other'
  };

  // Category data for charts
  const categoryData = useMemo(() => {
    if (!budgetSummary?.categories) return [];
    
    const colors = [
      '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
      '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'
    ];
    
    return budgetSummary.categories.map((cat: any, index: number) => ({
      category: CATEGORY_NAMES[cat.category as keyof typeof CATEGORY_NAMES] || cat.category,
      estimated: cat.estimated,
      actual: cat.actual,
      variance: cat.actual - cat.estimated,
      count: cat.items,
      color: colors[index % colors.length]
    }));
  }, [budgetSummary]);

  // Payment status data
  const paymentData = useMemo(() => {
    if (!budgetItems) return [];
    
    const paid = budgetItems.filter(item => item.isPaid).reduce((sum, item) => sum + (parseFloat(item.actualCost) || 0), 0);
    const unpaid = totalActual - paid;
    
    return [
      { name: 'Paid', value: paid, color: '#10b981' },
      { name: 'Unpaid', value: unpaid, color: '#f59e0b' }
    ];
  }, [budgetItems, totalActual]);

  // Budget alerts
  const alerts = useMemo(() => {
    const alertList = [];
    
    if (budgetUsage > 100) {
      alertList.push({
        type: 'error',
        message: `You're ${(budgetUsage - 100).toFixed(1)}% over budget! Consider reviewing expenses.`
      });
    } else if (budgetUsage > 90) {
      alertList.push({
        type: 'warning',
        message: `You've used ${budgetUsage.toFixed(1)}% of your budget. Watch your remaining expenses.`
      });
    }
    
    // Check for categories over budget
    categoryData.forEach(cat => {
      if (cat.variance > 0) {
        alertList.push({
          type: 'warning',
          message: `${cat.category} is ${formatCurrency(cat.variance)} over budget.`
        });
      }
    });
    
    return alertList;
  }, [budgetUsage, categoryData]);

  // Top spending categories
  const topCategories = useMemo(() => {
    return categoryData
      .filter(cat => cat.actual > 0)
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 5);
  }, [categoryData]);

  if (!budgetSummary) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'} className="animate-scale-in">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <Card className="card-elegant animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-heading">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-sm">
              <Target className="h-5 w-5 text-white" />
            </div>
            Budget Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-1">{formatCurrency(totalEstimated)}</div>
              <div className="text-sm font-medium text-purple-700">Total Budget</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">{formatCurrency(totalActual)}</div>
              <div className="text-sm font-medium text-blue-700">Total Spent</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100">
              <div className={`text-3xl font-bold mb-1 ${totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(totalVariance))}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {totalVariance > 0 ? 'Over Budget' : 'Under Budget'}
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-3xl font-bold text-gray-800 mb-1">{budgetUsage.toFixed(1)}%</div>
              <div className="text-sm font-medium text-gray-700">Budget Used</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span>Budget Usage Progress</span>
              <span>{budgetUsage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.min(budgetUsage, 100)} 
              className="h-4"
            />
            {budgetUsage > 100 && (
              <div className="text-sm text-red-600 font-medium">
                Over budget by {formatCurrency(totalVariance)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category Pie Chart */}
        <Card className="card-elegant animate-slide-in-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-heading">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-sm">
                <PieChart className="h-5 w-5 text-white" />
              </div>
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.filter(item => item.actual > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={categoryData.filter(item => item.actual > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, actual, percent }) => 
                      percent > 10 ? `${category}: ${formatCurrency(actual)}` : ''
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="actual"
                  >
                    {categoryData.filter(item => item.actual > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => 
                      `${value}: ${formatCurrency(entry.payload.actual)}`
                    }
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No spending data to display
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Status */}
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
            {paymentData.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={paymentData.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => 
                      percent > 10 ? `${name}: ${formatCurrency(value)}` : ''
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentData.filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => 
                      `${value}: ${formatCurrency(entry.payload.value)}`
                    }
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No payment data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
              {topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-bold text-gray-700 bg-white rounded-full w-8 h-8 flex items-center justify-center">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 capitalize">{category.category}</div>
                      <div className="text-sm text-gray-600">{category.count} items</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">{formatCurrency(category.actual)}</div>
                    <Badge variant={category.variance > 0 ? 'destructive' : 'default'} className="text-xs">
                      {category.variance > 0 ? '+' : ''}{formatCurrency(category.variance)}
                    </Badge>
                  </div>
                </div>
              ))}
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