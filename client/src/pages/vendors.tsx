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
import UnifiedPageLayout from "@/components/layout/UnifiedPageLayout";
import { UnifiedSection, UnifiedGrid, UnifiedCard } from "@/components/layout/UnifiedSection";

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

  // Performance monitoring
  usePerformanceMonitor('Vendors');

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
        vendor.contactName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === "all" || vendor.category?.toLowerCase() === filterCategory.toLowerCase();
      const matchesStatus = filterStatus === "all" || vendor.status === filterStatus;
      const matchesBooked = !showBookedOnly || vendor.status === "booked";
      
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
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        case "booking":
          // Sort by booking status: booked first, then by status priority
          if ((a.status === "booked") !== (b.status === "booked")) {
            return b.status === "booked" ? 1 : -1; // Booked items first
          }
          aValue = a.status || "";
          bValue = b.status || "";
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
  const bookedVendors = filteredVendors.filter((vendor: Vendor) => vendor.status === 'booked');
  const pendingVendors = filteredVendors.filter((vendor: Vendor) => vendor.status !== 'booked');

  // Calculate stats
  const stats = useMemo(() => {
    if (!vendors) return { total: 0, booked: 0, researching: 0, contacted: 0 };
    
    return {
      total: vendors.length,
      booked: vendors.filter((v: Vendor) => v.status === 'booked').length,
      researching: vendors.filter((v: Vendor) => v.status === 'researching').length,
      contacted: vendors.filter((v: Vendor) => v.status === 'contacted').length,
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
      <UnifiedPageLayout title="Vendor Directory" subtitle="Manage your dream team of vendors">
        <UnifiedSection animation="fadeIn" margin="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </UnifiedSection>
      </UnifiedPageLayout>
    );
  }

  if (vendorsError) {
    return (
      <UnifiedPageLayout title="Vendor Directory" subtitle="Manage your dream team of vendors">
        <UnifiedSection animation="fadeIn" margin="lg">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Vendors</h3>
            <p className="text-gray-600 mb-4">Unable to load vendor information. Please try again.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </UnifiedSection>
      </UnifiedPageLayout>
    );
  }

  if (!projectId) {
    return (
      <UnifiedPageLayout title="Vendor Directory" subtitle="Manage your dream team of vendors">
        <UnifiedSection animation="fadeIn" margin="lg">
          <div className="text-center py-8">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Wedding Project Found</h3>
            <p className="text-gray-600 mb-4">Please create a wedding project first to manage vendors.</p>
            <VendorFormDialog projectId={projectId || ""} />
          </div>
        </UnifiedSection>
      </UnifiedPageLayout>
    );
  }

  return (
    <UnifiedPageLayout 
      title="Vendor Directory" 
      subtitle="Find and manage your dream team of vendors"
      animation="fadeIn"
    >
      {/* Stats Section */}
      <UnifiedSection animation="slideUp" margin="lg">
        <UnifiedGrid cols={4}>
          <UnifiedCard variant="wedding">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Building className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </UnifiedCard>
          
          <UnifiedCard variant="wedding">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Booked</p>
                <p className="text-2xl font-bold text-gray-900">{stats.booked}</p>
              </div>
            </div>
          </UnifiedCard>
          
          <UnifiedCard variant="wedding">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                <Clock className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Researching</p>
                <p className="text-2xl font-bold text-gray-900">{stats.researching}</p>
              </div>
            </div>
          </UnifiedCard>
          
          <UnifiedCard variant="wedding">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Mail className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.contacted}</p>
              </div>
            </div>
          </UnifiedCard>
        </UnifiedGrid>
      </UnifiedSection>

      {/* Filters and Actions */}
      <UnifiedSection animation="slideUp" margin="lg">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="booked-only"
                checked={showBookedOnly}
                onCheckedChange={(checked) => setShowBookedOnly(checked as boolean)}
              />
              <label htmlFor="booked-only" className="text-sm text-gray-600">
                Booked only
              </label>
            </div>
            
            <VendorFormDialog
              projectId={projectId}
              trigger={
                <Button className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Add Vendor
                </Button>
              }
            />
            
                         <ExportDialog
               projectId={projectId || ""}
               projectName={currentProject?.name || "Wedding Project"}
               trigger={
                 <Button variant="outline" className="flex items-center gap-2">
                   <Download className="w-4 h-4" />
                   Export
                 </Button>
               }
             />
          </div>
        </div>
      </UnifiedSection>

      {/* Vendors List */}
      <UnifiedSection animation="slideUp" margin="lg">
        {filteredVendors.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCategory !== "all" || filterStatus !== "all" || showBookedOnly
                ? "Try adjusting your filters to see more results."
                : "Start building your vendor team by adding your first vendor."}
            </p>
            {!searchTerm && filterCategory === "all" && filterStatus === "all" && !showBookedOnly && (
              <VendorFormDialog
                projectId={projectId}
                trigger={
                  <Button className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Add Your First Vendor
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredVendors.map((vendor: Vendor) => {
              const StatusIcon = statusIcons[vendor.status as keyof typeof statusIcons] || Clock;
              
              return (
                <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {vendor.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{vendor.category}</p>
                          </div>
                          
                                                     <div className="flex items-center gap-2">
                             <Badge 
                               className={`${statusColors[vendor.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}
                             >
                               <StatusIcon className="w-3 h-3 mr-1" />
                               {vendor.status?.replace('_', ' ') || 'researching'}
                             </Badge>
                             <Badge variant="outline" className="capitalize">
                               {vendor.category}
                             </Badge>
                             {vendor.status === 'booked' && (
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          {vendor.contactName && (
                            <div className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              <span>{vendor.contactName}</span>
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
                          {vendor.cost && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Cost: ${vendor.cost}</span>
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
      </UnifiedSection>
    </UnifiedPageLayout>
  );
}