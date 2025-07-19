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
import { Plus, DollarSign, Star } from "lucide-react";
import { vendorSchema, VendorFormData } from "@/schemas";
import { useCreateVendor, useUpdateVendor } from "@/hooks/useVendors";
import { useToast } from "@/hooks/use-toast";

interface VendorFormDialogProps {
  projectId: string;
  vendor?: any;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

export default function VendorFormDialog({ projectId, vendor, trigger, onClose }: VendorFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const createVendor = useCreateVendor(projectId);
  const updateVendor = useUpdateVendor(projectId);

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: vendor?.name || "",
      type: vendor?.type || "other",
      contactPerson: vendor?.contactPerson || "",
      email: vendor?.email || "",
      phone: vendor?.phone || "",
      website: vendor?.website || "",
      address: vendor?.address || "",
      notes: vendor?.notes || "",
      tags: vendor?.tags || "",
      rating: vendor?.rating || undefined,
      estimatedCost: vendor?.estimatedCost || undefined,
      isBooked: vendor?.isBooked || false,
    },
  });

  const onSubmit = async (data: VendorFormData) => {
    try {
      if (vendor) {
        await updateVendor.mutateAsync({ id: vendor.id, data });
        toast({ title: "Vendor updated successfully!" });
      } else {
        await createVendor.mutateAsync(data);
        toast({ title: "Vendor added successfully!" });
      }
      form.reset();
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      toast({
        title: "Error",
        description: vendor ? "Failed to update vendor" : "Failed to add vendor",
        variant: "destructive"
      });
    }
  };

  const defaultTrigger = (
    <Button className="gradient-blush-rose text-white">
      <Plus className="w-4 h-4 mr-2" />
      Add Vendor
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" aria-describedby="vendor-form-description">
        <DialogHeader>
          <DialogTitle>{vendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
          <DialogDescription id="vendor-form-description">
            {vendor ? "Update the vendor details below." : "Add a new vendor to your wedding planning list."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Vendor name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="venue">Venue</SelectItem>
                        <SelectItem value="catering">Catering</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="flowers">Flowers</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="vendor@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://vendor-website.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address, city, state, zip..." {...field} />
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
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-9"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1-5 stars)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Star className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          placeholder="5.0"
                          className="pl-9"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="boho, luxury, budget-friendly, local..." {...field} />
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
                    <Textarea placeholder="Additional notes about this vendor..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isBooked"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Vendor is booked</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createVendor.isPending || updateVendor.isPending}
                className="gradient-blush-rose text-white"
              >
                {createVendor.isPending || updateVendor.isPending ? "Saving..." : (vendor ? "Update Vendor" : "Add Vendor")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}