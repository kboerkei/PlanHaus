import { useState } from "react";
import { useFormWithAutosave } from "@/hooks/useFormWithAutosave";
import { SaveStatusIndicator } from "@/components/forms/SaveStatusIndicator";
import { budgetItemSchema, BudgetItemFormData } from "@/schemas";
import {
  TextField,
  TextareaField,
  SelectField,
  NumberField,
  CheckboxField,
  DateField,
} from "@/components/forms/FormField";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Plus, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface BudgetFormDialogProps {
  projectId: string;
  budgetItem?: any;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

export default function BudgetFormDialog({ projectId, budgetItem, trigger, onClose }: BudgetFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutations for budget items
  const createBudgetItem = useMutation({
    mutationFn: (data: BudgetItemFormData) =>
      apiRequest(`/api/projects/${projectId}/budget`, {
        method: 'POST',
        body: JSON.stringify({ ...data, projectId: Number(projectId) }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'budget'] });
    },
  });

  const updateBudgetItem = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BudgetItemFormData }) =>
      apiRequest(`/api/projects/${projectId}/budget/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'budget'] });
    },
  });

  const form = useFormWithAutosave<BudgetItemFormData>({
    schema: budgetItemSchema,
    defaultValues: {
      category: budgetItem?.category || "venue",
      item: budgetItem?.item || "",
      estimatedCost: budgetItem?.estimatedCost || undefined,
      actualCost: budgetItem?.actualCost || undefined,
      vendor: budgetItem?.vendor || "",
      notes: budgetItem?.notes || "",
      isPaid: budgetItem?.isPaid || false,
      paymentDue: budgetItem?.paymentDue || "",
      priority: budgetItem?.priority || "medium",
      status: budgetItem?.status || "planned",
    },
    autosave: {
      enabled: !!budgetItem, // Only enable autosave for editing existing items
      saveEndpoint: `/api/projects/${projectId}/budget`,
      updateEndpoint: `/api/projects/${projectId}/budget/:id`,
      queryKey: ['/api/projects', projectId, 'budget'],
      getId: (data) => budgetItem?.id,
      transformBeforeSave: (data) => ({
        ...data,
        projectId: Number(projectId),
      }),
    },
  });

  const { control, handleSubmit, formState, saveManually, isSaving, lastSaved, hasUnsavedChanges } = form;

  const onSubmit = async (data: BudgetItemFormData) => {
    try {
      if (budgetItem) {
        await updateBudgetItem.mutateAsync({ id: budgetItem.id, data });
        toast({ 
          title: "Budget item updated",
          description: "Your changes have been saved.",
        });
      } else {
        await createBudgetItem.mutateAsync(data);
        toast({ 
          title: "Budget item added",
          description: "Your new budget item has been created.",
        });
      }
      form.reset();
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save budget item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const categoryOptions = [
    { value: "venue", label: "Venue" },
    { value: "catering", label: "Catering" },
    { value: "photography", label: "Photography" },
    { value: "flowers", label: "Flowers & Decor" },
    { value: "music", label: "Music & Entertainment" },
    { value: "attire", label: "Attire" },
    { value: "transportation", label: "Transportation" },
    { value: "stationery", label: "Stationery" },
    { value: "other", label: "Other" },
  ];

  const statusOptions = [
    { value: "planned", label: "Planned" },
    { value: "quoted", label: "Quoted" },
    { value: "booked", label: "Booked" },
    { value: "paid", label: "Paid" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "high", label: "High Priority" },
  ];

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
      <DialogContent className="sm:max-w-[600px]" aria-describedby="budget-form-description">
        <DialogHeader>
          <DialogTitle>{budgetItem ? "Edit Budget Item" : "Add Budget Item"}</DialogTitle>
          <DialogDescription id="budget-form-description">
            {budgetItem ? "Update the budget item details below." : "Add a new item to your wedding budget."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <div className="space-y-4">
            {budgetItem && (
              <SaveStatusIndicator
                isSaving={isSaving}
                lastSaved={lastSaved}
                hasUnsavedChanges={hasUnsavedChanges}
              />
            )}
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                control={control}
                name="category"
                label="Category"
                options={categoryOptions}
                required
              />
              
              <SelectField
                control={control}
                name="status"
                label="Status"
                options={statusOptions}
                required
              />
            </div>

            <TextField
              control={control}
              name="item"
              label="Item/Service"
              placeholder="e.g., Wedding venue rental, Photography services..."
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <NumberField
                control={control}
                name="estimatedCost"
                label="Estimated Cost"
                placeholder="0.00"
                prefix="$"
                min={0}
                step={0.01}
              />
              
              <NumberField
                control={control}
                name="actualCost"
                label="Actual Cost"
                placeholder="0.00"
                prefix="$"
                min={0}
                step={0.01}
              />
            </div>

            <TextField
              control={control}
              name="vendor"
              label="Vendor/Service Provider"
              placeholder="Vendor name or company"
            />

            <div className="grid grid-cols-2 gap-4">
              <SelectField
                control={control}
                name="priority"
                label="Priority"
                options={priorityOptions}
              />
              
              <DateField
                control={control}
                name="paymentDue"
                label="Payment Due Date"
              />
            </div>

            <div className="flex items-center space-x-4">
              <CheckboxField
                control={control}
                name="isPaid"
                label="Mark as paid"
                description="Check if this item has been fully paid for"
              />
            </div>

            <TextareaField
              control={control}
              name="notes"
              label="Notes"
              placeholder="Additional notes, payment terms, special requirements..."
              rows={3}
            />

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
                disabled={createBudgetItem.isPending || updateBudgetItem.isPending}
              >
                Cancel
              </Button>
              {budgetItem && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveManually}
                  disabled={!hasUnsavedChanges || isSaving}
                >
                  {isSaving ? "Saving..." : "Save Now"}
                </Button>
              )}
              <Button
                type="submit"
                disabled={createBudgetItem.isPending || updateBudgetItem.isPending}
              >
                {createBudgetItem.isPending || updateBudgetItem.isPending
                  ? "Saving..."
                  : budgetItem
                  ? "Update Item"
                  : "Add Item"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}