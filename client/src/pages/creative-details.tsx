import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type CreativeDetail, type InsertCreativeDetail } from "@shared/schema";
import { ChevronDown, ChevronRight, Plus, Upload, User, Calendar, Edit, Trash2, CheckCircle, Clock } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";

// Category definitions with icons and metadata - matching PlanHaus aesthetic
const categories = [
  {
    id: 'signature_drinks',
    title: 'Signature Drinks',
    icon: '🍹',
    description: 'Custom cocktails and special beverages for your wedding',
    color: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:shadow-lg',
  },
  {
    id: 'signage',
    title: 'Signage',
    icon: '🪧',
    description: 'Welcome signs, directional signage, and custom displays',
    color: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg',
  },
  {
    id: 'guestbook',
    title: 'Guestbook',
    icon: '📖',
    description: 'Creative alternatives to traditional guest books',
    color: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 hover:shadow-lg',
  },
  {
    id: 'must_have_photos',
    title: 'Must-Have Photos',
    icon: '📸',
    description: 'Essential photo moments and shot lists',
    color: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg',
  },
  {
    id: 'color_palette',
    title: 'Color Palette',
    icon: '🎨',
    description: 'Wedding colors, themes, and design inspiration',
    color: 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 hover:shadow-lg',
  },
  {
    id: 'diy_projects',
    title: 'DIY Projects',
    icon: '✂️',
    description: 'Handmade decorations and craft projects',
    color: 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:shadow-lg',
  },
  {
    id: 'favors',
    title: 'Favors',
    icon: '🎁',
    description: 'Personalized wedding favors and guest gifts',
    color: 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 hover:shadow-lg',
  },
  {
    id: 'special_songs',
    title: 'Special Songs',
    icon: '🎶',
    description: 'Music playlist and meaningful songs',
    color: 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 hover:shadow-lg',
  },
];

interface CreativeDetailFormData {
  category: string;
  title: string;
  description?: string;
  notes?: string;
  assignedTo?: number;
  dueDate?: string;
  priority: string;
  tags: string[];
}

