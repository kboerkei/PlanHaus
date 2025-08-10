import { useState, useMemo, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Building, Mail, Phone, Globe, MapPin, Filter, Star, CheckCircle, Clock, AlertCircle, Download, Search, Sparkles } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useVendors } from "@/hooks/useVendors";
import type { Vendor, VendorInsert, VendorUpdate } from "@/types/vendor";
import VendorFormDialog from "@/components/vendors/VendorFormDialog";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ExportDialog from "@/components/export/ExportDialog";
import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary";
import { SkeletonCard } from "@/components/ui/enhanced-loading";
import { EnhancedCard, StatCard } from "@/components/ui/enhanced-cards";
import { SearchInput } from "@/components/ui/enhanced-forms";
import { AccessibleButton } from "@/components/ui/accessibility-enhancements";
import { useDebounce, usePerformanceMonitor } from "@/hooks/usePerformanceOptimization";
import { motion, AnimatePresence } from "framer-motion";

type Project = {
  id: number;
  name: string;
  date?: string;
};

const categoryFilters = [
  { value: "all", label: "All Categories" },
  { value: "venue", label: "Venue" },
  { value: "catering", label: "Catering" },
  { value: "photography", label: "Photography" },
  { value: "videography", label: "Videography" },
  { value: "flowers", label: "Flowers" },
  { value: "music", label: "Music & DJ" },
  { value: "transportation", label: "Transportation" },
  { value: "beauty", label: "Beauty & Hair" },
  { value: "cake", label: "Cake & Desserts" },
  { value: "rentals", label: "Rentals" },
  { value: "planning", label: "Planning" },
  { value: "other", label: "Other" }
];

const statusFilters = [
  { value: "all", label: "All Statuses" },
  { value: "researching", label: "Researching" },
  { value: "contacted", label: "Contacted" },
  { value: "meeting_scheduled", label: "Meeting Scheduled" },
  { value: "proposal_received", label: "Proposal Received" },
  { value: "contract_sent", label: "Contract Sent" },
  { value: "booked", label: "Booked" },
  { value: "cancelled", label: "Cancelled" }
];

