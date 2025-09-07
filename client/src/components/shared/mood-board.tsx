import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X, Edit, Palette, Trash2, Plus, Heart, Download, Share2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MoodBoardItem } from '@/types';
import type { InspirationItem } from '@/../../shared/types';

interface MoodBoardItemData {
  id: number;
  title: string;
  imageUrl?: string;
  category?: string;
  notes?: string;
  colors?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface SortableItemProps {
  item: MoodBoardItem;
  onEdit: (item: MoodBoardItem) => void;
  onDelete: (id: string) => void;
}

function SortableItem({ item, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative cursor-move transition-all hover:shadow-lg border-2 ${
        isDragging ? 'border-rose-300 shadow-xl' : 'border-transparent hover:border-rose-200'
      }`}
    >
      <CardContent className="p-2">
        {item.imageUrl ? (
          <div className="relative">
            <img
              src={item.imageUrl}
              alt={item.title || 'Mood board item'}
              width={200}
              height={128}
              className="w-full h-32 object-cover rounded-md"
              draggable={false}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md" />
          </div>
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-md flex items-center justify-center">
            <Palette className="w-8 h-8 text-rose-400" />
          </div>
        )}
        
        {item.title && (
          <h4 className="font-medium text-sm mt-2 line-clamp-2">{item.title}</h4>
        )}
        
        {item.category && (
          <Badge variant="secondary" className="mt-1 text-xs">
            {item.category}
          </Badge>
        )}
        
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                +{item.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 bg-white/90 hover:bg-white hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id.toString());
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface MoodBoardProps {
  inspirationItems: any[];
  onItemsChange: () => void;
}

export default function MoodBoard({ inspirationItems, onItemsChange }: MoodBoardProps) {
  const [items, setItems] = useState<MoodBoardItem[]>(() => {
    // Convert inspiration items to mood board format
    return inspirationItems.map((item, index) => ({
      id: item.id.toString(),
      title: item.title,
      imageUrl: item.imageUrl,
      category: item.category,
      notes: item.notes,
      colors: item.colors,
      tags: item.tags,
      position: { 
        x: (index % 4) * 250, 
        y: Math.floor(index / 4) * 200 
      },
      size: { width: 220, height: 180 }
    }));
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MoodBoardItem | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const uploadForm = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      category: "",
      notes: "",
      tags: "",
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/')
    );
    setUploadedFiles(prev => [...prev, ...imageFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const uploadFilesMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      // Create FormData for file upload
      const formData = new FormData();
      uploadedFiles.forEach((file, index) => {
        formData.append('images', file);
      });
      
      // Upload files first
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload files');
      }
      
      const uploadResult = await uploadResponse.json();
      
      // Create inspiration items for each uploaded image
      const createdItems = [];
      const imageUrls = uploadResult.urls || uploadResult.files?.map((f: any) => f.url) || [];
      for (const imageUrl of imageUrls) {
        const itemData = {
          title: data.title,
          category: data.category,
          imageUrl: imageUrl,
          notes: data.notes,
          tags: data.tags
        };
        
        const item = await apiRequest('/api/inspiration', {
          method: 'POST',
          body: JSON.stringify(itemData),
          headers: { 'Content-Type': 'application/json' }
        });
        
        createdItems.push(item);
      }
      
      return createdItems;
    },
    onSuccess: (createdItems: InspirationItem[]) => {
      // Add new items to mood board
      const newMoodBoardItems = createdItems.map((item, index) => ({
        id: item.id.toString(),
        title: item.title,
        imageUrl: item.imageUrl,
        category: item.category,
        notes: item.notes,
        colors: item.colors,
        tags: item.tags,
        position: { 
          x: (items.length + index) % 4 * 250, 
          y: Math.floor((items.length + index) / 4) * 200 
        },
        size: { width: 220, height: 180 }
      }));
      
      setItems(prev => [...prev, ...newMoodBoardItems]);
      setUploadedFiles([]);
      uploadForm.reset();
      setIsUploadDialogOpen(false);
      onItemsChange();
      queryClient.invalidateQueries({ queryKey: ['/api/inspiration'] });
      
      toast({ 
        title: "Images uploaded successfully!", 
        description: `Added ${createdItems.length} images to your mood board` 
      });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to upload images", 
        variant: "destructive" 
      });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/inspiration/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: (_, deletedId) => {
      setItems(prev => prev.filter(item => item.id !== deletedId));
      onItemsChange();
      queryClient.invalidateQueries({ queryKey: ['/api/inspiration'] });
      toast({ title: "Item removed from mood board" });
    }
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleDeleteItem = (id: string) => {
    deleteItemMutation.mutate(id);
  };

  const handleEditItem = (item: MoodBoardItem) => {
    setEditingItem(item);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleExportMoodBoard = () => {
    const exportData = {
      title: "Wedding Mood Board",
      items: items.map(item => ({
        title: item.title,
        category: item.category,
        notes: item.notes,
        tags: item.tags,
        imageUrl: item.imageUrl,
      })),
      exported: new Date().toISOString(),
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "wedding-mood-board.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({ title: "Mood board exported successfully!" });
  };

  const handleShareMoodBoard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wedding Mood Board',
          text: `Check out my wedding inspiration board with ${items.length} beautiful ideas!`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Mood Board</h2>
          <p className="text-gray-600">Drag and drop to arrange your inspiration</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
                <Upload className="w-4 h-4 mr-2" />
                Upload Images
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Images to Mood Board</DialogTitle>
                <DialogDescription>
                  Add photos to visualize your wedding inspiration
                </DialogDescription>
              </DialogHeader>
              
              <Form {...uploadForm}>
                <form onSubmit={uploadForm.handleSubmit((data) => uploadFilesMutation.mutate(data))} className="space-y-4">
                  {/* File upload area */}
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive 
                        ? 'border-rose-400 bg-rose-50' 
                        : 'border-gray-300 hover:border-rose-300 hover:bg-rose-50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    {isDragActive ? (
                      <p className="text-rose-600">Drop the images here...</p>
                    ) : (
                      <div>
                        <p className="text-gray-600 mb-1">Drag & drop images here</p>
                        <p className="text-sm text-gray-400">or click to select files</p>
                      </div>
                    )}
                  </div>

                  {/* Preview uploaded files */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Selected Images:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              width={80}
                              height={80}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                              onClick={() => removeUploadedFile(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <FormField
                    control={uploadForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Reception centerpieces" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={uploadForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="venue">Venue</SelectItem>
                            <SelectItem value="dress">Dress & Attire</SelectItem>
                            <SelectItem value="flowers">Flowers</SelectItem>
                            <SelectItem value="cake">Cake</SelectItem>
                            <SelectItem value="decor">Decor</SelectItem>
                            <SelectItem value="colors">Colors</SelectItem>
                            <SelectItem value="rings">Rings</SelectItem>
                            <SelectItem value="photography">Photography</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={uploadForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Add any notes about this inspiration..." rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={uploadForm.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="rustic, elegant, romantic (comma separated)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={uploadedFiles.length === 0 || uploadFilesMutation.isPending}
                      className="flex-1"
                    >
                      {uploadFilesMutation.isPending ? 'Uploading...' : 'Add to Mood Board'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="sm" onClick={handleExportMoodBoard}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareMoodBoard}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Mood Board Grid */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-h-[300px] p-4 bg-gradient-to-br from-rose-50/30 to-pink-50/30 rounded-xl border-2 border-dashed border-rose-200">
            {items.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                <Palette className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium mb-2">Your mood board is empty</p>
                <p className="text-sm">Upload images to start building your inspiration board</p>
              </div>
            ) : (
              items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Stats */}
      {items.length > 0 && (
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>{items.length} inspiration{items.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-500" />
            <span>{new Set(items.map(item => item.category).filter(Boolean)).size} categories</span>
          </div>
        </div>
      )}
    </div>
  );
}