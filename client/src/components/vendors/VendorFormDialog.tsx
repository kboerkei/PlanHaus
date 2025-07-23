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
import { Building } from "lucide-react";
import { vendorSchema, VendorFormData } from "@/schemas";
import { useCreateVendor, useUpdateVendor } from "@/hooks/useVendors";
import { useToast } from "@/hooks/use-toast";

interface VendorFormDialogProps {
  projectId: string;
  vendor?: any;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

const vendorCategories = [
  { value: "venue", label: "Venue" },
  { value: "catering", label: "Catering" },
  { value: "photography", label: "Photography" },
  { value: "videography", label: "Videography" },
  { value: "flowers", label: "Flowers" },
  { value: "music", label: "Music & DJ" },
  { value: "transportation", label: "Transportation" },
  { value: "beauty", label: "Beauty & Hair" },
  { value: "cake", label: "Cake & Desserts" },
  { value: "rentals", label: "Rentals" },
  { value: "planning", label: "Planning" },
  { value: "other", label: "Other" }
];

const bookingStatuses = [
  { value: "researching", label: "Researching" },
  { value: "contacted", label: "Contacted" },
  { value: "meeting_scheduled", label: "Meeting Scheduled" },
  { value: "proposal_received", label: "Proposal Received" },
  { value: "contract_sent", label: "Contract Sent" },
  { value: "booked", label: "Booked" },
  { value: "cancelled", label: "Cancelled" }
];

export default function VendorFormDialog({ projectId, vendor, trigger, onClose }: VendorFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const createVendor = useCreateVendor(projectId);
  const updateVendor = useUpdateVendor(projectId);

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: vendor?.name || "",
      category: vendor?.category || "other",
      email: vendor?.email || "",
      phone: vendor?.phone || "",
      website: vendor?.website || "",
      address: vendor?.address || "",
      contactPerson: vendor?.contactPerson || "",
      priceRange: vendor?.priceRange || "",
      bookingStatus: vendor?.bookingStatus || "researching",
      rating: vendor?.rating || 0,
      notes: vendor?.notes || "",
      isBooked: vendor?.isBooked || false,
      contractSigned: vendor?.contractSigned || false,
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Building className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {vendor ? "Edit Vendor" : "Add Vendor"}
          </DialogTitle>
          <DialogDescription>
            {vendor ? "Update the vendor information." : "Add a new vendor to your wedding list."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC Photography Studio" {...field} />
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
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendorCategories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="info@vendor.com" {...field} />
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
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://vendor-website.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, City, State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priceRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Range (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="$1,000 - $3,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bookingStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select booking status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bookingStatuses.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
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
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1-5)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="4.5"
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes about this vendor..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <FormLabel>Booked</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractSigned"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Contract Signed</FormLabel>
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
                disabled={createVendor.isPending || updateVendor.isPending}
              >
                {vendor ? "Update" : "Add"} Vendor
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}