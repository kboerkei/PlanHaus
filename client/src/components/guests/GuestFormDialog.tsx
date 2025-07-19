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
import { Plus, UserPlus } from "lucide-react";
import { guestSchema, GuestFormData } from "@/schemas";
import { useCreateGuest, useUpdateGuest } from "@/hooks/useGuests";
import { useToast } from "@/hooks/use-toast";

interface GuestFormDialogProps {
  projectId: string;
  guest?: any;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

export default function GuestFormDialog({ projectId, guest, trigger, onClose }: GuestFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [useCustomGroup, setUseCustomGroup] = useState(false);
  const { toast } = useToast();
  const createGuest = useCreateGuest(projectId);
  const updateGuest = useUpdateGuest(projectId);

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: guest?.name || "",
      email: guest?.email || "",
      phone: guest?.phone || "",
      group: guest?.group || "friends",
      customGroup: guest?.customGroup || "",
      rsvpStatus: guest?.rsvpStatus || "pending",
      attendingCount: guest?.attendingCount || 1,
      mealChoice: guest?.mealChoice || undefined,
      dietaryRestrictions: guest?.dietaryRestrictions || "",
      hotelInfo: guest?.hotelInfo || "",
      notes: guest?.notes || "",
      tags: guest?.tags || "",
      inviteSent: guest?.inviteSent || false,
    },
  });

  const onSubmit = async (data: GuestFormData) => {
    try {
      // If using custom group, clear the predefined group
      if (useCustomGroup && data.customGroup) {
        data.group = "other";
      } else {
        data.customGroup = "";
      }

      if (guest) {
        await updateGuest.mutateAsync({ id: guest.id, data });
        toast({ title: "Guest updated successfully!" });
      } else {
        await createGuest.mutateAsync(data);
        toast({ title: "Guest added successfully!" });
      }
      form.reset();
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      toast({
        title: "Error",
        description: guest ? "Failed to update guest" : "Failed to add guest",
        variant: "destructive"
      });
    }
  };

  const defaultTrigger = (
    <Button className="gradient-blush-rose text-white">
      <Plus className="w-4 h-4 mr-2" />
      Add Guest
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" aria-describedby="guest-form-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {guest ? "Edit Guest" : "Add New Guest"}
          </DialogTitle>
          <DialogDescription id="guest-form-description">
            {guest ? "Update the guest details below." : "Add a new guest to your wedding list."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Guest name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="guest@email.com" {...field} />
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

            <div className="space-y-3">
              <FormLabel>Group</FormLabel>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="custom-group"
                  checked={useCustomGroup}
                  onCheckedChange={setUseCustomGroup}
                />
                <label htmlFor="custom-group" className="text-sm">
                  Use custom group name
                </label>
              </div>

              {useCustomGroup ? (
                <FormField
                  control={form.control}
                  name="customGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Enter custom group name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="group"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="friends">Friends</SelectItem>
                          <SelectItem value="coworkers">Coworkers</SelectItem>
                          <SelectItem value="wedding_party">Wedding Party</SelectItem>
                          <SelectItem value="plus_ones">Plus Ones</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="maybe">Maybe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attendingCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attending Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="mealChoice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Choice</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meal preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="chicken">Chicken</SelectItem>
                      <SelectItem value="beef">Beef</SelectItem>
                      <SelectItem value="fish">Fish</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                  <FormLabel>Dietary Restrictions</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Gluten-free, nut allergy..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hotelInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Information</FormLabel>
                  <FormControl>
                    <Input placeholder="Hotel name, room number..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="VIP, elderly, child-friendly..." {...field} />
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

            <FormField
              control={form.control}
              name="inviteSent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Invitation sent</FormLabel>
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
                disabled={createGuest.isPending || updateGuest.isPending}
                className="gradient-blush-rose text-white"
              >
                {createGuest.isPending || updateGuest.isPending ? "Saving..." : (guest ? "Update Guest" : "Add Guest")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}