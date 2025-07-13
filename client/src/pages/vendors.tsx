import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import LoadingSpinner from "@/components/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Store, Plus, Mail, Phone, Globe, MapPin, Search, DollarSign, FileText, Building, 
  Sparkles, Star, ExternalLink, MoreVertical, Edit, Trash2, Calendar, CheckCircle, 
  AlertCircle, Clock, BookOpen, Filter, SortAsc, Grid, List, Users, TrendingUp
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  quote: z.string().optional(),
  notes: z.string().optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

const vendorCategories = [
  "Venue", "Catering", "Photography", "Videography", "Florist", "Music/DJ", 
  "Transportation", "Bakery", "Dress/Attire", "Hair & Makeup", "Decoration", 
  "Entertainment", "Stationery", "Jewelry", "Other"
];

const statusColors = {
  "pending": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "contacted": "bg-blue-50 text-blue-700 border-blue-200",
  "quoted": "bg-purple-50 text-purple-700 border-purple-200",
  "booked": "bg-green-50 text-green-700 border-green-200",
  "rejected": "bg-red-50 text-red-700 border-red-200"
};

const statusIcons = {
  "pending": Clock,
  "contacted": Mail,
  "quoted": DollarSign,
  "booked": CheckCircle,
  "rejected": AlertCircle
};

