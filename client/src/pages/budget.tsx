import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import LoadingSpinner from "@/components/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DollarSign, Plus, TrendingUp, AlertTriangle, ChevronDown, ChevronRight, Edit2, Trash2, Check, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Budget() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    category: "",
    item: "",
    estimatedCost: "",
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
    
    // Convert form data to match the API schema
    const budgetData = {
      category: budgetForm.category,
      item: budgetForm.item,
      estimatedCost: budgetForm.estimatedCost,
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
    editBudgetMutation.mutate({
      id: editingItem.id,
      data: {
        ...editForm,
        estimatedCost: editForm.estimatedCost,
        actualCost: editForm.actualCost || null
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
    return budgetItems?.filter((item: any) => item.category === category) || [];
  };

  // Fetch wedding project data
  const { data: weddingProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/wedding-projects'],
  });

  // Fetch budget items
  const { data: budgetItems, isLoading: budgetLoading, error: budgetError } = useQuery({
    queryKey: ['/api/budget-items'],
  });

  const currentProject = weddingProjects?.[0];
  const totalBudget = currentProject?.budget ? parseFloat(currentProject.budget) : 0;
  const totalSpent = budgetItems?.reduce((sum: number, item: any) => sum + (item.actualCost || 0), 0) || 0;
  const remaining = totalBudget - totalSpent;

  // Handle null or error states
  if (budgetError || budgetItems === null) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Header />
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Budget Management</h3>
                <p className="text-gray-600 mb-6">Start tracking your wedding expenses and stay within budget.</p>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="gradient-blush-rose text-white"
                >
                  <Plus size={16} className="mr-2" />
                  Add First Budget Item
                </Button>
              </div>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  // Group budget items by category
  const budgetCategories = budgetItems ? 
    budgetItems.reduce((acc: any[], item: any) => {
      const existingCategory = acc.find(cat => cat.category === item.category);
      if (existingCategory) {
        existingCategory.estimated += item.estimatedCost || 0;
        existingCategory.actual += item.actualCost || 0;
      } else {
        acc.push({
          id: item.id,
          category: item.category,
          estimated: item.estimatedCost || 0,
          actual: item.actualCost || 0,
          percentage: totalBudget > 0 ? Math.round(((item.estimatedCost || 0) / totalBudget) * 100) : 0,
          status: (item.actualCost || 0) === 0 ? 'pending' : 
                  (item.actualCost || 0) > (item.estimatedCost || 0) ? 'over' : 'under'
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
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Header />
          <div className="p-6">
            <div className="text-center py-12">
              <LoadingSpinner size="lg" text="Loading your budget information..." />
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }



  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <Header />
        
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-serif text-3xl font-semibold text-gray-800 mb-2">
                  Wedding Budget
                </h1>
                <p className="text-gray-600">
                  Track your spending and stay on budget
                </p>
              </div>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="gradient-blush-rose text-white"
              >
                <Plus size={16} className="mr-2" />
                Add Expense
              </Button>
            </div>

            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <DollarSign className="text-blush" size={20} />
                    <span>Total Budget</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">
                    {totalBudget > 0 ? `$${totalBudget.toLocaleString()}` : 'Not Set'}
                  </div>
                  {totalBudget === 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      Complete your intake form to set budget
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <TrendingUp className="text-green-600" size={20} />
                    <span>Spent</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">
                    ${totalSpent.toLocaleString()}
                  </div>
                  {totalBudget > 0 && (
                    <Progress 
                      value={(totalSpent / totalBudget) * 100} 
                      className="mt-2"
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <DollarSign className="text-blue-600" size={20} />
                    <span>Remaining</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">
                    ${remaining.toLocaleString()}
                  </div>
                  {totalBudget > 0 && (
                    <div className="text-sm text-gray-600 mt-1">
                      {Math.round(((totalBudget - totalSpent) / totalBudget) * 100)}% of budget
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

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
                                      <div className="flex items-center justify-between mb-1">
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
                                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span>Est: ${(item.estimatedCost || 0).toLocaleString()}</span>
                                        <span>Actual: ${(item.actualCost || 0).toLocaleString()}</span>
                                        {item.isPaid && (
                                          <span className="flex items-center text-green-600">
                                            <Check size={14} className="mr-1" />
                                            Paid
                                          </span>
                                        )}
                                      </div>
                                      {item.vendor && (
                                        <div className="text-sm text-gray-500 mt-1">
                                          Vendor: {item.vendor}
                                        </div>
                                      )}
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
      </main>
      
      <MobileNav />

      {/* Add Budget Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Budget Item</DialogTitle>
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
            <div className="space-y-2">
              <Label htmlFor="budget-cost">Estimated Cost</Label>
              <Input
                id="budget-cost"
                type="number"
                placeholder="2500.00"
                value={budgetForm.estimatedCost}
                onChange={(e) => setBudgetForm({ ...budgetForm, estimatedCost: e.target.value })}
              />
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
            <div className="space-y-2">
              <Label htmlFor="edit-estimated-cost">Estimated Cost</Label>
              <Input
                id="edit-estimated-cost"
                type="number"
                placeholder="2500.00"
                value={editForm.estimatedCost}
                onChange={(e) => setEditForm({ ...editForm, estimatedCost: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-actual-cost">Actual Cost</Label>
              <Input
                id="edit-actual-cost"
                type="number"
                placeholder="2500.00"
                value={editForm.actualCost}
                onChange={(e) => setEditForm({ ...editForm, actualCost: e.target.value })}
              />
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
    </div>
  );
}