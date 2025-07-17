import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExternalLink, Search, Globe, Heart, Camera, Gift } from "lucide-react";

interface Resource {
  id: number;
  name: string;
  description: string;
  category: string;
  url: string;
  logo: string;
  color: string;
}

const weddingResources: Resource[] = [
  {
    id: 1,
    name: "Zola",
    description: "All-in-one wedding platform with registry, website, and planning tools",
    category: "Registry & Planning",
    url: "https://www.zola.com",
    logo: "🎁",
    color: "bg-blue-50 text-blue-600"
  },
  {
    id: 2,
    name: "The Knot",
    description: "Wedding planning website with vendor directory and inspiration",
    category: "Planning & Vendors",
    url: "https://www.theknot.com",
    logo: "💒",
    color: "bg-pink-50 text-pink-600"
  },
  {
    id: 3,
    name: "Minted",
    description: "Custom wedding invitations, save the dates, and stationery",
    category: "Invitations",
    url: "https://www.minted.com",
    logo: "📮",
    color: "bg-green-50 text-green-600"
  },
  {
    id: 4,
    name: "WeddingWire",
    description: "Vendor marketplace and wedding planning tools",
    category: "Vendors",
    url: "https://www.weddingwire.com",
    logo: "🔗",
    color: "bg-purple-50 text-purple-600"
  },
  {
    id: 5,
    name: "Joy",
    description: "Wedding website builder with RSVP management",
    category: "Website & RSVP",
    url: "https://withjoy.com",
    logo: "💝",
    color: "bg-yellow-50 text-yellow-600"
  },
  {
    id: 6,
    name: "Shutterfly",
    description: "Photo books, invitations, and wedding favors",
    category: "Photo & Gifts",
    url: "https://www.shutterfly.com",
    logo: "📸",
    color: "bg-indigo-50 text-indigo-600"
  },
  {
    id: 7,
    name: "Etsy",
    description: "Handmade wedding decorations, favors, and unique items",
    category: "Handmade & Decor",
    url: "https://www.etsy.com/c/weddings",
    logo: "🎨",
    color: "bg-orange-50 text-orange-600"
  },
  {
    id: 8,
    name: "David's Bridal",
    description: "Wedding dresses, bridesmaid dresses, and accessories",
    category: "Attire",
    url: "https://www.davidsbridal.com",
    logo: "👗",
    color: "bg-rose-50 text-rose-600"
  },
  {
    id: 9,
    name: "Men's Wearhouse",
    description: "Tuxedos, suits, and formal wear for grooms and groomsmen",
    category: "Attire",
    url: "https://www.menswearhouse.com",
    logo: "🤵",
    color: "bg-gray-50 text-gray-600"
  },
  {
    id: 10,
    name: "Honeyfund",
    description: "Honeymoon registry and cash gift platform",
    category: "Registry",
    url: "https://www.honeyfund.com",
    logo: "🏝️",
    color: "bg-teal-50 text-teal-600"
  },
  {
    id: 11,
    name: "Appy Couple",
    description: "Wedding app for guests with event details and photos",
    category: "Guest Experience",
    url: "https://www.appycouple.com",
    logo: "📱",
    color: "bg-cyan-50 text-cyan-600"
  },
  {
    id: 12,
    name: "Thumbtack",
    description: "Find local wedding vendors and service providers",
    category: "Vendors",
    url: "https://www.thumbtack.com/wedding-planning",
    logo: "🔨",
    color: "bg-emerald-50 text-emerald-600"
  }
];

const categories = [
  "All",
  "Registry & Planning",
  "Planning & Vendors", 
  "Invitations",
  "Vendors",
  "Website & RSVP",
  "Photo & Gifts",
  "Handmade & Decor",
  "Attire",
  "Registry",
  "Guest Experience"
];

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredResources = weddingResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleResourceClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="h-8 w-8 text-blush-rose" />
                <h1 className="font-serif text-3xl font-semibold text-gray-800">
                  Wedding Resources
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Quick access to essential wedding planning websites and tools
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedCategory === category 
                        ? "bg-blush-rose text-white" 
                        : "hover:bg-blush-rose/10"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map(resource => (
                <Card 
                  key={resource.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-0 shadow-sm"
                  onClick={() => handleResourceClick(resource.url)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg ${resource.color} flex items-center justify-center text-2xl`}>
                          {resource.logo}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-800">
                            {resource.name}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs mt-1">
                            {resource.category}
                          </Badge>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm text-gray-600 leading-relaxed">
                      {resource.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Resources Found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or category filter.
                </p>
              </div>
            )}

            {/* Quick Tips */}
            <div className="mt-12 bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Heart className="h-5 w-5 text-blush-rose mr-2" />
                Pro Tips for Using Wedding Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium mb-1">🎯 Start with the basics</p>
                  <p>Begin with comprehensive platforms like Zola or The Knot for overall planning</p>
                </div>
                <div>
                  <p className="font-medium mb-1">💰 Compare prices</p>
                  <p>Check multiple vendors and platforms for better deals and options</p>
                </div>
                <div>
                  <p className="font-medium mb-1">📅 Book early</p>
                  <p>Popular vendors fill up quickly, especially during peak wedding season</p>
                </div>
                <div>
                  <p className="font-medium mb-1">📋 Stay organized</p>
                  <p>Keep track of accounts, passwords, and important details in one place</p>
                </div>
              </div>
            </div>
          </div>
    </div>
  );
}