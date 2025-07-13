import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Plus, Heart, Upload, Search, Sparkles, Download, Image } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const inspirationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Invalid URL"),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type InspirationFormData = z.infer<typeof inspirationSchema>;

// Mock data - in real app this would come from API
const mockInspirationItems = [
  {
    id: 1,
    title: "Garden Ceremony Setup",
    category: "Ceremony",
    imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    notes: "Beautiful outdoor ceremony with white chairs and floral arch",
    tags: ["outdoor", "garden", "arch", "white"],
    colors: ["#FFFFFF", "#F8BBD9", "#90EE90", "#FFE4E1"],
    addedAt: new Date(),
    liked: true
  },
  {
    id: 2,
    title: "Bridal Bouquet",
    category: "Flowers",
    imageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    notes: "Elegant white and pink roses with eucalyptus",
    tags: ["bouquet", "roses", "pink", "white"],
    colors: ["#FFFFFF", "#FFB6C1", "#90EE90", "#F0F8FF"],
    addedAt: new Date(),
    liked: false
  },
  {
    id: 3,
    title: "Reception Tablescape",
    category: "Reception",
    imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    notes: "Romantic table setting with candles and floral centerpieces",
    tags: ["reception", "tablescape", "candles", "romantic"],
    colors: ["#FFFFFF", "#F8BBD9", "#FFD700", "#FFF8DC"],
    addedAt: new Date(),
    liked: true
  },
  {
    id: 4,
    title: "Wedding Cake Design",
    category: "Cake",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    notes: "Three-tier white cake with fresh flowers",
    tags: ["cake", "white", "flowers", "elegant"],
    colors: ["#FFFFFF", "#F8BBD9", "#90EE90", "#FFE4E1"],
    addedAt: new Date(),
    liked: false
  },
  {
    id: 5,
    title: "Bridal Dress Inspiration",
    category: "Attire",
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0201ba5d277?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    notes: "Classic A-line dress with lace details",
    tags: ["dress", "lace", "classic", "elegant"],
    colors: ["#FFFFFF", "#F5F5DC", "#E6E6FA", "#FFF8DC"],
    addedAt: new Date(),
    liked: true
  },
  {
    id: 6,
    title: "Hair and Makeup",
    category: "Beauty",
    imageUrl: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    notes: "Soft romantic updo with natural makeup",
    tags: ["hair", "makeup", "romantic", "natural"],
    colors: ["#FFE4E1", "#F8BBD9", "#FFFFFF", "#DDA0DD"],
    addedAt: new Date(),
    liked: false
  }
];

const categories = [
  "Ceremony", "Reception", "Flowers", "Attire", "Cake", "Beauty", 
  "Decor", "Venue", "Invitations", "Favors", "Other"
];

// AI-generated color palettes based on inspiration
const aiColorPalettes = [
  {
    id: 1,
    name: "Romantic Garden",
    colors: ["#FFFFFF", "#F8BBD9", "#90EE90", "#FFE4E1"],
    description: "Soft pinks and greens inspired by garden ceremonies"
  },
  {
    id: 2,
    name: "Classic Elegance",
    colors: ["#FFFFFF", "#F5F5DC", "#D4AF37", "#E6E6FA"],
    description: "Timeless whites with champagne and lavender accents"
  },
  {
    id: 3,
    name: "Blush & Gold",
    colors: ["#F8BBD9", "#FFD700", "#FFFFFF", "#FFF8DC"],
    description: "Warm blush tones with elegant gold highlights"
  }
];

export default function Inspiration() {
  // Fetch inspiration items from API
  const { data: inspirationItems = [], isLoading, error } = useQuery({
    queryKey: ['/api/inspiration-items']
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState(aiColorPalettes[0]);

  const form = useForm<InspirationFormData>({
    resolver: zodResolver(inspirationSchema),
    defaultValues: {
      title: "",
      category: "",
      imageUrl: "",
      notes: "",
      tags: "",
    },
  });

  // Handle null or error states
  if (error || inspirationItems === null) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Header />
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center py-12">
                <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Inspiration Board</h3>
                <p className="text-gray-600 mb-6">Start collecting ideas and inspiration for your perfect wedding.</p>
                <Button className="gradient-blush-rose text-white">
                  <Plus size={16} className="mr-2" />
                  Add First Inspiration
                </Button>
              </div>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  const filteredItems = inspirationItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const onSubmit = (data: InspirationFormData) => {
    const newItem = {
      id: inspirationItems.length + 1,
      ...data,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      colors: ["#FFFFFF", "#F8BBD9", "#90EE90", "#FFE4E1"], // Default colors
      addedAt: new Date(),
      liked: false
    };
    setInspirationItems([...inspirationItems, newItem]);
    form.reset();
    setIsAddDialogOpen(false);
  };

  const toggleLike = (itemId: number) => {
    setInspirationItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, liked: !item.liked } : item
      )
    );
  };

  const totalItems = inspirationItems.length;
  const likedItems = inspirationItems.filter(item => item.liked).length;
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = inspirationItems.filter(item => item.category === category).length;
    return acc;
  }, {} as Record<string, number>);

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
                  Inspiration Board
                </h1>
                <p className="text-gray-600">
                  Collect and organize your wedding inspiration
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline">
                  <Download size={16} className="mr-2" />
                  Export Board
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gradient-blush-rose text-white">
                      <Plus size={16} className="mr-2" />
                      Add Inspiration
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Inspiration</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter title" {...field} />
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
                                  {categories.map(category => (
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
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter image URL" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tags</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter tags separated by commas" {...field} />
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
                                <Textarea placeholder="Add your notes..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="gradient-blush-rose text-white">
                            Add Item
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Image className="text-blush" size={20} />
                    <span>Total Items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{totalItems}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Heart className="text-red-600" size={20} />
                    <span>Favorites</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{likedItems}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Palette className="text-purple-600" size={20} />
                    <span>Color Palettes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{aiColorPalettes.length}</div>
                  <div className="text-sm text-gray-600">AI Generated</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Sparkles className="text-yellow-600" size={20} />
                    <span>Categories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">
                    {Object.values(categoryCounts).filter(count => count > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </CardContent>
              </Card>
            </div>

            {/* AI Color Palettes */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="text-blush" size={24} />
                  <span>AI Color Palettes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiColorPalettes.map((palette) => (
                    <div 
                      key={palette.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPalette.id === palette.id 
                          ? 'border-blush bg-blush bg-opacity-10' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPalette(palette)}
                    >
                      <div className="flex space-x-2 mb-3">
                        {palette.colors.map((color, index) => (
                          <div 
                            key={index}
                            className="w-8 h-8 rounded-full border border-gray-200"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">{palette.name}</h3>
                      <p className="text-sm text-gray-600">{palette.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <Input
                        placeholder="Search by title or tags..."
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
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category} ({categoryCounts[category] || 0})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Inspiration Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Inspiration Gallery ({filteredItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No inspiration found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || filterCategory 
                        ? "Try adjusting your search or filters" 
                        : "Get started by adding your first inspiration"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                      <div key={item.id} className="group relative">
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative aspect-square">
                            <img 
                              src={item.imageUrl} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                                  item.liked ? 'text-red-500' : 'text-white'
                                }`}
                                onClick={() => toggleLike(item.id)}
                              >
                                <Heart 
                                  size={20} 
                                  fill={item.liked ? 'currentColor' : 'none'}
                                />
                              </Button>
                            </div>
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary">{item.category}</Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                            {item.notes && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.notes}</p>
                            )}
                            
                            {/* Color palette */}
                            <div className="flex space-x-1 mb-3">
                              {item.colors.map((color, index) => (
                                <div 
                                  key={index}
                                  className="w-4 h-4 rounded-full border border-gray-200"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            
                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {item.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{item.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
