import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Plus, Mail, Phone, MapPin, Search, Download, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const guestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  group: z.string().min(1, "Group is required"),
  mealPreference: z.string().optional(),
  plusOne: z.boolean().default(false),
  hotel: z.string().optional(),
  hotelAddress: z.string().optional(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  notes: z.string().optional(),
});

type GuestFormData = z.infer<typeof guestSchema>;



const rsvpStatusColors = {
  accepted: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  declined: "bg-red-100 text-red-800"
};

export default function Guests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterRsvp, setFilterRsvp] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: projects } = useQuery({
    queryKey: ['/api/wedding-projects']
  });

  const { data: guests = [] } = useQuery({
    queryKey: ['/api/guests']
  });

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      group: "",
      mealPreference: "",
      plusOne: false,
      hotel: "",
      hotelAddress: "",
      checkInDate: "",
      checkOutDate: "",
      notes: "",
    },
  });

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = !filterGroup || guest.group === filterGroup;
    const matchesRsvp = !filterRsvp || guest.rsvpStatus === filterRsvp;
    return matchesSearch && matchesGroup && matchesRsvp;
  });

  const createGuestMutation = useMutation({
    mutationFn: (data: GuestFormData) => apiRequest(`/api/projects/${projects[0].id}/guests`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projects[0].id, 'guests'] });
      form.reset();
      setIsAddDialogOpen(false);
      toast({ title: "Guest added successfully!" });
    }
  });

  const onSubmit = (data: GuestFormData) => {
    createGuestMutation.mutate(data);
  };

  const totalGuests = guests.length;
  const acceptedGuests = guests.filter(g => g.rsvpStatus === "accepted").length;
  const pendingGuests = guests.filter(g => g.rsvpStatus === "pending").length;
  const totalAttending = guests.filter(g => g.rsvpStatus === "accepted").reduce((sum, g) => sum + (g.plusOne ? 2 : 1), 0);

  const groups = [...new Set(guests.map(g => g.group))];

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <Header />
        
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-serif text-3xl font-semibold text-gray-800 mb-2">
                  Guest List
                </h1>
                <p className="text-gray-600">
                  Manage your wedding guests and track RSVPs
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline">
                  <Download size={16} className="mr-2" />
                  Export List
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gradient-blush-rose text-white">
                      <Plus size={16} className="mr-2" />
                      Add Guest
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Guest</DialogTitle>
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
                                <Input placeholder="Enter guest name" {...field} />
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
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter email address" {...field} />
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
                                <Input placeholder="Enter phone number" {...field} />
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
                              <FormLabel>Group *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select group" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Family">Family</SelectItem>
                                  <SelectItem value="Friends">Friends</SelectItem>
                                  <SelectItem value="Work">Work</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="plusOne"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Plus One</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="hotel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hotel</FormLabel>
                              <FormControl>
                                <Input placeholder="Hotel name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="hotelAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hotel Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Hotel address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="checkInDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Check-in Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="checkOutDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Check-out Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
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
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Any special notes or requirements..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="gradient-blush-rose text-white"
                            disabled={createGuestMutation.isPending}
                          >
                            {createGuestMutation.isPending ? "Adding..." : "Add Guest"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Guest Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Users className="text-blush" size={20} />
                    <span>Total Guests</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{totalGuests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Users className="text-green-600" size={20} />
                    <span>Accepted</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{acceptedGuests}</div>
                  <div className="text-sm text-gray-600">
                    {totalGuests > 0 ? Math.round((acceptedGuests / totalGuests) * 100) : 0}% response rate
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Users className="text-yellow-600" size={20} />
                    <span>Pending</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{pendingGuests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Users className="text-blue-600" size={20} />
                    <span>Attending</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">{totalAttending}</div>
                  <div className="text-sm text-gray-600">Including plus ones</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <Input
                        placeholder="Search guests by name or email..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={filterGroup} onValueChange={setFilterGroup}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Groups" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Groups</SelectItem>
                      {groups.map(group => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterRsvp} onValueChange={setFilterRsvp}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All RSVPs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All RSVPs</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Guest List */}
            <Card>
              <CardHeader>
                <CardTitle>Guest List ({filteredGuests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredGuests.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No guests found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || filterGroup || filterRsvp 
                          ? "Try adjusting your search or filters" 
                          : "Get started by adding your first guest"}
                      </p>
                    </div>
                  ) : (
                    filteredGuests.map((guest) => (
                      <div key={guest.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-800">{guest.name}</h3>
                            <Badge className={rsvpStatusColors[guest.rsvpStatus as keyof typeof rsvpStatusColors]}>
                              {guest.rsvpStatus}
                            </Badge>
                            <Badge variant="outline">{guest.group}</Badge>
                            {guest.plusOne && (
                              <Badge variant="secondary">+1</Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-6 text-sm text-gray-600">
                            {guest.email && (
                              <div className="flex items-center space-x-1">
                                <Mail size={14} />
                                <span>{guest.email}</span>
                              </div>
                            )}
                            {guest.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone size={14} />
                                <span>{guest.phone}</span>
                              </div>
                            )}
                            {guest.mealPreference && (
                              <div className="text-sm">
                                <span className="font-medium">Meal:</span> {guest.mealPreference}
                              </div>
                            )}
                          </div>
                          
                          {(guest.hotel || guest.notes) && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              {guest.hotel && (
                                <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                                  <MapPin size={14} />
                                  <span className="font-medium">Hotel:</span>
                                  <span>{guest.hotel}</span>
                                  {guest.hotelAddress && <span className="text-gray-500">• {guest.hotelAddress}</span>}
                                </div>
                              )}
                              {(guest.checkInDate || guest.checkOutDate) && (
                                <div className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">Stay:</span>
                                  {guest.checkInDate && <span> Check-in: {new Date(guest.checkInDate).toLocaleDateString()}</span>}
                                  {guest.checkOutDate && <span> • Check-out: {new Date(guest.checkOutDate).toLocaleDateString()}</span>}
                                </div>
                              )}
                              {guest.notes && (
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Notes:</span>
                                  <span className="ml-1">{guest.notes}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Send RSVP
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
