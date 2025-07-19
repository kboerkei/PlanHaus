import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import SearchFilterBar from "@/components/ui/search-filter-bar";
import ExportOptions from "@/components/ui/export-options";
import LoadingSpinner from "@/components/ui/loading-spinner";
import BudgetCharts from "@/components/BudgetCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DollarSign, Plus, Download, Filter, Upload, FileText, FileSpreadsheet, 
  TrendingUp, AlertTriangle, Search, Edit, Trash2, MoreVertical, Target
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  item: z.string().min(1, "Item is required"),
  estimatedCost: z.string().min(1, "Estimated cost is required"),
  actualCost: z.string().optional(),
  vendor: z.string().optional(),
  notes: z.string().optional(),
  isPaid: z.boolean().default(false),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

const budgetCategories = [
  "Venue", "Catering", "Photography", "Videography", "Flowers", "Music", 
  "Transportation", "Attire", "Rings", "Invitations", "Decorations", 
  "Beauty", "Favors", "Other"
];

export default function Budget() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
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

  const currentProject = projects?.find(p => p.name === "Emma & Jake's Wedding") || projects?.[0];

  const { data: budgetItems = [], isLoading: budgetLoading } = useQuery({
    queryKey: ['/api/projects', currentProject?.id, 'budget'],
    enabled: !!currentProject?.id,
    select: (data) => data || []
  });

  // Budget creation mutation
  const createBudgetMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/budget-items', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        projectId: currentProject?.id
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject?.id, 'budget'] });
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
        description: "Failed to add budget item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Budget update mutation
  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/budget-items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject?.id, 'budget'] });
      toast({
        title: "Budget Updated",
        description: "Your budget item has been updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update budget item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Budget deletion mutation
  const deleteBudgetMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/budget-items/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject?.id, 'budget'] });
      toast({
        title: "Budget Item Deleted",
        description: "The budget item has been removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete budget item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddBudget = () => {
    if (!budgetForm.category || !budgetForm.item || !budgetForm.estimatedCost) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const estimatedCost = parseFloat(cleanCurrency(budgetForm.estimatedCost));
    const actualCost = budgetForm.actualCost ? parseFloat(cleanCurrency(budgetForm.actualCost)) : 0;

    if (isNaN(estimatedCost)) {
      toast({
        title: "Error",
        description: "Please enter a valid estimated cost",
        variant: "destructive",
      });
      return;
    }

    createBudgetMutation.mutate({
      category: budgetForm.category,
      item: budgetForm.item,
      estimatedCost,
      actualCost,
      vendor: budgetForm.vendor || null,
      notes: budgetForm.notes || null,
      isPaid: false
    });
  };

  const handleEditBudget = () => {
    if (!editForm.category || !editForm.item || !editForm.estimatedCost) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const estimatedCost = parseFloat(cleanCurrency(editForm.estimatedCost));
    const actualCost = editForm.actualCost ? parseFloat(cleanCurrency(editForm.actualCost)) : 0;

    if (isNaN(estimatedCost)) {
      toast({
        title: "Error",
        description: "Please enter a valid estimated cost",
        variant: "destructive",
      });
      return;
    }

    updateBudgetMutation.mutate({
      id: editingItem.id,
      data: {
        category: editForm.category,
        item: editForm.item,
        estimatedCost,
        actualCost,
        vendor: editForm.vendor || null,
        notes: editForm.notes || null,
        isPaid: editForm.isPaid
      }
    });
  };

  const handleExportBudget = () => {
    if (!budgetItems || budgetItems.length === 0) {
      toast({
        title: "No Data",
        description: "No budget items to export",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Category', 'Item', 'Estimated Cost', 'Actual Cost', 'Vendor', 'Status', 'Notes'].join(','),
      ...budgetItems.map((item: any) => [
        item.category,
        item.item,
        item.estimatedCost,
        item.actualCost || 0,
        item.vendor || '',
        item.isPaid ? 'Paid' : 'Pending',
        item.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wedding-budget.csv';
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Budget Exported",
      description: "Your budget has been exported successfully",
    });
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setEditForm({
      category: item.category,
      item: item.item,
      estimatedCost: item.estimatedCost.toString(),
      actualCost: item.actualCost ? item.actualCost.toString() : "",
      vendor: item.vendor || "",
      notes: item.notes || "",
      isPaid: item.isPaid || false
    });
    setIsEditDialogOpen(true);
  };

  const filteredSortedItems = budgetItems?.filter((item: any) => {
    const matchesSearch = item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.vendor && item.vendor.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a: any, b: any) => a.category.localeCompare(b.category));

  const getBudgetItemsByCategory = (category: string) => {
    return filteredSortedItems?.filter((item: any) => item.category === category) || [];
  };

  // Calculate totals with proper number parsing
  const totalEstimated = budgetItems?.reduce((sum: number, item: any) => {
    const cost = parseFloat(item.estimatedCost) || 0;
    return sum + cost;
  }, 0) || 0;
  
  const totalActual = budgetItems?.reduce((sum: number, item: any) => {
    const cost = parseFloat(item.actualCost) || 0;
    return sum + cost;
  }, 0) || 0;
  
  const budgetDifference = totalEstimated - totalActual;
  const budgetUsagePercentage = totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0;

  const formatCurrency = (amount: number | string) => {
    const num = parseFloat(String(amount)) || 0;
    return `$${Math.round(num).toLocaleString()}`;
  };

  const cleanCurrency = (value: string) => {
    return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  };

  const categoryBreakdown = budgetCategories.map(category => {
    const items = getBudgetItemsByCategory(category);
    if (items.length === 0) return null;
    
    const estimatedCost = items.reduce((sum: number, item: any) => sum + (parseFloat(item.estimatedCost) || 0), 0);
    const actualCost = items.reduce((sum: number, item: any) => sum + (parseFloat(item.actualCost) || 0), 0);
    
    if (estimatedCost > 0) {
      return {
        category,
        itemCount: items.length,
        estimated: estimatedCost,
        actual: actualCost,
        percentage: totalEstimated > 0 ? Math.round((estimatedCost / totalEstimated) * 100) : 0,
        status: actualCost === 0 ? 'pending' : 
                actualCost > estimatedCost ? 'over' : 'under'
      };
    }
    return null;
  }).filter(Boolean);

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

  // Always render header - even when loading


  return (
    <div className="p-3 sm:p-6 mobile-safe-spacing">
      <div className="max-w-7xl mx-auto">
        {/* Header Section - EXACT SAME AS GUEST LIST */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-rose-500 rounded-lg">
                <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-4xl font-semibold text-gray-900 tracking-tight">
                  Budget
                </h1>
                <p className="text-gray-600 text-xs md:text-lg mt-1">
                  Track your spending and stay on budget
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2 md:space-x-3 w-full md:w-auto">
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
            </CardContent>
        </Card>

        {/* Budget Tabs */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="list" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Budget List</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Search budget items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {budgetCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget Items List */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Items ({filteredSortedItems?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!filteredSortedItems || filteredSortedItems.length === 0 ? (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No budget items found matching your criteria.</p>
                    </div>
                  ) : (
                    filteredSortedItems.map((item: any) => (
                      <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-gray-900">{item.item}</h3>
                              <Badge variant="outline">{item.category}</Badge>
                              {item.isPaid && <Badge className="bg-green-100 text-green-800">Paid</Badge>}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><span className="font-medium">Estimated:</span> {formatCurrency(item.estimatedCost)}</p>
                              {item.actualCost > 0 && (
                                <p><span className="font-medium">Actual:</span> {formatCurrency(item.actualCost)}</p>
                              )}
                              {item.vendor && <p><span className="font-medium">Vendor:</span> {item.vendor}</p>}
                              {item.notes && <p><span className="font-medium">Notes:</span> {item.notes}</p>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteBudgetMutation.mutate(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <BudgetCharts budgetItems={budgetItems || []} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span>Budget Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">💡 Cost Saving Tip</h4>
                      <p className="text-sm text-blue-700">
                        Consider booking vendors during off-peak seasons for potential savings of 15-25%.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">✅ Budget Health</h4>
                      <p className="text-sm text-green-700">
                        Your current spending is well within budget. Great job staying on track!
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-medium text-amber-900 mb-2">⚠️ Upcoming Expenses</h4>
                    <p className="text-sm text-amber-700">
                      Remember to factor in gratuities (typically 15-20%) and unexpected costs (budget 5-10% buffer).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Budget Item Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Budget Item</DialogTitle>
              <DialogDescription>
                Add a new expense to your wedding budget.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category *</label>
                <Select 
                  value={budgetForm.category} 
                  onValueChange={(value) => setBudgetForm({...budgetForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Item *</label>
                <Input
                  placeholder="e.g., Wedding venue"
                  value={budgetForm.item}
                  onChange={(e) => setBudgetForm({...budgetForm, item: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Estimated Cost *</label>
                <Input
                  placeholder="e.g., 5000"
                  value={budgetForm.estimatedCost}
                  onChange={(e) => setBudgetForm({...budgetForm, estimatedCost: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Actual Cost</label>
                <Input
                  placeholder="e.g., 4800"
                  value={budgetForm.actualCost}
                  onChange={(e) => setBudgetForm({...budgetForm, actualCost: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Vendor</label>
                <Input
                  placeholder="e.g., Amazing Venues LLC"
                  value={budgetForm.vendor}
                  onChange={(e) => setBudgetForm({...budgetForm, vendor: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Additional notes..."
                  value={budgetForm.notes}
                  onChange={(e) => setBudgetForm({...budgetForm, notes: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBudget} disabled={createBudgetMutation.isPending}>
                {createBudgetMutation.isPending ? "Adding..." : "Add Item"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Budget Item Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Budget Item</DialogTitle>
              <DialogDescription>
                Update the details of your budget item.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category *</label>
                <Select 
                  value={editForm.category} 
                  onValueChange={(value) => setEditForm({...editForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Item *</label>
                <Input
                  placeholder="e.g., Wedding venue"
                  value={editForm.item}
                  onChange={(e) => setEditForm({...editForm, item: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Estimated Cost *</label>
                <Input
                  placeholder="e.g., 5000"
                  value={editForm.estimatedCost}
                  onChange={(e) => setEditForm({...editForm, estimatedCost: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Actual Cost</label>
                <Input
                  placeholder="e.g., 4800"
                  value={editForm.actualCost}
                  onChange={(e) => setEditForm({...editForm, actualCost: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Vendor</label>
                <Input
                  placeholder="e.g., Amazing Venues LLC"
                  value={editForm.vendor}
                  onChange={(e) => setEditForm({...editForm, vendor: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Additional notes..."
                  value={editForm.notes}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPaid"
                  checked={editForm.isPaid}
                  onCheckedChange={(checked) => setEditForm({...editForm, isPaid: !!checked})}
                />
                <label htmlFor="isPaid" className="text-sm font-medium">
                  Mark as paid
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditBudget} disabled={updateBudgetMutation.isPending}>
                {updateBudgetMutation.isPending ? "Updating..." : "Update Item"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}