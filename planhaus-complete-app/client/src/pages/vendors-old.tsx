import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import LoadingSpinner from "@/components/ui/loading-spinner";
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
import { Store, Plus, Mail, Phone, Globe, MapPin, Search, DollarSign, FileText, Building, Sparkles, Star, ExternalLink, MoreVertical, Edit, Trash2, Calendar, CheckCircle, AlertCircle, Clock, BookOpen } from "lucide-react";
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

// Mock data - in real app this would come from API
const mockVendors = [
  {
    id: 1,
    name: "Elegant Blooms Florist",
    category: "Florist",
    email: "contact@elegantblooms.com",
    phone: "(555) 123-4567",
    website: "www.elegantblooms.com",
    address: "123 Garden St, City, State 12345",
    quote: "2500",
    status: "booked",
    notes: "Specializes in garden party arrangements. Confirmed for ceremony and reception."
  },
  {
    id: 2,
    name: "Capture Moments Photography",
    category: "Photographer",
    email: "hello@capturemoments.com",
    phone: "(555) 987-6543",
    website: "www.capturemoments.com",
    address: "456 Studio Ave, City, State 12345",
    quote: "3200",
    status: "booked",
    notes: "8-hour package including engagement photos and wedding day coverage."
  },
  {
    id: 3,
    name: "Gourmet Catering Co.",
    category: "Caterer",
    email: "events@gourmetcatering.com",
    phone: "(555) 456-7890",
    website: "www.gourmetcatering.com",
    address: "789 Culinary Blvd, City, State 12345",
    quote: "8500",
    status: "contacted",
    notes: "Quoted for 120 guests, includes appetizers, main course, and dessert."
  },
  {
    id: 4,
    name: "Sweet Harmony Music",
    category: "DJ/Music",
    email: "bookings@sweetharmony.com",
    phone: "(555) 321-6547",
    website: "www.sweetharmony.com",
    address: "321 Melody Lane, City, State 12345",
    quote: "1500",
    status: "pending",
    notes: "DJ services for ceremony and reception. Includes sound system and microphones."
  },
  {
    id: 5,
    name: "Artistic Cakes & More",
    category: "Baker",
    email: "orders@artisticcakes.com",
    phone: "(555) 654-3210",
    website: "www.artisticcakes.com",
    address: "654 Bakery St, City, State 12345",
    quote: "800",
    status: "contacted",
    notes: "Custom 3-tier cake with sugar flowers to match wedding theme."
  }
];

const vendorCategories = [
  "Florist", "Photographer", "Caterer", "DJ/Music", "Baker", "Venue", 
  "Transportation", "Hair & Makeup", "Videographer", "Wedding Planner", "Other"
];

const statusColors = {
  booked: "bg-green-100 text-green-800",
  contacted: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  declined: "bg-red-100 text-red-800"
};

export default function Vendors() {
  // Fetch vendors from API
  const { data: vendors = [], isLoading, error } = useQuery({
    queryKey: ['/api/vendors']
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

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

  // Handle null or error states
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
                  Add First Vendor
                </Button>
              </div>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  const filteredVendors = (vendors || []).filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || filterCategory === 'all' || vendor.category === filterCategory;
    const matchesStatus = !filterStatus || filterStatus === 'all' || vendor.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
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

  const onSubmit = (data: VendorFormData) => {
    createVendorMutation.mutate(data);
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

  const totalVendors = (vendors || []).length;
  const bookedVendors = (vendors || []).filter(v => v.status === "booked").length;
  const totalQuotes = (vendors || []).reduce((sum, v) => sum + (v.quote ? parseFloat(v.quote) : 0), 0);
  const categories = [...new Set((vendors || []).map(v => v.category))].length;

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
                  Vendors
                </h1>
                <p className="text-gray-600">
                  Manage your wedding vendors and track bookings
                </p>
              </div>
              <div className="flex space-x-3">
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
                <DialogContent className="sm:max-w-md">
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
                                  <SelectValue placeholder="Select category" />
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
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter email address" {...field} />
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
                              <Input placeholder="Enter phone number" {...field} />
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
                            <FormLabel>Quote Amount ($)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter quote amount" {...field} />
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

            {/* Vendor Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Store className="text-blush" size={20} />
                    <span>Total Vendors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{totalVendors}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Store className="text-green-600" size={20} />
                    <span>Booked</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{bookedVendors}</div>
                  <div className="text-sm text-gray-600">
                    {totalVendors > 0 ? Math.round((bookedVendors / totalVendors) * 100) : 0}% complete
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <DollarSign className="text-blue-600" size={20} />
                    <span>Total Quotes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">
                    ${totalQuotes.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Store className="text-purple-600" size={20} />
                    <span>Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{categories}</div>
                  <div className="text-sm text-gray-600">Vendor types</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <Input
                        placeholder="Search vendors by name or category..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {vendorCategories.filter(Boolean).map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Vendor List */}
            <Card>
              <CardHeader>
                <CardTitle>Vendor Directory ({filteredVendors.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredVendors.length === 0 ? (
                    <div className="text-center py-8">
                      <Store className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || filterCategory || filterStatus 
                          ? "Try adjusting your search or filters" 
                          : "Get started by adding your first vendor"}
                      </p>
                    </div>
                  ) : (
                    filteredVendors.map((vendor) => (
                      <div key={vendor.id} className="flex items-start justify-between p-6 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="font-semibold text-lg text-gray-800">{vendor.name}</h3>
                            <Badge className={statusColors[vendor.status as keyof typeof statusColors]}>
                              {vendor.status}
                            </Badge>
                            <Badge variant="outline">{vendor.category}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              {vendor.email && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Mail size={14} />
                                  <span>{vendor.email}</span>
                                </div>
                              )}
                              {vendor.phone && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Phone size={14} />
                                  <span>{vendor.phone}</span>
                                </div>
                              )}
                              {vendor.website && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Globe size={14} />
                                  <span>{vendor.website}</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              {vendor.address && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <MapPin size={14} />
                                  <span>{vendor.address}</span>
                                </div>
                              )}
                              {vendor.quote && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <DollarSign size={14} />
                                  <span className="font-medium">${parseFloat(vendor.quote).toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {vendor.notes && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <FileText size={14} className="text-gray-400 mt-0.5" />
                                <p className="text-sm text-gray-700">{vendor.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-6">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Contact
                          </Button>
                          {vendor.status !== 'booked' && (
                            <Button size="sm" className="gradient-blush-rose text-white">
                              Book
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