export default function CreativeDetails() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<CreativeDetail | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<{[key: number]: boolean}>({});
  const [formData, setFormData] = useState<CreativeDetailFormData>({
    category: '',
    title: '',
    description: '',
    notes: '',
    priority: 'medium',
    tags: [],
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch creative details
  const { data: details = [], isLoading } = useQuery({
    queryKey: ['/api/creative-details'],
    select: (data) => data as CreativeDetail[]
  });

  // Create/update mutation
  const createDetailMutation = useMutation({
    mutationFn: async (data: InsertCreativeDetail) => {
      const url = editingDetail ? `/api/creative-details/${editingDetail.id}` : '/api/creative-details';
      const method = editingDetail ? 'PUT' : 'POST';
      return apiRequest(url, { method, body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/creative-details'] });
      setIsFormOpen(false);
      setEditingDetail(null);
      resetForm();
      toast({
        title: editingDetail ? 'Detail updated!' : 'Detail created!',
        description: `Your creative detail has been ${editingDetail ? 'updated' : 'added'} successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save creative detail',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteDetailMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/creative-details/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/creative-details'] });
      toast({
        title: 'Detail deleted',
        description: 'Creative detail has been removed successfully.',
      });
    },
  });

  // File upload for creative details
  const uploadFile = async (file: File, detailId: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('detailId', detailId.toString());

    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch('/api/creative-details/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/creative-details'] });
      return result;
    } catch (error) {
      throw error;
    }
  };

  // File dropzone for individual details
  const createFileDropzone = (detailId: number) => {
    const onDrop = async (acceptedFiles: File[]) => {
      setUploadingFiles(prev => ({ ...prev, [detailId]: true }));
      
      try {
        for (const file of acceptedFiles) {
          await uploadFile(file, detailId);
        }
        toast({
          title: 'Files uploaded!',
          description: `${acceptedFiles.length} file(s) uploaded successfully.`,
        });
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload files. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setUploadingFiles(prev => ({ ...prev, [detailId]: false }));
      }
    };

    return useDropzone({
      onDrop,
      accept: {
        'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
        'application/pdf': ['.pdf'],
        'text/*': ['.txt', '.csv'],
      },
      maxSize: 10 * 1024 * 1024, // 10MB
      multiple: true,
    });
  };

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

  const openEditForm = (detail: CreativeDetail) => {
    setEditingDetail(detail);
    setFormData({
      category: detail.category,
      title: detail.title,
      description: detail.description || '',
      notes: detail.notes || '',
      assignedTo: detail.assignedTo || undefined,
      dueDate: detail.dueDate ? new Date(detail.dueDate).toISOString().split('T')[0] : '',
      priority: detail.priority || 'medium',
      tags: detail.tags || [],
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
      tags: [],
    });
    setSelectedCategory('');
    setEditingDetail(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: InsertCreativeDetail = {
      projectId: 1, // Current project
      category: formData.category,
      title: formData.title,
      description: formData.description || null,
      notes: formData.notes || null,
      assignedTo: formData.assignedTo || null,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      priority: formData.priority,
      tags: formData.tags,
      createdBy: 1, // Current user
    };

    createDetailMutation.mutate(submitData);
  };

  const getDetailsForCategory = (categoryId: string) => {
    return details?.filter(detail => detail.category === categoryId) || [];
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Enhanced Header with PlanHaus styling */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Creative Details</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Organize all the special touches that make your wedding uniquely yours</p>
        
        {/* Summary Stats */}
        <div className="flex justify-center space-x-8 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text bg-gradient-to-r from-blush to-rose-gold">
              {details?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Total Details</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text bg-gradient-to-r from-champagne to-sage">
              {categories.length}
            </div>
            <div className="text-sm text-gray-500">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text bg-gradient-to-r from-sage to-blush">
              {details?.filter(d => d.dueDate && new Date(d.dueDate) < new Date()).length || 0}
            </div>
            <div className="text-sm text-gray-500">Due Soon</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const categoryDetails = getDetailsForCategory(category.id);
          const isExpanded = expandedCategories.has(category.id);
          
          return (
            <Card key={category.id} className={`${category.color} transition-all duration-300 transform hover:scale-[1.02] rounded-2xl shadow-md`}>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {categoryDetails.length} {categoryDetails.length === 1 ? 'item' : 'items'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateForm(category.id);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  {categoryDetails.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No {category.title.toLowerCase()} added yet</p>
                      <Button
                        onClick={() => openCreateForm(category.id)}
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First {category.title.slice(0, -1)}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categoryDetails.map((detail) => {
                        const dropzone = createFileDropzone(detail.id);
                        const isUploading = uploadingFiles[detail.id];
                        
                        return (
                          <div
                            key={detail.id}
                            className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{detail.title}</h3>
                                {detail.description && (
                                  <p className="text-gray-600 text-sm mt-1">{detail.description}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditForm(detail)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteDetailMutation.mutate(detail.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                              {detail.priority && (
                                <Badge className={getPriorityColor(detail.priority)}>
                                  {detail.priority}
                                </Badge>
                              )}
                              {detail.dueDate && (
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(detail.dueDate)}
                                </div>
                              )}
                              {detail.assignedTo && (
                                <div className="flex items-center">
                                  <User className="w-4 h-4 mr-1" />
                                  Assigned
                                </div>
                              )}
                              {detail.isCompleted ? (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Completed
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  In Progress
                                </div>
                              )}
                            </div>

                            {detail.notes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-700">{detail.notes}</p>
                              </div>
                            )}

                            {/* File Upload Area */}
                            <div className="mt-4">
                              <div
                                {...dropzone.getRootProps()}
                                className={`
                                  border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all
                                  ${dropzone.isDragActive 
                                    ? 'border-blue-400 bg-blue-50' 
                                    : 'border-gray-300 hover:border-gray-400'
                                  }
                                  ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                              >
                                <input {...dropzone.getInputProps()} disabled={isUploading} />
                                <Upload className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  {isUploading 
                                    ? 'Uploading...' 
                                    : dropzone.isDragActive 
                                    ? 'Drop files here...' 
                                    : 'Drop files or click to upload'
                                  }
                                </p>
                              </div>

                              {(detail.imageUrl || detail.fileUrl) && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {detail.imageUrl && (
                                    <img 
                                      src={detail.imageUrl} 
                                      alt={detail.title}
                                      className="w-20 h-20 object-cover rounded border"
                                    />
                                  )}
                                  {detail.fileUrl && (
                                    <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
                                      <span className="text-sm">{detail.fileName}</span>
                                      <a 
                                        href={detail.fileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                      >
                                        View
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDetail ? 'Edit' : 'Add'} {categories.find(c => c.id === formData.category)?.title || 'Creative Detail'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive title..."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this item..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes, instructions, or ideas..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDetailMutation.isPending}
                className="gradient-blush-rose text-white"
              >
                {createDetailMutation.isPending 
                  ? 'Saving...' 
                  : editingDetail 
                  ? 'Update' 
                  : 'Create'
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}