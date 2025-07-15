import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import LoadingSpinner from "@/components/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DollarSign, Plus, TrendingUp, AlertTriangle, ChevronDown, ChevronRight, Edit2, Trash2, Check, X, Download, Filter, ArrowUpDown, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Budget() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // Enhanced filtering and sorting state
  const [sortBy, setSortBy] = useState<'category' | 'estimatedCost' | 'actualCost' | 'isPaid'>('category');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterPaidStatus, setFilterPaidStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [budgetForm, setBudgetForm] = useState({
    category: "",
    item: "",
    estimatedCost: "",
    actualCost: "",
    vendor: "",
    notes: ""
  });
  const [editForm, setEditForm] = useState({
    category: "",
    item: "",
    estimatedCost: "",
    actualCost: "",
    vendor: "",
    notes: "",
    isPaid: false
  });
  const { toast } = useToast();

  // Query definitions
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects']
  });

  const { data: budgetItems = [], isLoading: budgetLoading } = useQuery({
    queryKey: ['/api/budget-items'],
    select: (data) => data || []
  });
  
  // Budget creation mutation
  const createBudgetMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/budget-items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-items'] });
      toast({
        title: "Expense Added",
        description: "Your budget item has been added successfully",
      });
      setBudgetForm({
        category: "",
        item: "",
        estimatedCost: "",
        actualCost: "",
        vendor: "",
        notes: ""
      });
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to add expense",
        variant: "destructive",
      });
    }
  });

  // Budget edit mutation
  const editBudgetMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/budget-items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-items'] });
      toast({
        title: "Expense Updated",
        description: "Your budget item has been updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update expense",
        variant: "destructive",
      });
    }
  });

  // Budget delete mutation
  const deleteBudgetMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/budget-items/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-items'] });
      toast({
        title: "Expense Deleted",
        description: "Budget item has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete expense",
        variant: "destructive",
      });
    }
  });

  const handleCreateBudgetItem = () => {
    if (!budgetForm.category || !budgetForm.item || !budgetForm.estimatedCost) {
      toast({
        title: "Missing Information",
        description: "Please fill in category, item name, and estimated cost",
        variant: "destructive",
      });
      return;
    }
    
    // Enhanced validation and number conversion
    const estimatedCost = parseFloat(budgetForm.estimatedCost);
    const actualCost = budgetForm.actualCost ? parseFloat(budgetForm.actualCost) : null;
    
    if (isNaN(estimatedCost) || estimatedCost < 0) {
      toast({
        title: "Invalid Cost",
        description: "Please enter a valid estimated cost",
        variant: "destructive",
      });
      return;
    }
    
    if (actualCost !== null && (isNaN(actualCost) || actualCost < 0)) {
      toast({
        title: "Invalid Cost",
        description: "Please enter a valid actual cost",
        variant: "destructive",
      });
      return;
    }
    
    // Convert form data to match the API schema with proper number formatting
    const budgetData = {
      category: budgetForm.category,
      item: budgetForm.item,
      estimatedCost: estimatedCost,
      actualCost: actualCost,
      vendor: budgetForm.vendor || null,
      notes: budgetForm.notes || null,
    };

    createBudgetMutation.mutate(budgetData);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setEditForm({
      category: item.category || "",
      item: item.item || "",
      estimatedCost: item.estimatedCost?.toString() || "",
      actualCost: item.actualCost?.toString() || "",
      vendor: item.vendor || "",
      notes: item.notes || "",
      isPaid: item.isPaid || false
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateBudgetItem = () => {
    if (!editForm.category || !editForm.item || !editForm.estimatedCost) {
      toast({
        title: "Missing Information",
        description: "Please fill in category, item name, and estimated cost",
        variant: "destructive",
      });
      return;
    }
    
    // Enhanced validation for edit form
    const estimatedCost = parseFloat(editForm.estimatedCost);
    const actualCost = editForm.actualCost ? parseFloat(editForm.actualCost) : null;
    
    if (isNaN(estimatedCost) || estimatedCost < 0) {
      toast({
        title: "Invalid Cost",
        description: "Please enter a valid estimated cost",
        variant: "destructive",
      });
      return;
    }
    
    if (actualCost !== null && (isNaN(actualCost) || actualCost < 0)) {
      toast({
        title: "Invalid Cost",
        description: "Please enter a valid actual cost",
        variant: "destructive",
      });
      return;
    }
    
    editBudgetMutation.mutate({
      id: editingItem.id,
      data: {
        ...editForm,
        estimatedCost: estimatedCost,
        actualCost: actualCost,
        isPaid: editForm.isPaid
      }
    });
  };

  const handleDeleteItem = (item: any) => {
    if (confirm(`Are you sure you want to delete "${item.item}"?`)) {
      deleteBudgetMutation.mutate(item.id);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const getItemsByCategory = (category: string) => {
    return filteredSortedItems?.filter((item: any) => item.category === category) || [];
  };

  // Add loading skeleton for budget page
  if (projectsLoading || budgetLoading || projectBudgetLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Loading Header */}
          <div className="mb-8 animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gray-200 rounded-lg w-14 h-14"></div>
                <div>
                  <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="flex space-x-3">
                <div className="h-10 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>

          {/* Loading Summary Card */}
          <div className="mb-6 animate-pulse">
            <div className="border-0 shadow-lg bg-gray-50 rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center md:text-left">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Loading Controls */}
          <div className="mb-6 animate-pulse">
            <div className="border rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Loading Budget Items */}
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentProject = projects?.find(p => p.name === "Emma & Jake's Wedding") || projects?.[0];

  // Get budget items for current project - override the global query
  const { data: projectBudgetItems, error: budgetError, isLoading: projectBudgetLoading } = useQuery({
    queryKey: ['/api/projects', currentProject?.id, 'budget'],
    enabled: !!currentProject?.id,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Use project-specific budget items if available, otherwise fall back to global
  const finalBudgetItems = projectBudgetItems || budgetItems;

  // Enhanced budget calculations with better number handling
  const formatCurrency = (amount: number | string): string => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount || "0");
    return isNaN(num) ? "$0" : `$${num.toLocaleString()}`;
  };

  // Sanitize input to allow only numbers and decimals
  const sanitizeNumericInput = (value: string): string => {
    return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  };

  const totalBudget = currentProject?.budget ? parseFloat(currentProject.budget) : 0;
  
  // Calculate totals with enhanced number parsing
  const totalEstimated = finalBudgetItems?.reduce((sum: number, item: any) => {
    const estimated = typeof item.estimatedCost === 'number' ? item.estimatedCost : parseFloat(item.estimatedCost || "0");
    return sum + (isNaN(estimated) ? 0 : estimated);
  }, 0) || 0;
  
  const totalActual = finalBudgetItems?.reduce((sum: number, item: any) => {
    const actual = typeof item.actualCost === 'number' ? item.actualCost : parseFloat(item.actualCost || "0");
    return sum + (isNaN(actual) ? 0 : actual);
  }, 0) || 0;
  
  const budgetDifference = totalEstimated - totalActual;
  const budgetUsagePercentage = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;
  const remaining = totalBudget - totalActual;

  // Enhanced filtering and sorting logic
  const getFilteredAndSortedItems = () => {
    if (!finalBudgetItems) return [];
    
    let filtered = finalBudgetItems.filter((item: any) => {
      if (filterPaidStatus === 'paid') return item.isPaid === true;
      if (filterPaidStatus === 'unpaid') return item.isPaid !== true;
      return true; // 'all'
    });

    return filtered.sort((a: any, b: any) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'estimatedCost':
          aValue = parseFloat(a.estimatedCost || "0");
          bValue = parseFloat(b.estimatedCost || "0");
          break;
        case 'actualCost':
          aValue = parseFloat(a.actualCost || "0");
          bValue = parseFloat(b.actualCost || "0");
          break;
        case 'isPaid':
          aValue = a.isPaid ? 1 : 0;
          bValue = b.isPaid ? 1 : 0;
          break;
        default: // 'category'
          aValue = a.category || "";
          bValue = b.category || "";
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  const filteredSortedItems = getFilteredAndSortedItems();

  // Export functionality (placeholder for future implementation)
  const handleExportBudget = () => {
    // Future implementation: Generate CSV/PDF export
    toast({
      title: "Export Feature",
      description: "Budget export functionality will be available soon. For now, you can copy the data manually.",
    });
  };

  // Handle loading state
  if (projectsLoading || budgetLoading || projectBudgetLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <LoadingSpinner size="lg" text="Loading your budget information..." />
        </div>
      </div>
    );
  }

  // Handle null or error states
  if (budgetError || finalBudgetItems === null) {
    return (
      <div className="p-4 sm:p-6 mobile-padding">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Budget Management</h3>
            <p className="text-gray-600 mb-6">Start tracking your wedding expenses and stay within budget.</p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="gradient-blush-rose text-white touch-manipulation"
            >
              <Plus size={16} className="mr-2" />
              Add First Budget Item
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Group budget items by category using filtered/sorted items
  const budgetCategories = filteredSortedItems ? 
    filteredSortedItems.reduce((acc: any[], item: any) => {
      const existingCategory = acc.find(cat => cat.category === item.category);
      const estimatedCost = parseFloat(item.estimatedCost || "0");
      const actualCost = parseFloat(item.actualCost || "0");
      
      if (existingCategory) {
        existingCategory.estimated += estimatedCost;
        existingCategory.actual += actualCost;
      } else {
        acc.push({
          id: item.id,
          category: item.category,
          estimated: estimatedCost,
          actual: actualCost,
          percentage: totalEstimated > 0 ? Math.round((estimatedCost / totalEstimated) * 100) : 0,
          status: actualCost === 0 ? 'pending' : 
                  actualCost > estimatedCost ? 'over' : 'under'
        });
      }
      return acc;
    }, []) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'text-red-600 bg-red-50';
      case 'under':
        return 'text-green-600 bg-green-50';
      case 'exact':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'under':
        return <TrendingUp size={16} className="text-green-600" />;
      default:
        return null;
    }
  };

  if (projectsLoading || budgetLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <LoadingSpinner size="lg" text="Loading your budget information..." />
        </div>
      </div>
    );
  }



  return (
    <>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Simple Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="p-2 md:p-3 bg-rose-500 rounded-lg">
                    <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-4xl font-semibold text-gray-900 tracking-tight">
                      Wedding Budget
                    </h1>
                    <p className="text-gray-600 text-xs md:text-lg mt-1">
                      Track your spending and stay on budget
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 md:space-x-3 w-full md:w-auto">
                  {/* Export Budget Button */}
                  <Button 
                    onClick={handleExportBudget}
                    variant="outline"
                    className="border-blush text-blush hover:bg-blush hover:text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex-1 md:flex-none"
                  >
                    <Download size={16} className="mr-2" />
                    Export Budget
                  </Button>
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="gradient-blush-rose text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex-1 md:flex-none"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Expense
                  </Button>
                </div>
            </div>
          </div>

            {/* Enhanced Budget Summary Card */}
            <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <TrendingUp className="text-purple-600" size={24} />
                    <span>Budget Summary</span>
                  </span>
                  {budgetUsagePercentage > 80 && (
                    <div className="flex items-center space-x-1 text-amber-600">
                      <AlertTriangle size={20} />
                      <span className="text-sm font-medium">High Usage</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Estimated Spend */}
                  <div className="text-center md:text-left">
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Estimated</p>
                    <p className="text-3xl font-bold text-purple-700">{formatCurrency(totalEstimated)}</p>
                    <p className="text-xs text-gray-500 mt-1">Budget planned</p>
                  </div>
                  
                  {/* Total Actual Spend */}
                  <div className="text-center md:text-left">
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Actual</p>
                    <p className="text-3xl font-bold text-blue-700">{formatCurrency(totalActual)}</p>
                    <p className="text-xs text-gray-500 mt-1">Actually spent</p>
                  </div>
                  
                  {/* Difference */}
                  <div className="text-center md:text-left">
                    <p className="text-sm font-medium text-gray-600 mb-1">Difference</p>
                    <p className={`text-3xl font-bold ${budgetDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {budgetDifference >= 0 ? '+' : ''}{formatCurrency(budgetDifference)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {budgetDifference >= 0 ? 'Under budget' : 'Over budget'}
                    </p>
                  </div>
                </div>
                
                {/* Budget Usage Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Budget Usage</span>
                    <span className="text-sm text-gray-600">{budgetUsagePercentage.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(budgetUsagePercentage, 100)} 
                    className={`h-3 ${budgetUsagePercentage > 100 ? 'bg-red-100' : 'bg-gray-200'}`}
                  />
                  {budgetUsagePercentage > 100 && (
                    <div className="flex items-center space-x-1 mt-2 text-red-600">
                      <AlertCircle size={16} />
                      <span className="text-sm font-medium">Over budget by {formatCurrency(totalActual - totalEstimated)}</span>
                    </div>
                  )}
                  {budgetUsagePercentage > 80 && budgetUsagePercentage <= 100 && (
                    <div className="flex items-center space-x-1 mt-2 text-amber-600">
                      <AlertTriangle size={16} />
                      <span className="text-sm font-medium">Warning: {(100 - budgetUsagePercentage).toFixed(1)}% budget remaining</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Filtering and Sorting Controls */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Filter & Sort</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Payment Status Filter */}
                  <div className="flex-1">
                    <Label htmlFor="filter-paid" className="text-sm font-medium text-gray-700">Payment Status</Label>
                    <Select value={filterPaidStatus} onValueChange={(value: 'all' | 'paid' | 'unpaid') => setFilterPaidStatus(value)}>
                      <SelectTrigger className="mt-1">
                        <Filter size={16} className="mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Items</SelectItem>
                        <SelectItem value="paid">Paid Only</SelectItem>
                        <SelectItem value="unpaid">Unpaid Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Sort By */}
                  <div className="flex-1">
                    <Label htmlFor="sort-by" className="text-sm font-medium text-gray-700">Sort By</Label>
                    <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                      <SelectTrigger className="mt-1">
                        <ArrowUpDown size={16} className="mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="estimatedCost">Estimated Cost</SelectItem>
                        <SelectItem value="actualCost">Actual Cost</SelectItem>
                        <SelectItem value="isPaid">Payment Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Sort Order */}
                  <div className="flex-1">
                    <Label htmlFor="sort-order" className="text-sm font-medium text-gray-700">Order</Label>
                    <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {budgetCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Budget Items Yet</h3>
                    <p className="text-gray-500 mb-4">Your budget breakdown will appear here once you add expense categories.</p>
                    <Button 
                      onClick={() => setIsAddDialogOpen(true)}
                      className="gradient-blush-rose text-white"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Your First Expense
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {budgetCategories.map((categoryData) => {
                      const categoryItems = getItemsByCategory(categoryData.category);
                      const isExpanded = expandedCategory === categoryData.category;
                      
                      return (
                        <div key={categoryData.category} className="border rounded-lg">
                          {/* Category Header - Clickable */}
                          <div 
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleCategory(categoryData.category)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {isExpanded ? (
                                    <ChevronDown size={16} className="text-gray-500" />
                                  ) : (
                                    <ChevronRight size={16} className="text-gray-500" />
                                  )}
                                  <h3 className="font-semibold text-gray-800">{categoryData.category}</h3>
                                  <span className="text-sm text-gray-500">({categoryItems.length} items)</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(categoryData.status)}
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(categoryData.status)}`}>
                                    {categoryData.status}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Estimated: ${categoryData.estimated.toLocaleString()}</span>
                                <span>Actual: ${categoryData.actual.toLocaleString()}</span>
                                {totalBudget > 0 && categoryData.estimated > 0 && (
                                  <span>{categoryData.percentage}% of budget</span>
                                )}
                              </div>
                              
                              {categoryData.estimated > 0 && (
                                <Progress 
                                  value={(categoryData.actual / categoryData.estimated) * 100} 
                                  className="mt-2"
                                />
                              )}
                            </div>
                          </div>

                          {/* Expanded Items */}
                          {isExpanded && (
                            <div className="border-t bg-gray-50">
                              <div className="p-4 space-y-3">
                                {categoryItems.map((item: any) => (
                                  <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-800">{item.item}</h4>
                                        <div className="flex items-center space-x-2">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditItem(item);
                                            }}
                                            className="h-8 w-8 p-0"
                                          >
                                            <Edit2 size={14} />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteItem(item);
                                            }}
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 size={14} />
                                          </Button>
                                        </div>
                                      </div>
                                      {/* Enhanced Estimated vs Actual Display */}
                                      <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                          <div className="text-xs font-medium text-blue-600 mb-1">ESTIMATED AMOUNT</div>
                                          <div className="text-lg font-bold text-blue-800">
                                            ${parseFloat(item.estimatedCost || 0).toLocaleString()}
                                          </div>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg">
                                          <div className="text-xs font-medium text-green-600 mb-1">ACTUAL AMOUNT</div>
                                          <div className="text-lg font-bold text-green-800">
                                            {item.actualCost ? `$${parseFloat(item.actualCost).toLocaleString()}` : 'Not set'}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Variance Indicator */}
                                      {item.actualCost && item.estimatedCost && (
                                        <div className="mb-3">
                                          {(() => {
                                            const estimated = parseFloat(item.estimatedCost);
                                            const actual = parseFloat(item.actualCost);
                                            const variance = actual - estimated;
                                            const percentageVariance = estimated > 0 ? ((variance / estimated) * 100) : 0;
                                            
                                            if (Math.abs(variance) < 1) {
                                              return (
                                                <div className="flex items-center space-x-2 text-sm text-green-600">
                                                  <Check size={16} />
                                                  <span>On budget</span>
                                                </div>
                                              );
                                            } else if (variance > 0) {
                                              return (
                                                <div className="flex items-center space-x-2 text-sm text-red-600">
                                                  <AlertTriangle size={16} />
                                                  <span>Over by ${variance.toLocaleString()} ({percentageVariance.toFixed(1)}%)</span>
                                                </div>
                                              );
                                            } else {
                                              return (
                                                <div className="flex items-center space-x-2 text-sm text-green-600">
                                                  <TrendingUp size={16} />
                                                  <span>Under by ${Math.abs(variance).toLocaleString()} ({Math.abs(percentageVariance).toFixed(1)}%)</span>
                                                </div>
                                              );
                                            }
                                          })()}
                                        </div>
                                      )}

                                      <div className="text-sm text-gray-600 space-y-1">
                                        {item.vendor && (
                                          <div>
                                            <span className="font-medium">Vendor: </span>
                                            {item.vendor}
                                          </div>
                                        )}
                                        {item.notes && (
                                          <div>
                                            <span className="font-medium">Notes: </span>
                                            {item.notes}
                                          </div>
                                        )}
                                        {item.isPaid && (
                                          <div className="flex items-center space-x-1 text-green-600">
                                            <Check size={14} />
                                            <span className="font-medium">Paid</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                
                                {categoryItems.length === 0 && (
                                  <div className="text-center py-4 text-gray-500">
                                    No items in this category yet
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      {/* Add Budget Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Budget Item</DialogTitle>
            <DialogDescription>
              Track wedding expenses by adding budget items with estimated and actual costs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="budget-category">Category</Label>
              <Select value={budgetForm.category} onValueChange={(value) => setBudgetForm({ ...budgetForm, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venue">Venue</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="music">Music & Entertainment</SelectItem>
                  <SelectItem value="flowers">Flowers & Decorations</SelectItem>
                  <SelectItem value="attire">Attire</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-item">Item Name</Label>
              <Input
                id="budget-item"
                placeholder="e.g., Wedding venue deposit"
                value={budgetForm.item}
                onChange={(e) => setBudgetForm({ ...budgetForm, item: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget-estimated-cost" className="text-blue-700 font-medium">
                  Estimated Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="budget-estimated-cost"
                    type="text"
                    placeholder="0.00"
                    className="pl-8 border-blue-300 focus:border-blue-500"
                    value={budgetForm.estimatedCost}
                    onChange={(e) => setBudgetForm({ 
                      ...budgetForm, 
                      estimatedCost: sanitizeNumericInput(e.target.value) 
                    })}
                  />
                </div>
                <p className="text-xs text-blue-600">How much you expect to spend</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget-actual-cost" className="text-green-700 font-medium">
                  Actual Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="budget-actual-cost"
                    type="text"
                    placeholder="0.00"
                    className="pl-8 border-green-300 focus:border-green-500"
                    value={budgetForm.actualCost || ""}
                    onChange={(e) => setBudgetForm({ 
                      ...budgetForm, 
                      actualCost: sanitizeNumericInput(e.target.value) 
                    })}
                  />
                </div>
                <p className="text-xs text-green-600">How much you actually spent (optional)</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-vendor">Vendor (Optional)</Label>
              <Input
                id="budget-vendor"
                placeholder="e.g., Austin Wedding Venues"
                value={budgetForm.vendor}
                onChange={(e) => setBudgetForm({ ...budgetForm, vendor: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBudgetItem}
              disabled={!budgetForm.item || !budgetForm.estimatedCost || createBudgetMutation.isPending}
              className="gradient-blush-rose text-white"
            >
              {createBudgetMutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Budget Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Budget Item</DialogTitle>
            <DialogDescription>
              Update budget details, actual costs, and payment status for this expense.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venue">Venue</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="music">Music & Entertainment</SelectItem>
                  <SelectItem value="flowers">Flowers & Decorations</SelectItem>
                  <SelectItem value="attire">Attire</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item">Item Name</Label>
              <Input
                id="edit-item"
                placeholder="e.g., Wedding venue deposit"
                value={editForm.item}
                onChange={(e) => setEditForm({ ...editForm, item: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-estimated-cost" className="text-blue-700 font-medium">
                  Estimated Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="edit-estimated-cost"
                    type="text"
                    placeholder="0.00"
                    className="pl-8 border-blue-300 focus:border-blue-500"
                    value={editForm.estimatedCost}
                    onChange={(e) => setEditForm({ 
                      ...editForm, 
                      estimatedCost: sanitizeNumericInput(e.target.value) 
                    })}
                  />
                </div>
                <p className="text-xs text-blue-600">Expected cost</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-actual-cost" className="text-green-700 font-medium">
                  Actual Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="edit-actual-cost"
                    type="text"
                    placeholder="0.00"
                    className="pl-8 border-green-300 focus:border-green-500"
                    value={editForm.actualCost}
                    onChange={(e) => setEditForm({ 
                      ...editForm, 
                      actualCost: sanitizeNumericInput(e.target.value) 
                    })}
                  />
                </div>
                <p className="text-xs text-green-600">What you actually spent</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-vendor">Vendor (Optional)</Label>
              <Input
                id="edit-vendor"
                placeholder="e.g., Austin Wedding Venues"
                value={editForm.vendor}
                onChange={(e) => setEditForm({ ...editForm, vendor: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Input
                id="edit-notes"
                placeholder="Additional notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-paid"
                checked={editForm.isPaid}
                onChange={(e) => setEditForm({ ...editForm, isPaid: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit-paid">Mark as paid</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateBudgetItem}
              disabled={!editForm.item || !editForm.estimatedCost || editBudgetMutation.isPending}
              className="gradient-blush-rose text-white"
            >
              {editBudgetMutation.isPending ? "Updating..." : "Update Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}