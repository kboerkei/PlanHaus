import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Simple API functions for creative details
const getCreativeDetails = async () => {
  const sessionId = localStorage.getItem('sessionId') || 'demo_session';
  const response = await fetch('/api/creative-details', {
    headers: { Authorization: `Bearer ${sessionId}` }
  });
  if (!response.ok) throw new Error('Failed to fetch creative details');
  return response.json();
};

const createCreativeDetail = async (detail: any) => {
  const sessionId = localStorage.getItem('sessionId') || 'demo_session';
  const response = await fetch('/api/creative-details', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionId}`
    },
    body: JSON.stringify(detail)
  });
  if (!response.ok) throw new Error('Failed to create creative detail');
  return response.json();
};

const updateCreativeDetail = async (id: number, updates: any) => {
  const sessionId = localStorage.getItem('sessionId') || 'demo_session';
  const response = await fetch(`/api/creative-details/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionId}`
    },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update creative detail');
  return response.json();
};

const deleteCreativeDetail = async (id: number) => {
  const sessionId = localStorage.getItem('sessionId') || 'demo_session';
  const response = await fetch(`/api/creative-details/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${sessionId}` }
  });
  if (!response.ok) throw new Error('Failed to delete creative detail');
  return response.json();
};

// Simple category definitions
const categories = [
  {
    id: 'signature_drinks',
    title: 'Signature Drinks',
    icon: '🍹',
    description: 'Custom cocktails for your special day',
    color: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',
  },
  {
    id: 'signage',
    title: 'Signage & Paper Goods',
    icon: '🪧',
    description: 'Welcome signs, table numbers, and decorative elements',
    color: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
  },
  {
    id: 'small_details',
    title: 'Small Details',
    icon: '📝',
    description: 'Wedding day logistics and important questions',
    color: 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200',
  },
  {
    id: 'favors',
    title: 'Welcome Bags & Favors',
    icon: '🎁',
    description: 'Thank you gifts and welcome bag contents',
    color: 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200',
  },
  {
    id: 'must_have_photos',
    title: 'Must-Have Photos',
    icon: '📸',
    description: 'Important shots you don\'t want to miss',
    color: 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200',
  },
  {
    id: 'special_songs',
    title: 'Special Songs',
    icon: '🎵',
    description: 'Music for key moments throughout your day',
    color: 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200',
  },
  {
    id: 'color_palette',
    title: 'Moodboard / Color Palette',
    icon: '🎨',
    description: 'Your wedding color scheme and visual inspiration',
    color: 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200',
  },
  {
    id: 'diy_projects',
    title: 'DIY Projects',
    icon: '🔨',
    description: 'Handmade touches and crafting projects',
    color: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200',
  },
  {
    id: 'special_touches',
    title: 'Special Touches',
    icon: '✨',
    description: 'Unity ceremony, guestbook, cake topper, and extra magic',
    color: 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200',
  }
];

interface CreativeDetailFormData {
  category: string;
  title: string;
  description: string;
  notes: string;
  priority: string;
  status: string;
}

const CreativeDetailsPage: React.FC = () => {
  const { toast } = useToast();
  
  const { data: details, isLoading, error } = useQuery({
    queryKey: ['creative-details'],
    queryFn: getCreativeDetails
  });

  // Fetch intake data to populate basic information
  const { data: intakeData } = useQuery({
    queryKey: ['intake'],
    queryFn: async () => {
      const sessionId = localStorage.getItem('sessionId') || 'demo_session';
      const response = await fetch('/api/intake', {
        headers: { Authorization: `Bearer ${sessionId}` }
      });
      if (!response.ok) throw new Error('Failed to fetch intake data');
      return response.json();
    }
  });

  // Fetch project data for additional wedding details
  const { data: project } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const sessionId = localStorage.getItem('sessionId') || 'demo_session';
      const response = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${sessionId}` }
      });
      if (!response.ok) throw new Error('Failed to fetch projects');
      const projects = await response.json();
      return projects[0]; // Get the first project
    }
  });

  const queryClient = useQueryClient();
  
  const createDetailMutation = useMutation({
    mutationFn: createCreativeDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-details'] });
      toast({
        title: "Success",
        description: "Creative detail added successfully",
      });
      setIsFormOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateDetailMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) => updateCreativeDetail(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-details'] });
      toast({
        title: "Success",
        description: "Creative detail updated successfully",
      });
      setIsFormOpen(false);
      resetForm();
    }
  });

  const deleteDetailMutation = useMutation({
    mutationFn: deleteCreativeDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-details'] });
      toast({
        title: "Success",
        description: "Creative detail deleted successfully",
      });
    }
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState<CreativeDetailFormData>({
    category: '',
    title: '',
    description: '',
    notes: '',
    priority: 'medium',
    status: 'Not Started'
  });

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const openCreateForm = (category: string) => {
    setSelectedCategory(category);
    setFormData({ ...formData, category });
    setIsFormOpen(true);
  };

  const openEditForm = (detail: any) => {
    setEditingDetail(detail);
    setFormData({
      category: detail.category,
      title: detail.title,
      description: detail.description || '',
      notes: detail.notes || '',
      priority: detail.priority || 'medium',
      status: detail.status || 'Not Started'
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      title: '',
      description: '',
      notes: '',
      priority: 'medium',
      status: 'Not Started'
    });
    setSelectedCategory('');
    setEditingDetail(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      projectId: 1, // Current project
      category: formData.category,
      title: formData.title,
      description: formData.description || null,
      notes: formData.notes || null,
      priority: formData.priority,
      status: formData.status,
      tags: [],
      createdBy: 1, // Current user
    };

    if (editingDetail) {
      updateDetailMutation.mutate({ id: editingDetail.id, updates: submitData });
    } else {
      createDetailMutation.mutate(submitData);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteDetailMutation.mutate(id);
    }
  };

  const getDetailsForCategory = (categoryId: string) => {
    return details?.filter((detail: any) => detail.category === categoryId) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load Creative Details</h2>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4 flex items-center justify-center">
          ❤️ The Details
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Organize all the special touches that make your wedding uniquely yours
        </p>
      </div>

      {/* Basic Information Section */}
      <Card className="mb-8 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-serif">
            📅 Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
              <span className="text-gray-700">Wedding Date:</span>
              <span className="font-medium">
                {intakeData?.weddingDate ? 
                  format(new Date(intakeData.weddingDate), 'MMMM d, yyyy') : 
                  project?.date ? 
                    format(new Date(project.date), 'MMMM d, yyyy') : 
                    'Not set'
                }
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
              <span className="text-gray-700">Ceremony Location:</span>
              <span className="font-medium">
                {intakeData?.ceremonyLocation || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
              <span className="text-gray-700">Cocktail Hour Location:</span>
              <span className="font-medium">
                {intakeData?.ceremonyLocation || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
              <span className="text-gray-700">Reception Location:</span>
              <span className="font-medium">
                {intakeData?.receptionLocation || 'Not set'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wedding Party Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-serif text-purple-700">
              👰 Bridesmaids
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
              <span className="text-gray-700">Bride's Party:</span>
              <span className="font-medium">
                {intakeData?.weddingParty ? 
                  intakeData.weddingParty.filter((member: any) => member.role?.toLowerCase().includes('bride')).length + ' members' :
                  'Not set'
                }
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-serif text-blue-700">
              🤵 Groomsmen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
              <span className="text-gray-700">Groom's Party:</span>
              <span className="font-medium">
                {intakeData?.weddingParty ? 
                  intakeData.weddingParty.filter((member: any) => member.role?.toLowerCase().includes('groom')).length + ' members' :
                  'Not set'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryDetails = getDetailsForCategory(category.id);
          const isExpanded = expandedCategories.has(category.id);

          return (
            <Card key={category.id} className={`${category.color} transition-all duration-200`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <CardTitle className="text-lg font-serif">{category.title}</CardTitle>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-white/80">
                      {categoryDetails.length} items
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCreateForm(category.id)}
                      className="bg-white/80 hover:bg-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategory(category.id)}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${category.title} category`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  {categoryDetails.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No items in this category yet.</p>
                      <Button
                        variant="ghost"
                        onClick={() => openCreateForm(category.id)}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add your first item
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categoryDetails.map((detail: any) => (
                        <div
                          key={detail.id}
                          className="bg-white/60 p-4 rounded-lg border border-white/40"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{detail.title}</h4>
                              {detail.description && (
                                <p className="text-sm text-gray-600 mt-1">{detail.description}</p>
                              )}
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={getStatusColor(detail.status)}>
                                  {detail.status === 'Complete' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {detail.status === 'In Progress' && <Clock className="h-3 w-3 mr-1" />}
                                  {detail.status}
                                </Badge>
                                <Badge className={getPriorityColor(detail.priority)}>
                                  {detail.priority}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditForm(detail)}
                                aria-label={`Edit ${detail.title}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(detail.id)}
                                aria-label={`Delete ${detail.title}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDetail ? 'Edit Creative Detail' : 'Add Creative Detail'}
            </DialogTitle>
            <DialogDescription>
              {editingDetail ? 'Update your creative wedding detail information.' : 'Add a new creative detail to personalize your wedding.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createDetailMutation.isPending || updateDetailMutation.isPending}
              >
                {editingDetail ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreativeDetailsPage;