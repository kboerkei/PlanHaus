import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Palette, Plus, Search, Upload, Grid3x3, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MoodBoard from "@/components/mood-board";

const inspirationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Invalid URL"),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

const pinterestImportSchema = z.object({
  boardUrl: z.string().min(1, "Pinterest board URL is required").url("Invalid URL"),
  category: z.string().optional(),
});

type InspirationFormData = z.infer<typeof inspirationSchema>;
type PinterestImportData = z.infer<typeof pinterestImportSchema>;

export default function Inspiration() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPinterestDialogOpen, setIsPinterestDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'mood-board'>('mood-board');
  const { toast } = useToast();

  const { data: inspirationItems, isLoading, error } = useQuery({
    queryKey: ['/api/inspiration'],
    queryFn: async () => {
      try {
        return await apiRequest('/api/inspiration');
      } catch (error) {
        return null;
      }
    }
  });

  const createInspirationMutation = useMutation({
    mutationFn: (data: InspirationFormData) => apiRequest('/api/inspiration', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inspiration'] });
      form.reset();
      setIsAddDialogOpen(false);
      toast({ title: "Inspiration item added successfully!" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to add inspiration item", 
        variant: "destructive" 
      });
    }
  });

  const pinterestImportMutation = useMutation({
    mutationFn: (data: PinterestImportData) => apiRequest('/api/pinterest/import-board', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/inspiration'] });
      pinterestForm.reset();
      setIsPinterestDialogOpen(false);
      toast({ 
        title: "Pinterest Board Imported!", 
        description: response.message 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Import Failed", 
        description: error.error || "Failed to import Pinterest board", 
        variant: "destructive" 
      });
    }
  });

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

  const pinterestForm = useForm<PinterestImportData>({
    resolver: zodResolver(pinterestImportSchema),
    defaultValues: {
      boardUrl: "",
      category: "decor",
    },
  });

  const onSubmit = (data: InspirationFormData) => {
    createInspirationMutation.mutate(data);
  };

  const onPinterestImport = (data: PinterestImportData) => {
    pinterestImportMutation.mutate(data);
  };

  const filteredItems = (inspirationItems || []).filter((item: any) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === "all" || !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set((inspirationItems || []).map((item: any) => item.category).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-lg">Loading inspiration...</div>
        </div>
      </div>
    );
  }

  if (error || inspirationItems === null) {
    return (
      <div className="p-3 sm:p-6 mobile-safe-spacing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Building Your Inspiration Board</h3>
            <p className="text-gray-600 mb-6">Collect and organize ideas for your perfect wedding day.</p>
            <div className="flex gap-3">
              <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-blush-rose text-white">
                <Plus size={16} className="mr-2" />
                Add Inspiration
              </Button>
              <Button onClick={() => setIsPinterestDialogOpen(true)} variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">
                <ExternalLink size={16} className="mr-2" />
                Import Pinterest Board
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 mobile-safe-spacing">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-rose-500 rounded-lg">
              <Palette className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-900 tracking-tight mb-2">
                Inspiration Board
              </h1>
              <p className="text-gray-600">
                Collect and organize ideas for your perfect wedding day
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border rounded-lg p-1">
              <Button
                variant={viewMode === 'mood-board' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('mood-board')}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Mood Board
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex items-center gap-2"
              >
                <Grid3x3 className="w-4 h-4" />
                Grid View
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-blush-rose text-white">
                <Plus size={16} className="mr-2" />
                Add Inspiration
              </Button>
              <Button 
                onClick={() => setIsPinterestDialogOpen(true)} 
                variant="outline" 
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                <ExternalLink size={16} className="mr-2" />
                Pinterest Board
              </Button>
            </div>
          </div>
        </div>

        {/* Conditional rendering based on view mode */}
        {viewMode === 'mood-board' ? (
          <MoodBoard 
            inspirationItems={inspirationItems || []} 
            onItemsChange={() => queryClient.invalidateQueries({ queryKey: ['/api/inspiration'] })}
          />
        ) : (
          <>
            {/* Search and filter */}
            <div className="flex space-x-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search inspiration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Inspiration grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item: any) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Palette className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                    {item.category && (
                      <Badge variant="outline" className="mb-2">
                        {item.category}
                      </Badge>
                    )}
                    {item.notes && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.notes}</p>
                    )}
                    {item.tags && (
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(item.tags) ? item.tags : item.tags.split(',')).map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {typeof tag === 'string' ? tag.trim() : tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No inspiration items found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterCategory ? 'Try adjusting your search or filters.' : 'Add your first inspiration item to get started.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Inspiration Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Inspiration Item</DialogTitle>
            <DialogDescription>
              Add photos, colors, or ideas to inspire your wedding planning.
            </DialogDescription>
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
                        <SelectItem value="Ceremony">Ceremony</SelectItem>
                        <SelectItem value="Reception">Reception</SelectItem>
                        <SelectItem value="Flowers">Flowers</SelectItem>
                        <SelectItem value="Decor">Decor</SelectItem>
                        <SelectItem value="Attire">Attire</SelectItem>
                        <SelectItem value="Photography">Photography</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
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
                      <Input placeholder="https://example.com/image.jpg" {...field} />
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
                      <Textarea placeholder="Add notes about this inspiration..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createInspirationMutation.isPending} className="gradient-blush-rose text-white">
                  {createInspirationMutation.isPending ? "Adding..." : "Add Inspiration"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Pinterest Import Dialog */}
      <Dialog open={isPinterestDialogOpen} onOpenChange={setIsPinterestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-rose-500" />
              Import Pinterest Board
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-2">
                <p className="text-sm text-amber-600 font-medium">⚠️ Pinterest API Limitation</p>
                <p className="text-xs">Pinterest requires official API approval to fetch real images. To add actual Pinterest images:</p>
                <ol className="text-xs space-y-1 ml-4 list-decimal">
                  <li>Open your Pinterest board in a new tab</li>
                  <li>Right-click any pin image → "Copy image address"</li>
                  <li>Use the "Add Inspiration" button and paste the image URL</li>
                </ol>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Form {...pinterestForm}>
            <form onSubmit={pinterestForm.handleSubmit(onPinterestImport)} className="space-y-4">
              <FormField
                control={pinterestForm.control}
                name="boardUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pinterest Board URL *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://www.pinterest.com/username/board-name/" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500 mt-1">
                      Copy the URL from your Pinterest board (e.g., https://www.pinterest.com/yourname/wedding-ideas/)
                    </p>
                  </FormItem>
                )}
              />
              <FormField
                control={pinterestForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="decor">Decor</SelectItem>
                        <SelectItem value="flowers">Flowers</SelectItem>
                        <SelectItem value="ceremony">Ceremony</SelectItem>
                        <SelectItem value="reception">Reception</SelectItem>
                        <SelectItem value="attire">Attire</SelectItem>
                        <SelectItem value="cake">Cake</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsPinterestDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    setIsPinterestDialogOpen(false);
                    setIsAddDialogOpen(true);
                  }}
                  className="gradient-blush-rose text-white"
                >
                  Add Inspiration Manually
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
