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
import { Plus, DollarSign } from "lucide-react";
import { budgetSchema, BudgetFormData } from "@/schemas";
import { useCreateBudgetItem, useUpdateBudgetItem } from "@/hooks/useBudget";
import { useToast } from "@/hooks/use-toast";

interface BudgetEntryDialogProps {
  projectId: string;
  budgetItem?: any;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

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
      if (budgetItem) {
        await updateBudgetItem.mutateAsync({ id: budgetItem.id, data });
        toast({ title: "Budget item updated successfully!" });
      } else {
        await createBudgetItem.mutateAsync(data);
        toast({ title: "Budget item added successfully!" });
      }
      form.reset();
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      toast({
        title: "Error",
        description: budgetItem ? "Failed to update budget item" : "Failed to add budget item",
        variant: "destructive"
      });
    }
  };

  const defaultTrigger = (
    <Button className="gradient-blush-rose text-white">
      <Plus className="w-4 h-4 mr-2" />
      Add Budget Item
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]" aria-describedby="budget-form-description">
        <DialogHeader>
          <DialogTitle>{budgetItem ? "Edit Budget Item" : "Add Budget Item"}</DialogTitle>
          <DialogDescription id="budget-form-description">
            {budgetItem ? "Update the budget item details below." : "Add a new expense to your wedding budget."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="venue">Venue</SelectItem>
                        <SelectItem value="catering">Catering</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="flowers">Flowers</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="attire">Attire</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                    <FormLabel>Item Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Wedding dress" {...field} />
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
                    <FormLabel>Estimated Cost *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-9"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
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
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-9"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
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
                  <FormLabel>Vendor</FormLabel>
                  <FormControl>
                    <Input placeholder="Vendor name..." {...field} />
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
                    <Textarea placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-6">
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createBudgetItem.isPending || updateBudgetItem.isPending}
                className="gradient-blush-rose text-white"
              >
                {createBudgetItem.isPending || updateBudgetItem.isPending ? "Saving..." : (budgetItem ? "Update Item" : "Add Item")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}