export default function VendorsEnhanced() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState("name");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const { data: vendors = [], isLoading, error } = useQuery({
    queryKey: ['/api/vendors']
  });

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      category: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      quote: "",
      notes: "",
    },
  });

  const editForm = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      category: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      quote: "",
      notes: "",
    },
  });

  const createVendorMutation = useMutation({
    mutationFn: (data: VendorFormData) => apiRequest('/api/vendors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      toast({
        title: "Success",
        description: "Vendor added successfully",
      });
      form.reset();
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add vendor",
        variant: "destructive",
      });
    }
  });

  const updateVendorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: VendorFormData }) =>
      apiRequest(`/api/vendors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });
      editForm.reset();
      setIsEditDialogOpen(false);
      setEditingVendor(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vendor",
        variant: "destructive",
      });
    }
  });

  const deleteVendorMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/vendors/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vendor",
        variant: "destructive",
      });
    }
  });

  const searchVendorsMutation = useMutation({
    mutationFn: (searchData: { location: string; category: string }) => 
      apiRequest('/api/vendors/ai-search', {
        method: 'POST',
        body: JSON.stringify(searchData),
      }),
    onSuccess: (data) => {
      setSearchResults(data.vendors || []);
      setIsSearching(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search for vendors",
        variant: "destructive",
      });
      setIsSearching(false);
    }
  });

  const filteredVendors = (vendors || []).filter((vendor: any) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vendor.email && vendor.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || filterCategory === 'all' || vendor.category === filterCategory;
    const matchesStatus = !filterStatus || filterStatus === 'all' || vendor.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a: any, b: any) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "category") return a.category.localeCompare(b.category);
    if (sortBy === "status") return a.status.localeCompare(b.status);
    if (sortBy === "quote") return (parseFloat(b.quote || "0") - parseFloat(a.quote || "0"));
    return 0;
  });

  const onSubmit = (data: VendorFormData) => {
    createVendorMutation.mutate(data);
  };

  const onEditSubmit = (data: VendorFormData) => {
    if (editingVendor) {
      updateVendorMutation.mutate({ id: editingVendor.id, data });
    }
  };

  const handleEditVendor = (vendor: any) => {
    setEditingVendor(vendor);
    editForm.reset({
      name: vendor.name || "",
      category: vendor.category || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      website: vendor.website || "",
      address: vendor.address || "",
      quote: vendor.quote || "",
      notes: vendor.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteVendor = (vendorId: number) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      deleteVendorMutation.mutate(vendorId);
    }
  };

  const handleAISearch = () => {
    if (!searchLocation.trim() || !searchCategory) {
      toast({
        title: "Missing Information",
        description: "Please enter your location and select a vendor category",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    setSearchResults([]);
    searchVendorsMutation.mutate({
      location: searchLocation.trim(),
      category: searchCategory
    });
  };

  const addSearchedVendor = (vendor: any) => {
    const vendorData = {
      name: vendor.name,
      category: searchCategory,
      email: vendor.email || "",
      phone: vendor.phone || "",
      website: vendor.website || "",
      address: vendor.address || "",
      quote: "",
      notes: `AI-found vendor. Rating: ${vendor.rating}/5 ⭐ | ${vendor.description || ""}`
    };
    
    createVendorMutation.mutate(vendorData);
  };

  const updateVendorStatus = (vendorId: number, status: string) => {
    updateVendorMutation.mutate({ 
      id: vendorId, 
      data: { ...editingVendor, status } as VendorFormData 
    });
  };

  const totalVendors = (vendors || []).length;
  const bookedVendors = (vendors || []).filter(v => v.status === "booked").length;
  const totalQuotes = (vendors || []).reduce((sum, v) => sum + (v.quote ? parseFloat(v.quote) : 0), 0);
  const categories = [...new Set((vendors || []).map(v => v.category))].length;

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Header />
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  if (error || vendors === null) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Header />
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-12">
                <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Vendor Management</h3>
                <p className="text-gray-600 mb-6">Keep track of all your wedding vendors in one place.</p>
                <Button className="gradient-blush-rose text-white">
                  <Plus size={16} className="mr-2" />
                  Add Your First Vendor
                </Button>
              </div>
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
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-3xl font-semibold text-gray-800 mb-2">
                  Vendor Management
                </h1>
                <p className="text-gray-600">
                  Organize your wedding vendors and track progress
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-blush text-blush hover:bg-blush hover:text-white">
                      <Sparkles size={16} className="mr-2" />
                      Find Vendors
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Sparkles className="text-blush" size={20} />
                        <span>AI-Powered Vendor Search</span>
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location *
                          </label>
                          <Input
                            placeholder="Enter city, state (e.g., San Francisco, CA)"
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vendor Type *
                          </label>
                          <Select value={searchCategory} onValueChange={setSearchCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select vendor category" />
                            </SelectTrigger>
                            <SelectContent>
                              {vendorCategories.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleAISearch}
                        disabled={isSearching}
                        className="w-full gradient-blush-rose text-white"
                      >
                        {isSearching ? (
                          <LoadingSpinner size="sm" className="mr-2" />
                        ) : (
                          <Search size={16} className="mr-2" />
                        )}
                        {isSearching ? "Searching..." : "Search for Vendors"}
                      </Button>
                      
                      {searchResults.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800">Search Results</h3>
                          <div className="max-h-96 overflow-y-auto space-y-3">
                            {searchResults.map((vendor, index) => (
                              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h4 className="font-semibold text-gray-800">{vendor.name}</h4>
                                      {vendor.rating && (
                                        <div className="flex items-center space-x-1">
                                          <Star className="text-yellow-400 fill-current" size={14} />
                                          <span className="text-sm text-gray-600">{vendor.rating}/5</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="space-y-1 text-sm text-gray-600">
                                      {vendor.address && (
                                        <div className="flex items-center space-x-1">
                                          <MapPin size={14} />
                                          <span>{vendor.address}</span>
                                        </div>
                                      )}
                                      {vendor.phone && (
                                        <div className="flex items-center space-x-1">
                                          <Phone size={14} />
                                          <span>{vendor.phone}</span>
                                        </div>
                                      )}
                                      {vendor.website && (
                                        <div className="flex items-center space-x-1">
                                          <ExternalLink size={14} />
                                          <a 
                                            href={vendor.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blush hover:underline"
                                          >
                                            {vendor.website}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {vendor.description && (
                                      <p className="text-sm text-gray-700 mt-2">{vendor.description}</p>
                                    )}
                                  </div>
                                  
                                  <Button
                                    size="sm"
                                    onClick={() => addSearchedVendor(vendor)}
                                    disabled={createVendorMutation.isPending}
                                    className="gradient-blush-rose text-white ml-4"
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {searchResults.length === 0 && !isSearching && searchLocation && searchCategory && (
                        <div className="text-center py-8">
                          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No vendors found. Try a different location or category.</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gradient-blush-rose text-white">
                      <Plus size={16} className="mr-2" />
                      Add Vendor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Vendor</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vendor Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter vendor name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select vendor category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {vendorCategories.map(category => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="vendor@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="(555) 123-4567" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input placeholder="https://vendor-website.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St, City, State" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="quote"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quote Amount</FormLabel>
                              <FormControl>
                                <Input placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter any notes about this vendor" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createVendorMutation.isPending}
                            className="gradient-blush-rose text-white"
                          >
                            {createVendorMutation.isPending ? "Adding..." : "Add Vendor"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blush/10 rounded-xl">
                      <Store className="h-6 w-6 text-blush" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                      <p className="text-2xl font-bold text-gray-900">{totalVendors}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Booked</p>
                      <p className="text-2xl font-bold text-gray-900">{bookedVendors}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Quotes</p>
                      <p className="text-2xl font-bold text-gray-900">${totalQuotes.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Categories</p>
                      <p className="text-2xl font-bold text-gray-900">{categories}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter Controls */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 flex-1">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <Input
                        placeholder="Search vendors by name or email..."
                        className="pl-10 border-gray-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-full md:w-48 border-gray-200">
                        <Filter size={16} className="mr-2" />
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {vendorCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full md:w-40 border-gray-200">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="quoted">Quoted</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40 border-gray-200">
                        <SortAsc size={16} className="mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Sort by Name</SelectItem>
                        <SelectItem value="category">Sort by Category</SelectItem>
                        <SelectItem value="status">Sort by Status</SelectItem>
                        <SelectItem value="quote">Sort by Quote</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex border border-gray-200 rounded-lg">
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-r-none"
                      >
                        <List size={16} />
                      </Button>
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-l-none border-l"
                      >
                        <Grid size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendor List/Grid */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Vendor Directory ({filteredVendors.length})</span>
                  {filteredVendors.length > 0 && (
                    <span className="text-sm font-normal text-gray-500">
                      {bookedVendors} of {totalVendors} vendors booked
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredVendors.length === 0 ? (
                  <div className="text-center py-12">
                    <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {searchTerm || filterCategory || filterStatus 
                        ? "No vendors match your filters" 
                        : "No vendors yet"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm || filterCategory || filterStatus 
                        ? "Try adjusting your search or filters" 
                        : "Start building your vendor list for your wedding"}
                    </p>
                    {!searchTerm && !filterCategory && !filterStatus && (
                      <div className="flex justify-center space-x-3">
                        <Button
                          onClick={() => setIsSearchDialogOpen(true)}
                          variant="outline"
                          className="border-blush text-blush hover:bg-blush hover:text-white"
                        >
                          <Sparkles size={16} className="mr-2" />
                          Find Vendors
                        </Button>
                        <Button
                          onClick={() => setIsAddDialogOpen(true)}
                          className="gradient-blush-rose text-white"
                        >
                          <Plus size={16} className="mr-2" />
                          Add Vendor
                        </Button>
                      </div>
                    )}
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.map((vendor) => {
                      const StatusIcon = statusIcons[vendor.status as keyof typeof statusIcons];
                      return (
                        <Card key={vendor.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-blush/10 text-blush font-semibold">
                                    {vendor.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold text-gray-800">{vendor.name}</h3>
                                  <p className="text-sm text-gray-600">{vendor.category}</p>
                                </div>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditVendor(vendor)}>
                                    <Edit size={16} className="mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteVendor(vendor.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 size={16} className="mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <div className="flex items-center justify-between mb-4">
                              <Badge className={`${statusColors[vendor.status as keyof typeof statusColors]} border`}>
                                <StatusIcon size={12} className="mr-1" />
                                {vendor.status}
                              </Badge>
                              {vendor.quote && (
                                <span className="text-lg font-semibold text-gray-800">
                                  ${parseFloat(vendor.quote).toLocaleString()}
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-600">
                              {vendor.email && (
                                <div className="flex items-center space-x-2">
                                  <Mail size={14} />
                                  <span className="truncate">{vendor.email}</span>
                                </div>
                              )}
                              {vendor.phone && (
                                <div className="flex items-center space-x-2">
                                  <Phone size={14} />
                                  <span>{vendor.phone}</span>
                                </div>
                              )}
                              {vendor.website && (
                                <div className="flex items-center space-x-2">
                                  <Globe size={14} />
                                  <a 
                                    href={vendor.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blush hover:underline truncate"
                                  >
                                    {vendor.website}
                                  </a>
                                </div>
                              )}
                            </div>
                            
                            {vendor.notes && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700 line-clamp-2">{vendor.notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredVendors.map((vendor) => {
                      const StatusIcon = statusIcons[vendor.status as keyof typeof statusIcons];
                      return (
                        <div key={vendor.id} className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-blush/10 text-blush font-semibold">
                                {vendor.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-lg text-gray-800 truncate">{vendor.name}</h3>
                                <Badge className={`${statusColors[vendor.status as keyof typeof statusColors]} border flex items-center space-x-1`}>
                                  <StatusIcon size={12} />
                                  <span>{vendor.status}</span>
                                </Badge>
                                <Badge variant="outline" className="text-gray-600">
                                  {vendor.category}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div className="space-y-1">
                                  {vendor.email && (
                                    <div className="flex items-center space-x-2">
                                      <Mail size={14} />
                                      <span className="truncate">{vendor.email}</span>
                                    </div>
                                  )}
                                  {vendor.phone && (
                                    <div className="flex items-center space-x-2">
                                      <Phone size={14} />
                                      <span>{vendor.phone}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-1">
                                  {vendor.website && (
                                    <div className="flex items-center space-x-2">
                                      <Globe size={14} />
                                      <a 
                                        href={vendor.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blush hover:underline truncate"
                                      >
                                        {vendor.website}
                                      </a>
                                    </div>
                                  )}
                                  {vendor.address && (
                                    <div className="flex items-center space-x-2">
                                      <MapPin size={14} />
                                      <span className="truncate">{vendor.address}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-1">
                                  {vendor.quote && (
                                    <div className="flex items-center space-x-2">
                                      <DollarSign size={14} />
                                      <span className="font-semibold text-gray-800">
                                        ${parseFloat(vendor.quote).toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {vendor.notes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-start space-x-2">
                                    <FileText size={14} className="text-gray-400 mt-0.5" />
                                    <p className="text-sm text-gray-700 line-clamp-2">{vendor.notes}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-6">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditVendor(vendor)}
                            >
                              <Edit size={16} className="mr-1" />
                              Edit
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Mail size={16} className="mr-2" />
                                  Contact
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar size={16} className="mr-2" />
                                  Schedule Meeting
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteVendor(vendor.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 size={16} className="mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
      
      {/* Edit Vendor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter vendor name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendorCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="vendor@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://vendor-website.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="quote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter any notes about this vendor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateVendorMutation.isPending}
                  className="gradient-blush-rose text-white"
                >
                  {updateVendorMutation.isPending ? "Updating..." : "Update Vendor"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <MobileNav />
    </div>
  );
}