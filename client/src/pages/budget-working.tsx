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
  
  // Get current project
  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    enabled: true,
  });

  const currentProject = projects?.find(p => p.name === "Emma & Jake's Wedding") || projects?.[0];

  // Get budget items for current project
  const { data: budgetItems, error: budgetError, isLoading: budgetLoading } = useQuery({
    queryKey: ['/api/projects', currentProject?.id, 'budget'],
    enabled: !!currentProject?.id,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Budget creation mutation
  const createBudgetMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/budget-items', {
      method: 'POST',
      body: JSON.stringify(data),
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
        vendor: "",
        notes: ""
      });
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to add budget item",
        variant: "destructive",
      });
    }
  });

  // Budget edit mutation
  const editBudgetMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest(`/api/budget-items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', currentProject?.id, 'budget'] });
      toast({
        title: "Budget Item Updated",
        description: "Your budget item has been updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update budget item",
        variant: "destructive",
      });
    }
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
        description: "Your budget item has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete budget item",
        variant: "destructive",
      });
    }
  });

  const budgetCategories = [
    "Venue", "Catering", "Photography", "Music", "Flowers", "Attire", 
    "Transportation", "Invitations", "Rings", "Beauty", "Decorations", "Other"
  ];

  if (budgetLoading) {
    return <LoadingSpinner />;
  }

  if (budgetError || !currentProject) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 overflow-y-auto lg:ml-64">
          <Header />
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
        </main>
        <MobileNav />
      </div>
    );
  }

  const totalBudget = currentProject?.budget ? parseFloat(currentProject.budget) : 0;
  const totalSpent = budgetItems?.reduce((sum: number, item: any) => sum + (parseFloat(item.actualCost) || 0), 0) || 0;
  const remaining = totalBudget - totalSpent;

  // Group items by category
  const categorizedItems = budgetCategories.map(category => {
    const items = budgetItems?.filter((item: any) => item.category === category) || [];
    const categoryTotal = items.reduce((sum: number, item: any) => sum + (parseFloat(item.estimatedCost) || 0), 0);
    const categorySpent = items.reduce((sum: number, item: any) => sum + (parseFloat(item.actualCost) || 0), 0);
    
    return {
      name: category,
      items,
      total: categoryTotal,
      spent: categorySpent,
      count: items.length
    };
  }).filter(category => category.count > 0);

  const handleAddBudgetItem = () => {
    if (!budgetForm.category || !budgetForm.item || !budgetForm.estimatedCost) {
      toast({
        title: "Missing Information",
        description: "Please fill in category, item name, and estimated cost",
        variant: "destructive",
      });
      return;
    }
    
    createBudgetMutation.mutate({
      projectId: currentProject.id,
      category: budgetForm.category,
      item: budgetForm.item,
      estimatedCost: budgetForm.estimatedCost,
      vendor: budgetForm.vendor || null,
      notes: budgetForm.notes || null,
      isPaid: false,
      actualCost: null
    });
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setEditForm({
      category: item.category || "",
      item: item.item || "",
      estimatedCost: item.estimatedCost || "",
      actualCost: item.actualCost || "",
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

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <main className="flex-1 overflow-y-auto lg:ml-64">
        <Header />
        <div className="p-4 sm:p-6 mobile-padding">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
                  <Progress value={(totalSpent / totalBudget) * 100} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                  {remaining < 0 ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : (
                    <DollarSign className="h-4 w-4 text-green-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${Math.abs(remaining).toLocaleString()}
                  </div>
                  {remaining < 0 && (
                    <p className="text-xs text-red-600 mt-1">Over budget</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Add Budget Item Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">Budget Breakdown</h2>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="gradient-blush-rose text-white touch-manipulation"
              >
                <Plus size={16} className="mr-2" />
                Add Expense
              </Button>
            </div>

            {/* Budget Categories */}
            <div className="space-y-4">
              {categorizedItems.length === 0 ? (
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center">
                      <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No expenses yet</h3>
                      <p className="text-gray-500 mb-6">Start tracking your wedding expenses by adding budget items.</p>
                      <Button 
                        onClick={() => setIsAddDialogOpen(true)}
                        className="gradient-blush-rose text-white"
                      >
                        <Plus className="mr-2" size={16} />
                        Add First Expense
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                categorizedItems.map((category) => (
                  <Card key={category.name} className="overflow-hidden">
                    <CardHeader 
                      className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setExpandedCategory(
                        expandedCategory === category.name ? null : category.name
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {expandedCategory === category.name ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                            {category.count} items
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            ${category.spent.toLocaleString()} / ${category.total.toLocaleString()}
                          </div>
                          <Progress 
                            value={category.total > 0 ? (category.spent / category.total) * 100 : 0} 
                            className="w-24 h-2"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    
                    {expandedCategory === category.name && (
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {category.items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <h4 className="font-medium text-gray-800">{item.item}</h4>
                                  {item.isPaid && (
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                      <Check className="inline w-3 h-3 mr-1" />
                                      Paid
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  <span>Budget: ${parseFloat(item.estimatedCost || 0).toLocaleString()}</span>
                                  {item.actualCost && (
                                    <span className="ml-3">
                                      Actual: ${parseFloat(item.actualCost).toLocaleString()}
                                    </span>
                                  )}
                                  {item.vendor && (
                                    <span className="ml-3">Vendor: {item.vendor}</span>
                                  )}
                                </div>
                                {item.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditItem(item)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteItem(item)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>

            {/* Add Budget Item Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Budget Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={budgetForm.category} onValueChange={(value) => setBudgetForm({ ...budgetForm, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="item">Item Name</Label>
                    <Input
                      id="item"
                      value={budgetForm.item}
                      onChange={(e) => setBudgetForm({ ...budgetForm, item: e.target.value })}
                      placeholder="e.g., Reception venue booking"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="estimatedCost">Estimated Cost</Label>
                    <Input
                      id="estimatedCost"
                      type="number"
                      value={budgetForm.estimatedCost}
                      onChange={(e) => setBudgetForm({ ...budgetForm, estimatedCost: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="vendor">Vendor (Optional)</Label>
                    <Input
                      id="vendor"
                      value={budgetForm.vendor}
                      onChange={(e) => setBudgetForm({ ...budgetForm, vendor: e.target.value })}
                      placeholder="Vendor name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={budgetForm.notes}
                      onChange={(e) => setBudgetForm({ ...budgetForm, notes: e.target.value })}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddBudgetItem}
                    className="gradient-blush-rose text-white"
                    disabled={createBudgetMutation.isPending}
                  >
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
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-item">Item Name</Label>
                    <Input
                      id="edit-item"
                      value={editForm.item}
                      onChange={(e) => setEditForm({ ...editForm, item: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-estimated">Estimated Cost</Label>
                    <Input
                      id="edit-estimated"
                      type="number"
                      value={editForm.estimatedCost}
                      onChange={(e) => setEditForm({ ...editForm, estimatedCost: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-actual">Actual Cost</Label>
                    <Input
                      id="edit-actual"
                      type="number"
                      value={editForm.actualCost}
                      onChange={(e) => setEditForm({ ...editForm, actualCost: e.target.value })}
                      placeholder="Enter actual amount spent"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-vendor">Vendor</Label>
                    <Input
                      id="edit-vendor"
                      value={editForm.vendor}
                      onChange={(e) => setEditForm({ ...editForm, vendor: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-notes">Notes</Label>
                    <Input
                      id="edit-notes"
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
                      className="touch-manipulation"
                    />
                    <Label htmlFor="edit-paid">Mark as Paid</Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateBudgetItem}
                    className="gradient-blush-rose text-white"
                    disabled={editBudgetMutation.isPending}
                  >
                    {editBudgetMutation.isPending ? "Updating..." : "Update Item"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}