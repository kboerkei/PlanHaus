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
import { Palette, Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const inspirationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Invalid URL"),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type InspirationFormData = z.infer<typeof inspirationSchema>;

export default function Inspiration() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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

  const onSubmit = (data: InspirationFormData) => {
    createInspirationMutation.mutate(data);
  };

  const filteredItems = (inspirationItems || []).filter((item: any) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === "all" || !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set((inspirationItems || []).map((item: any) => item.category).filter(Boolean))];

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
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Start Building Your Inspiration Board</h3>
            <p className="text-gray-600 mb-6">Collect and organize ideas for your perfect wedding day.</p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-blush-rose text-white">
              <Plus size={16} className="mr-2" />
              Add First Inspiration
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-gray-800 mb-2">
              Inspiration Board
            </h1>
            <p className="text-gray-600">
              Collect and organize ideas for your perfect wedding day
            </p>
          </div>
          
          <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-blush-rose text-white">
            <Plus size={16} className="mr-2" />
            Add Inspiration
          </Button>
        </div>

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
                    {item.tags.split(',').map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag.trim()}
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
    </div>
  );
}