const statusColors = {
  researching: "bg-gray-100 text-gray-800",
  contacted: "bg-blue-100 text-blue-800",
  meeting_scheduled: "bg-yellow-100 text-yellow-800",
  proposal_received: "bg-purple-100 text-purple-800",
  contract_sent: "bg-orange-100 text-orange-800",
  booked: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

const statusIcons = {
  researching: Clock,
  contacted: Mail,
  meeting_scheduled: AlertCircle,
  proposal_received: Building,
  contract_sent: Building,
  booked: CheckCircle,
  cancelled: AlertCircle
};

export default function Vendors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showBookedOnly, setShowBookedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("name"); // name, category, status, booking
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc

  // Fetch data using hooks
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const currentProject = projects?.find((p: Project) => p.name === "Emma & Jake's Wedding") || projects?.[0];
  const projectId = currentProject?.id?.toString();
  
  const { data: vendors = [], isLoading: vendorsLoading, error: vendorsError } = useVendors(projectId);

  // Filter and sort logic
  const filteredVendors = useMemo(() => {
    if (!vendors || !Array.isArray(vendors)) return [];
    
    // First filter
    let filtered = vendors.filter((vendor: Vendor) => {
      const matchesSearch = !searchTerm || 
        vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === "all" || vendor.category === filterCategory;
      const matchesStatus = filterStatus === "all" || vendor.bookingStatus === filterStatus;
      const matchesBooked = !showBookedOnly || vendor.isBooked;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesBooked;
    });

    // Then sort
    filtered.sort((a: Vendor, b: Vendor) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "category":
          aValue = a.category || "";
          bValue = b.category || "";
          break;
        case "status":
          aValue = a.bookingStatus || "";
          bValue = b.bookingStatus || "";
          break;
        case "booking":
          // Sort by booking status: booked first, then by status priority
          if (a.isBooked !== b.isBooked) {
            return b.isBooked ? 1 : -1; // Booked items first
          }
          aValue = a.bookingStatus || "";
          bValue = b.bookingStatus || "";
          break;
        default: // name
          aValue = a.name || "";
          bValue = b.name || "";
      }
      
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    console.log('Vendors data:', vendors);
    console.log('Filtered vendors:', filtered);
    console.log('Sort settings:', { sortBy, sortOrder });
    
    return filtered;
  }, [vendors, searchTerm, filterCategory, filterStatus, showBookedOnly, sortBy, sortOrder]);

  // Categorize vendors
  const bookedVendors = filteredVendors.filter((vendor: Vendor) => vendor.isBooked);
  const pendingVendors = filteredVendors.filter((vendor: Vendor) => !vendor.isBooked);

  // Statistics
  const vendorStats = useMemo(() => {
    if (!vendors.length) return { total: 0, booked: 0, pending: 0, categories: 0 };
    
    const categories = new Set(vendors.map((v: Vendor) => v.category)).size;
    return {
      total: vendors.length,
      booked: vendors.filter((v: Vendor) => v.isBooked).length,
      pending: vendors.filter((v: Vendor) => !v.isBooked).length,
      categories
    };
  }, [vendors]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Loading and error states
  if (projectsLoading || vendorsLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading your vendors..." />
      </div>
    );
  }

  if (vendorsError) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>Error loading vendors. Please try again.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
            <p className="text-gray-600">
              Manage your wedding vendors and track booking status
            </p>
          </div>
          <div className="flex gap-2">
            <ExportDialog
              projectId={projectId}
              projectName={currentProject?.name || "Wedding Project"}
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export Vendors</span>
                </Button>
              }
            />
            <VendorFormDialog projectId={projectId} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{vendorStats.total}</div>
              <div className="text-sm text-gray-600">Total Vendors</div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{vendorStats.booked}</div>
              <div className="text-sm text-gray-600">Booked</div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{vendorStats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{vendorStats.categories}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Sorting */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              placeholder="Search vendors..."
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
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categoryFilters.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-booked-only"
              checked={showBookedOnly}
              onCheckedChange={(checked) => setShowBookedOnly(checked === true)}
            />
            <label htmlFor="show-booked-only" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Show booked only
            </label>
          </div>
          </div>
          
          {/* Sort Options */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Sort by: {sortBy} ({sortOrder === "asc" ? "ascending" : "descending"})
            </span>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "name" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("name")}
              >
                Name
              </Button>
              <Button
                variant={sortBy === "category" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("category")}
              >
                Category
              </Button>
              <Button
                variant={sortBy === "status" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("status")}
              >
                Status
              </Button>
              <Button
                variant={sortBy === "booking" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("booking")}
              >
                Booking Priority
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
            >
              {sortOrder === "asc" ? "↑ A-Z" : "↓ Z-A"}
            </Button>
          </div>
        </div>
      </div>

      {/* Vendor List */}
      {filteredVendors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCategory !== "all" || filterStatus !== "all" 
                ? "Try adjusting your filters to see more vendors."
                : "Get started by adding your first vendor."
              }
            </p>
            {(!searchTerm && filterCategory === "all" && filterStatus === "all") && (
              <VendorFormDialog projectId={projectId} />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredVendors.map((vendor: Vendor) => {
            const StatusIcon = statusIcons[vendor.bookingStatus as keyof typeof statusIcons] || Clock;
            
            return (
              <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">{vendor.name}</h3>
                        <Badge 
                          className={`${statusColors[vendor.bookingStatus as keyof typeof statusColors]} border-0 capitalize`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {vendor.bookingStatus?.replace('_', ' ') || 'researching'}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {vendor.category}
                        </Badge>
                        {vendor.isBooked && (
                          <Badge className="bg-green-100 text-green-600 border-0">
                            Booked
                          </Badge>
                        )}
                        {vendor.contractSigned && (
                          <Badge className="bg-blue-100 text-blue-600 border-0">
                            Contract Signed
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        {vendor.contactPerson && (
                          <div className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            <span>{vendor.contactPerson}</span>
                          </div>
                        )}
                        {vendor.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{vendor.email}</span>
                          </div>
                        )}
                        {vendor.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{vendor.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        {vendor.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            <a 
                              href={vendor.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate"
                            >
                              Website
                            </a>
                          </div>
                        )}
                        {vendor.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{vendor.address}</span>
                          </div>
                        )}
                        {vendor.priceRange && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Price: {vendor.priceRange}</span>
                          </div>
                        )}
                      </div>

                      {vendor.rating && vendor.rating > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex">{renderStars(vendor.rating || 0)}</div>
                          <span className="text-sm text-gray-600">({vendor.rating}/5)</span>
                        </div>
                      )}

                      {vendor.notes && (
                        <p className="text-sm text-gray-600 mt-2">{vendor.notes}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <VendorFormDialog
                        projectId={projectId}
                        vendor={vendor}
                        trigger={
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}