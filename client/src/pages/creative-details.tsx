import { useState, useEffect } from "react";
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
import { ChevronDown, ChevronRight, Plus, Upload, User, Calendar, Edit, Trash2, CheckCircle, Clock, AlertCircle, Users } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { 
  getCreativeDetails, 
  createCreativeDetail, 
  updateCreativeDetail, 
  deleteCreativeDetail,
  getCollaborators,
  canEdit,
  syncLocalStorageToSupabase,
  type Collaborator
} from '@/lib/supabase-creative-details';

// Enhanced category definitions with comprehensive fields and AI support
const categories = [
  {
    id: 'signature_drinks',
    title: 'Signature Drinks',
    icon: '🍹',
    description: 'Create custom cocktails for your special day',
    color: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:shadow-lg',
    fields: [
      { name: "drinkName", label: "Drink Name", type: "text", required: true },
      { name: "ingredients", label: "Ingredients", type: "textarea" },
      { name: "whoMaking", label: "Who is Making It", type: "text" },
      { name: "servingStyle", label: "Serving Style", type: "select", 
        options: ["Individual Cocktails", "Punch Bowl", "Signature Bar", "Welcome Drinks"] }
    ],
    hasAI: true
  },
  {
    id: 'signage',
    title: 'Signage & Paper Goods',
    icon: '🪧',
    description: 'Welcome signs, table numbers, and decorative elements',
    color: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg',
    fields: [
      { name: "itemName", label: "Item Name", type: "text", required: true, placeholder: "e.g. Welcome Sign" },
      { name: "textMockup", label: "Text Content", type: "textarea", placeholder: "What should it say?" },
      { name: "fontStyle", label: "Font/Style Notes", type: "text" },
      { name: "printVendor", label: "Print Vendor Info", type: "text" }
    ]
  },
  {
    id: 'invitations',
    title: 'Invitation Suite',
    icon: '💌',
    description: 'Save the dates, invites, and all paper goods',
    color: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg',
    fields: [
      { name: "itemList", label: "Item List", type: "textarea", placeholder: "Save the dates, invites, inserts, etc." },
      { name: "sendByDates", label: "Send-by Dates", type: "text" },
      { name: "designLink", label: "Design Inspiration Link", type: "text" },
      { name: "envelopeDetails", label: "Envelope Details", type: "textarea", placeholder: "Return address, stamp type, etc." }
    ]
  },
  {
    id: 'favors',
    title: 'Welcome Bags & Favors',
    icon: '🎁',
    description: 'Thank you gifts and welcome bag contents',
    color: 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 hover:shadow-lg',
    fields: [
      { name: "contentsList", label: "Contents List", type: "textarea", required: true },
      { name: "assemblyPlan", label: "Assembly Plan", type: "textarea" },
      { name: "notes", label: "Notes", type: "textarea", placeholder: "Custom tags, allergies, etc." },
      { name: "assignedCollaborator", label: "Assigned Collaborator", type: "text" }
    ]
  },
  {
    id: 'must_have_photos',
    title: 'Must-Have Photos',
    icon: '📸',
    description: 'Important shots you don\'t want to miss',
    color: 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:shadow-lg',
    fields: [
      { name: "photoDescription", label: "Photo Description", type: "text", required: true },
      { name: "moment", label: "Tag Moment", type: "select",
        options: ["Pre-Ceremony", "Getting Ready", "First Look", "Ceremony", "Golden Hour", "Reception", "Dancing", "Send-off"] },
      { name: "assignedPhotographer", label: "Assign to Photographer", type: "text" }
    ]
  },
  {
    id: 'special_songs',
    title: 'Special Songs',
    icon: '🎵',
    description: 'Music for key moments throughout your day',
    color: 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 hover:shadow-lg',
    fields: [
      { name: "moment", label: "Moment", type: "select", required: true,
        options: ["Aisle Walk", "First Dance", "Parent Dances", "Processional", "Ceremony", "Recessional", "Cocktail Hour", "Reception"] },
      { name: "songName", label: "Song Name", type: "text" },
      { name: "artist", label: "Artist", type: "text" }
    ],
    hasAI: true
  },
  {
    id: 'color_palette',
    title: 'Moodboard / Color Palette',
    icon: '🎨',
    description: 'Your wedding color scheme and visual inspiration',
    color: 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 hover:shadow-lg',
    fields: [
      { name: "pinterestLink", label: "Pinterest Link or Image Upload", type: "text", placeholder: "Paste Pinterest URL or upload images" },
      { name: "hexCodes", label: "HEX Codes", type: "text", placeholder: "#FFFFFF, #000000" },
      { name: "colorSwatches", label: "Color Swatches/Names", type: "text", placeholder: "Blush, Sage Green, Cream" }
    ],
    hasAI: true,
    aiLabel: "Generate palette from image"
  },
  {
    id: 'diy_projects',
    title: 'DIY Projects',
    icon: '🔨',
    description: 'Handmade touches and crafting projects',
    color: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 hover:shadow-lg',
    fields: [
      { name: "projectName", label: "Project Name", type: "text", required: true },
      { name: "materialsList", label: "Materials List", type: "textarea" },
      { name: "dueDate", label: "Due Date", type: "date" },
      { name: "assignedPerson", label: "Assigned Person", type: "text" },
      { name: "status", label: "Status", type: "select",
        options: ["Not Started", "In Progress", "Complete"] }
    ],
    hasAI: true
  },
  {
    id: 'special_touches',
    title: 'Special Touches',
    icon: '✨',
    description: 'Unity ceremony, guestbook, cake topper, and extra magic',
    color: 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 hover:shadow-lg',
    fields: [
      { name: "customNapkins", label: "Custom Napkins", type: "text" },
      { name: "unityCeremony", label: "Unity Ceremony Ideas", type: "textarea" },
      { name: "guestbookType", label: "Guestbook Type", type: "select",
        options: ["Traditional Book", "Photo Album", "Wishing Tree", "Polaroid Station", "Custom Canvas", "Digital Guestbook"] },
      { name: "cakeTopper", label: "Cake Topper", type: "text" },
      { name: "extraMagic", label: "Any Extra Magic", type: "textarea", placeholder: "Special surprises, unique touches, etc." }
    ]
  }
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
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [userCanEdit, setUserCanEdit] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  // Check authentication status
  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    const user = localStorage.getItem('user');
    const authenticated = !!(sessionId && user);
    setIsAuthenticated(authenticated);

    if (authenticated) {
      // Sync localStorage data to Supabase when authenticated
      syncLocalStorageToSupabase();
    }
  }, []);

  // Load collaborators and check permissions
  useEffect(() => {
    const loadCollaborators = async () => {
      try {
        const projectCollaborators = await getCollaborators(1); // Current project
        setCollaborators(projectCollaborators);
        
        const editPermission = await canEdit(1);
        setUserCanEdit(editPermission);
      } catch (error) {
        console.error('Error loading collaborators:', error);
      }
    };

    if (isAuthenticated) {
      loadCollaborators();
    }
  }, [isAuthenticated]);

  // Fetch creative details using our Supabase service
  const { data: details = [], isLoading } = useQuery({
    queryKey: ['creative-details', 1], // Project ID 1
    queryFn: () => getCreativeDetails(1),
    select: (data) => data as CreativeDetail[]
  });

  // Create/update mutation using our Supabase service
  const createDetailMutation = useMutation({
    mutationFn: async (data: Omit<CreativeDetail, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (editingDetail) {
        return updateCreativeDetail(editingDetail.id, data);
      } else {
        return createCreativeDetail(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-details'] });
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

  // Delete mutation using our Supabase service
  const deleteDetailMutation = useMutation({
    mutationFn: async (id: number) => {
      return deleteCreativeDetail(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-details'] });
      toast({
        title: 'Detail deleted',
        description: 'Creative detail has been removed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete creative detail',
        variant: 'destructive',
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
      queryClient.invalidateQueries({ queryKey: ['creative-details'] });
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
        
        {/* Authentication Status Banner */}
        {!isAuthenticated && (
          <div className="mt-6 max-w-2xl mx-auto">
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      You're working offline
                    </p>
                    <p className="text-xs text-amber-700">
                      Sign in to sync your data and collaborate with others
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={() => window.location.href = '/auth'}
                  >
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {isAuthenticated && collaborators.length > 0 && (
          <div className="mt-6 max-w-2xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Collaborating with {collaborators.length} team member{collaborators.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-blue-700">
                      Your changes sync in real-time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Enhanced Summary Stats */}
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
              {details?.filter(d => d.dueDate && new Date(d.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length || 0}
            </div>
            <div className="text-sm text-gray-500">Due This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text bg-gradient-to-r from-purple-400 to-indigo-500">
              {details?.filter(d => d.isCompleted).length || 0}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>

        {/* Mini Activity Log */}
        <div className="mt-8 max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-cream/30 to-champagne/30 border-champagne/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-center">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                {details?.slice(0, 3).map((detail, index) => (
                  <div key={detail.id} className="flex items-center justify-between py-1">
                    <span>✨ Added "{detail.title}" to {categories.find(c => c.id === detail.category)?.title}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(detail.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                )) || (
                  <div className="text-center py-4 text-gray-500">
                    <p>Start adding creative details to see your activity here!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
                    <Badge variant="secondary" className="bg-white/50 text-gray-700 px-3 py-1">
                      {categoryDetails.length} {categoryDetails.length === 1 ? 'item' : 'items'}
                    </Badge>
                    {userCanEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreateForm(category.id);
                        }}
                        className="bg-gradient-to-r from-blush/10 to-rose-gold/10 border-blush/30 text-blush hover:bg-blush/20 rounded-lg"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    )}
                    {category.hasAI && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast({ title: "AI Suggestions Coming Soon!", description: "This feature will provide intelligent recommendations for your wedding planning." });
                        }}
                        className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-700 hover:bg-purple-100 rounded-lg"
                      >
                        ✨ AI
                      </Button>
                    )}
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
                                {userCanEdit && (
                                  <>
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
                                  </>
                                )}
                                {!userCanEdit && (
                                  <Badge variant="outline" className="text-xs">
                                    View Only
                                  </Badge>
                                )}
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

      {/* Enhanced Create/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {editingDetail ? 'Edit' : 'Add'} {categories.find(c => c.id === formData.category)?.title || 'Creative Detail'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category-Specific Fields */}
            {formData.category && categories.find(c => c.id === formData.category)?.fields?.map((field, index) => (
              <div key={index}>
                <Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                
                {field.type === 'text' && (
                  <Input
                    id={field.name}
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                    required={field.required}
                    className="mt-1"
                  />
                )}
                
                {field.type === 'textarea' && (
                  <Textarea
                    id={field.name}
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                    rows={3}
                    className="mt-1"
                  />
                )}
                
                {field.type === 'select' && field.options && (
                  <Select 
                    value={formData.notes || ''}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {field.type === 'date' && (
                  <Input
                    id={field.name}
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="mt-1"
                  />
                )}
              </div>
            ))}

            {/* Standard Fields */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
              
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a descriptive title..."
                  required
                  className="mt-1"
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this item..."
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  {collaborators.length > 0 ? (
                    <Select 
                      value={formData.assignedTo?.toString() || ''} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value ? parseInt(value) : undefined }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose collaborator..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {collaborators.map(collaborator => (
                          <SelectItem key={collaborator.id} value={collaborator.userId.toString()}>
                            {collaborator.user?.firstName || collaborator.user?.username || `User ${collaborator.userId}`}
                            <Badge variant="outline" className="ml-2 text-xs">
                              {collaborator.role}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="assignedTo"
                      value={formData.assignedTo?.toString() || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value ? parseInt(e.target.value) : undefined }))}
                      placeholder="Person responsible..."
                      className="mt-1"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes, instructions, or special requirements..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDetailMutation.isPending}
                className="bg-gradient-to-r from-blush to-rose-gold hover:from-rose-400 hover:to-pink-600 px-6"
              >
                {createDetailMutation.isPending 
                  ? 'Saving...' 
                  : editingDetail 
                  ? 'Update Detail' 
                  : 'Create Detail'
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}