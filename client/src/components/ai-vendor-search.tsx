import { useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AIVendorSearchProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number;
}

const vendorCategories = [
  "Photographer",
  "Videographer", 
  "Catering",
  "Florist",
  "DJ/Music",
  "Band",
  "Venue",
  "Wedding Planner",
  "Hair & Makeup",
  "Transportation",
  "Cake/Desserts",
  "Officiant",
  "Decor & Rentals",
  "Invitation Designer",
  "Other"
];

interface VendorResult {
  name: string;
  category: string;
  location: string;
  rating?: number;
  price?: string;
  description?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export default function AIVendorSearch({ isOpen, onClose, projectId }: AIVendorSearchProps) {
  const [location, setLocation] = useState("");
  const [vendorType, setVendorType] = useState("");
  const [searchResults, setSearchResults] = useState<VendorResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async ({ location, vendorType }: { location: string; vendorType: string }) => {
      // For demo purposes, return mock Austin vendor data
      // In production, this would call an AI vendor search API
      const mockResults: VendorResult[] = [
        {
          name: "Austin Bloom Photography",
          category: vendorType,
          location: "Austin, TX",
          rating: 4.9,
          price: "$2,500 - $4,500",
          description: "Specializing in romantic, natural light wedding photography with a focus on candid moments.",
          contact: {
            phone: "(512) 555-0123",
            email: "hello@austinbloom.com",
            website: "www.austinbloomphotography.com"
          }
        },
        {
          name: "Hill Country Catering Co.",
          category: vendorType,
          location: "Austin, TX",
          rating: 4.8,
          price: "$45 - $85 per person",
          description: "Farm-to-table catering featuring local Texas ingredients and rustic presentation.",
          contact: {
            phone: "(512) 555-0124",
            email: "events@hillcountrycatering.com",
            website: "www.hillcountrycatering.com"
          }
        },
        {
          name: "Wildflower Events & Design",
          category: vendorType,
          location: "Austin, TX", 
          rating: 4.7,
          price: "$1,500 - $3,500",
          description: "Full-service floral design specializing in organic, garden-style arrangements.",
          contact: {
            phone: "(512) 555-0125",
            email: "info@wildflowerevents.com",
            website: "www.wildflowereventsaustin.com"
          }
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return mockResults;
    },
    onSuccess: (results) => {
      setSearchResults(results);
      setIsSearching(false);
      toast({
        title: "Vendors Found",
        description: `Found ${results.length} vendors in ${location}`,
      });
    },
    onError: () => {
      setIsSearching(false);
      toast({
        title: "Search Failed",
        description: "Unable to search for vendors. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSearch = () => {
    if (!location.trim() || !vendorType) {
      toast({
        title: "Missing Information",
        description: "Please enter a location and select a vendor type",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    searchMutation.mutate({ location: location.trim(), vendorType });
  };

  const handleAddVendor = async (vendor: VendorResult) => {
    try {
      // Use the generic vendors endpoint that auto-creates projects if needed
      await apiRequest('/api/vendors', {
        method: 'POST',
        body: JSON.stringify({
          name: vendor.name,
          category: vendor.category,
          email: vendor.contact?.email,
          phone: vendor.contact?.phone,
          website: vendor.contact?.website,
          notes: vendor.description,
          status: 'pending'
        }),
      });
      
      toast({
        title: "Vendor Added",
        description: `${vendor.name} has been added to your vendors list`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add vendor to your list",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center space-x-2 text-2xl font-semibold">
            <Sparkles className="h-6 w-6 text-pink-500" />
            <span>AI-Powered Vendor Search</span>
          </DialogTitle>
          <DialogDescription>
            Search for local wedding vendors based on your location and needs.
          </DialogDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-0 top-0 p-2"
            aria-label="Close vendor search"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="font-medium">
                Location *
              </Label>
              <Input
                id="location"
                placeholder="Enter city, state (e.g., San Francisco, CA)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vendor-type" className="font-medium">
                Vendor Type *
              </Label>
              <Select value={vendorType} onValueChange={setVendorType}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select vendor category" />
                </SelectTrigger>
                <SelectContent>
                  {vendorCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !location.trim() || !vendorType}
            className="w-full h-14 text-lg gradient-blush-rose text-white"
          >
            <Search className="h-5 w-5 mr-2" />
            {isSearching ? "Searching for Vendors..." : "Search for Vendors"}
          </Button>

          {/* Search Results */}
          {isSearching && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching for the best vendors in {location}...</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Found {searchResults.length} vendors in {location}
              </h3>
              
              <div className="grid gap-4">
                {searchResults.map((vendor, index) => (
                  <Card key={index} className="border-l-4 border-l-pink-300 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-800">{vendor.name}</h4>
                          <div className="flex items-center space-x-3 mt-2">
                            <Badge variant="secondary">{vendor.category}</Badge>
                            <span className="text-gray-600">{vendor.location}</span>
                            {vendor.rating && (
                              <div className="flex items-center">
                                <span className="text-yellow-500">★</span>
                                <span className="text-gray-700 ml-1">{vendor.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {vendor.price && (
                            <p className="text-lg font-semibold text-gray-800">{vendor.price}</p>
                          )}
                          <Button 
                            onClick={() => handleAddVendor(vendor)}
                            className="mt-2 gradient-blush-rose text-white"
                            size="sm"
                          >
                            Add to List
                          </Button>
                        </div>
                      </div>
                      
                      {vendor.description && (
                        <p className="text-gray-600 mb-4">{vendor.description}</p>
                      )}
                      
                      {vendor.contact && (
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {vendor.contact.phone && (
                            <span>📞 {vendor.contact.phone}</span>
                          )}
                          {vendor.contact.email && (
                            <span>✉️ {vendor.contact.email}</span>
                          )}
                          {vendor.contact.website && (
                            <span>🌐 {vendor.contact.website}</span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}