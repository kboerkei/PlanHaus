import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { WeddingButton } from "@/components/ui/wedding-button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { BudgetItem } from "@shared/schema";

const budgetCategories = [
  "Venue", "Catering", "Photography", "Videography", "Music/Entertainment", 
  "Flowers/Decor", "Attire", "Transportation", "Stationery", "Other"
];

const budgetFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  item: z.string().min(1, "Item name is required"),
  estimatedCost: z.string().optional(),
  actualCost: z.string().optional(),
  vendor: z.string().optional(),
  notes: z.string().optional(),
  isPaid: z.boolean().default(false),
});

type BudgetFormData = z.infer<typeof budgetFormSchema>;

interface BudgetEntryDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  budgetItem?: BudgetItem;
}

export default function BudgetEntryDialog({ isOpen, setIsOpen, budgetItem }: BudgetEntryDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category: "",
      item: "",
      estimatedCost: "",
      actualCost: "",
      vendor: "",
      notes: "",
      isPaid: false,
    },
  });

  useEffect(() => {
    if (budgetItem) {
      form.reset({
        category: budgetItem.category,
        item: budgetItem.item,
        estimatedCost: budgetItem.estimatedCost?.toString() || "",
        actualCost: budgetItem.actualCost?.toString() || "",
        vendor: budgetItem.vendor || "",
        notes: budgetItem.notes || "",
        isPaid: budgetItem.isPaid || false,
      });
    } else {
      form.reset({
        category: "",
        item: "",
        estimatedCost: "",
        actualCost: "",
        vendor: "",
        notes: "",
        isPaid: false,
      });
    }
  }, [budgetItem, form]);

  const createBudgetItem = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      return apiRequest("/api/budget", {
        method: "POST",
        body: JSON.stringify({
          category: data.category,
          item: data.item,
          estimatedCost: data.estimatedCost ? parseFloat(data.estimatedCost) : null,
          actualCost: data.actualCost ? parseFloat(data.actualCost) : null,
          vendor: data.vendor || null,
          notes: data.notes || null,
          isPaid: data.isPaid,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success!",
        description: "Budget item added successfully.",
      });
      setIsOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add budget item.",
        variant: "destructive",
      });
    },
  });

  const updateBudgetItem = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      if (!budgetItem) throw new Error("No budget item to update");
      return apiRequest(`/api/budget/${budgetItem.id}`, {
        method: "PUT",
        body: JSON.stringify({
          category: data.category,
          item: data.item,
          estimatedCost: data.estimatedCost ? parseFloat(data.estimatedCost) : null,
          actualCost: data.actualCost ? parseFloat(data.actualCost) : null,
          vendor: data.vendor || null,
          notes: data.notes || null,
          isPaid: data.isPaid,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success!",
        description: "Budget item updated successfully.",
      });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update budget item.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BudgetFormData) => {
    if (budgetItem) {
      updateBudgetItem.mutate(data);
    } else {
      createBudgetItem.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-blush">
            {budgetItem ? "Edit Budget Item" : "Add Budget Item"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {budgetCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="item"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Wedding venue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Cost</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="vendor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Vendor name" {...field} />
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
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional details..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPaid"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Mark as Paid</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <WeddingButton
                type="button"
                variant="soft"
                onClick={() => setIsOpen(false)}
                className="min-w-[100px]"
              >
                Cancel
              </WeddingButton>
              <WeddingButton 
                type="submit" 
                variant="wedding"
                disabled={form.formState.isSubmitting}
                className="min-w-[120px]"
              >
                {form.formState.isSubmitting 
                  ? (budgetItem ? "Updating..." : "Adding...") 
                  : (budgetItem ? "Update Item" : "Add Item")
                }
              </WeddingButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}