import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { budgetSchema, BudgetFormData } from "@/schemas";
import { useCreateBudgetItem, useUpdateBudgetItem } from "@/hooks/useBudget";
import { useToast } from "@/hooks/use-toast";

interface BudgetEntryDialogProps {
  projectId: string;
  budgetItem?: any;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

const budgetCategories = [
  "venue", "catering", "photography", "videography", "flowers", "music",
  "transportation", "attire", "rings", "invitations", "decorations",
  "beauty", "favors", "other"
];

export default function BudgetEntryDialog({ projectId, budgetItem, trigger, onClose }: BudgetEntryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const createBudgetItem = useCreateBudgetItem(projectId);
  const updateBudgetItem = useUpdateBudgetItem(projectId);

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: budgetItem?.category || "other",
      item: budgetItem?.item || "",
      estimatedCost: budgetItem?.estimatedCost || 0,
      actualCost: budgetItem?.actualCost || 0,
      vendor: budgetItem?.vendor || "",
      notes: budgetItem?.notes || "",
      isPaid: budgetItem?.isPaid || false,
      isRecurring: budgetItem?.isRecurring || false,
    },
  });

  const onSubmit = async (data: BudgetFormData) => {
    try {
      // Convert numbers to strings for backend decimal fields
      const backendData = {
        ...data,
        estimatedCost: data.estimatedCost.toString(),
        actualCost: data.actualCost?.toString() || "0"
      };

      if (budgetItem) {
        await updateBudgetItem.mutateAsync({ id: budgetItem.id, data: backendData });
        toast({ title: "Budget item updated successfully!" });
      } else {
        await createBudgetItem.mutateAsync(backendData);
        toast({ title: "Budget item created successfully!" });
      }
      form.reset();
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      console.error("Budget item error:", error);
      toast({
        title: "Error",
        description: budgetItem ? "Failed to update budget item" : "Failed to create budget item",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Budget Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {budgetItem ? "Edit Budget Item" : "Add Budget Item"}
          </DialogTitle>
          <DialogDescription>
            {budgetItem ? "Update the budget item details." : "Add a new item to your wedding budget."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
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
                      {budgetCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
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
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Wedding dress, venue rental, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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

            <div className="grid grid-cols-2 gap-4">
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
                      <FormLabel>Paid</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Recurring</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createBudgetItem.isPending || updateBudgetItem.isPending}
              >
                {budgetItem ? "Update" : "Add"} Item
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}