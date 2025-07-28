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
import { UserPlus } from "lucide-react";
import { guestSchema, GuestFormData } from "@/schemas";
import { useCreateGuest, useUpdateGuest } from "@/hooks/useGuests";
import { useToast } from "@/hooks/use-toast";

interface GuestFormDialogProps {
  projectId: string;
  guest?: any;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

const guestGroups = [
  { value: "wedding_party", label: "Wedding Party" },
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
  { value: "colleagues", label: "Colleagues" },
  { value: "other", label: "Other" }
];

const rsvpStatuses = [
  { value: "pending", label: "Pending" },
  { value: "yes", label: "Attending" },
  { value: "no", label: "Not Attending" },
  { value: "maybe", label: "Maybe" }
];

const mealChoices = [
  { value: "no_preference", label: "No preference" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten_free", label: "Gluten Free" },
  { value: "chicken", label: "Chicken" },
  { value: "beef", label: "Beef" },
  { value: "fish", label: "Fish" },
  { value: "kids_meal", label: "Kids Meal" }
];

export default function GuestFormDialog({ projectId, guest, trigger, onClose }: GuestFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const createGuest = useCreateGuest(projectId);
  const updateGuest = useUpdateGuest(projectId);

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: guest?.name || "",
      email: guest?.email || "",
      phone: guest?.phone || "",
      group: guest?.group || "other",
      customGroup: guest?.customGroup || "",
      rsvpStatus: guest?.rsvpStatus || "pending",
      partySize: guest?.partySize || 1,
      mealChoice: guest?.mealChoice || "",
      dietaryRestrictions: guest?.dietaryRestrictions || "",
      hotelInfo: guest?.hotelInfo || "",
      notes: guest?.notes || "",
      tags: guest?.tags || "",
      inviteSent: guest?.inviteSent || false,
    },
  });

  const onSubmit = async (data: GuestFormData) => {
    try {
      console.log('Submitting guest data:', data);
      
      if (guest) {
        const result = await updateGuest.mutateAsync({ id: guest.id, data });
        console.log('Update guest result:', result);
        toast({ title: "Guest updated successfully!" });
      } else {
        const result = await createGuest.mutateAsync(data);
        console.log('Create guest result:', result);
        toast({ title: "Guest added successfully!" });
      }
      form.reset();
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      console.error('Guest form submission error:', error);
      toast({
        title: "Error",
        description: guest ? "Failed to update guest" : "Failed to add guest",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Guest
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {guest ? "Edit Guest" : "Add Guest"}
          </DialogTitle>
          <DialogDescription>
            {guest ? "Update the guest information." : "Add a new guest to your wedding list."}
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
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {guestGroups.map(group => (
                          <SelectItem key={group.value} value={group.value}>
                            {group.label}
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
                name="rsvpStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RSVP Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select RSVP status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rsvpStatuses.map(status => (
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
                name="partySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party Size</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="15"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">
                      How many people does this guest entry represent? (e.g., couples = 2, families = 3+)
                    </p>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mealChoice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Choice (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select meal preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mealChoices.map(choice => (
                          <SelectItem key={choice.value} value={choice.value}>
                            {choice.label}
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
                name="dietaryRestrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Restrictions (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Allergies, preferences..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="hotelInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Information (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Hotel name, room details..." {...field} />
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
                      placeholder="Additional notes about this guest..."
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
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="VIP, local, out-of-town..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inviteSent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Invitation Sent</FormLabel>
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
                disabled={createGuest.isPending || updateGuest.isPending}
              >
                {guest ? "Update" : "Add"} Guest
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}