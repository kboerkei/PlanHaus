import { useState, useMemo, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, PieChart, TrendingUp, AlertTriangle, Filter } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useBudget, useBudgetSummary } from "@/hooks/useBudget";
import BudgetEntryDialog from "@/components/budget/BudgetEntryDialog";
import BudgetCategorySummary from "@/components/budget/BudgetCategorySummary";
import LoadingSpinner from "@/components/ui/loading-spinner";

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

export default function Budget() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showPaidOnly, setShowPaidOnly] = useState(false);

  // Fetch data using hooks
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const currentProject = projects?.find(p => p.name === "Emma & Jake's Wedding") || projects?.[0];
  const projectId = currentProject?.id?.toString();
  
  const { data: budgetItems = [], isLoading: budgetLoading, error: budgetError } = useBudget(projectId);
  const budgetSummary = useBudgetSummary(projectId);
  
  // Ensure we have budget items data for the category summary
  const actualBudgetItems = budgetItems || [];

  // Filter logic
  const filteredItems = useMemo(() => {
    if (!budgetItems) return [];
    
    return budgetItems.filter(item => {
      const matchesSearch = !searchTerm || 
        item.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      const matchesPaid = !showPaidOnly || item.isPaid;
      
      return matchesSearch && matchesCategory && matchesPaid;
    });
  }, [budgetItems, searchTerm, filterCategory, showPaidOnly]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
            <p className="text-gray-600">
              Track your wedding expenses and stay on budget
            </p>
          </div>
          <BudgetEntryDialog projectId={projectId} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {budgetSummary && (
            <BudgetCategorySummary
              categories={budgetSummary.categories}
              totalBudget={budgetSummary.totalEstimated}
              totalSpent={budgetSummary.totalActual}
            />
          )}
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <DollarSign className="mx-auto mb-4 w-16 h-16 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No budget items found</h3>
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
          <BudgetCategorySummary
            categories={budgetSummary?.categories || []}
            totalBudget={budgetSummary?.totalEstimated || 0}
            totalSpent={budgetSummary?.totalActual || 0}
            budgetItems={actualBudgetItems}
            projectId={projectId || ''}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}