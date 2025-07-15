import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import SearchFilterBar from "@/components/ui/search-filter-bar";
import ExportOptions from "@/components/ui/export-options";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Plus, Mail, Phone, MapPin, Search, Download, Filter, Upload, FileText, FileSpreadsheet } from "lucide-react";
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
  attending: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800", 
  declined: "bg-red-100 text-red-800",
  no_response: "bg-gray-100 text-gray-800"
};

export default function Guests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterRsvp, setFilterRsvp] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const { data: projects } = useQuery({
    queryKey: ['/api/wedding-projects']
  });

  const { data: guests = [], isLoading, error } = useQuery({
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

  const editForm = useForm<GuestFormData>({
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

  const filteredGuests = (guests || []).filter((guest: any) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGroup = !filterGroup || filterGroup === 'all' || guest.group === filterGroup;
    const matchesRsvp = !filterRsvp || filterRsvp === 'all' || guest.rsvpStatus === filterRsvp;
    return matchesSearch && matchesGroup && matchesRsvp;
  });

  const groups = [...new Set((guests || []).map((guest: any) => guest.group))].filter(Boolean);
  const totalGuests = guests?.length || 0;
  const attendingGuests = guests?.filter((guest: any) => guest.rsvpStatus === 'confirmed' || guest.rsvpStatus === 'attending').length || 0;
  const acceptedGuests = attendingGuests;
  const pendingGuests = guests?.filter((guest: any) => guest.rsvpStatus === 'pending').length || 0;
  const declinedGuests = guests?.filter((guest: any) => guest.rsvpStatus === 'declined').length || 0;
  const noResponseGuests = guests?.filter((guest: any) => guest.rsvpStatus === 'no_response').length || 0;

  const createGuestMutation = useMutation({
    mutationFn: (data: GuestFormData) => apiRequest('/api/guests', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guests'] });
      form.reset();
      setIsAddDialogOpen(false);
      toast({ title: "Guest added successfully!" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to add guest", 
        variant: "destructive" 
      });
    }
  });

  const onSubmit = (data: GuestFormData) => {
    createGuestMutation.mutate(data);
  };

  const updateGuestMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GuestFormData> }) =>
      apiRequest(`/api/guests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guests'] });
      toast({
        title: "Success",
        description: "Guest updated successfully",
      });
      editForm.reset();
      setIsEditDialogOpen(false);
      setEditingGuest(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update guest",
        variant: "destructive",
      });
    }
  });

  const onEditSubmit = (data: GuestFormData) => {
    if (editingGuest) {
      updateGuestMutation.mutate({ id: editingGuest.id, data });
    }
  };

  const handleEditGuest = (guest: any) => {
    setEditingGuest(guest);
    editForm.reset({
      name: guest.name || "",
      email: guest.email || "",
      phone: guest.phone || "",
      address: guest.address || "",
      group: guest.group || "",
      mealPreference: guest.mealPreference || "",
      plusOne: guest.plusOne || false,
      hotel: guest.hotel || "",
      hotelAddress: guest.hotelAddress || "",
      checkInDate: guest.checkInDate ? new Date(guest.checkInDate).toISOString().split('T')[0] : "",
      checkOutDate: guest.checkOutDate ? new Date(guest.checkOutDate).toISOString().split('T')[0] : "",
      notes: guest.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const updateRsvpMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest(`/api/guests/${id}/rsvp`, {
        method: 'PATCH',
        body: JSON.stringify({ rsvpStatus: status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guests'] });
      toast({
        title: "Success",
        description: "RSVP status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update RSVP status",
        variant: "destructive",
      });
    }
  });

  const updateRsvpStatus = (guestId: number, status: string) => {
    updateRsvpMutation.mutate({ id: guestId, status });
  };

  const totalAttending = (guests || []).filter(g => g.rsvpStatus === "attending").reduce((sum, g) => sum + (g.plusOne ? 2 : 1), 0);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-lg">Loading guests...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Guest Management</h3>
            <p className="text-gray-600 mb-6">Start building your guest list for your special day.</p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-blush-rose text-white">
                  <Plus size={16} className="mr-2" />
                  Add First Guest
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Guest</DialogTitle>
                  <DialogDescription>
                    Add guests to your wedding list with contact details and RSVP tracking.
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
                      name="group"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
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
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createGuestMutation.isPending} className="gradient-blush-rose text-white">
                        {createGuestMutation.isPending ? "Adding..." : "Add Guest"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-rose-500 rounded-lg">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-4xl font-semibold text-gray-900 tracking-tight">
                  Guest List
                </h1>
                <p className="text-gray-600 text-xs md:text-lg mt-1">
                  Manage your wedding guests and track RSVPs
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2 md:space-x-3 w-full md:w-auto">
              <ExportOptions 
                data={filteredGuests}
                filename="wedding-guest-list"
                type="guests"
              />
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-blush-rose text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex-1 md:flex-none">
                    <Plus size={16} className="mr-2" />
                    Add Guest
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm mobile-dialog">
                  <DialogHeader>
                    <DialogTitle>Add New Guest</DialogTitle>
                    <DialogDescription>
                      Add essential guest details (more details can be added later).
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 mobile-form">
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
                        name="group"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Group *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
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
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="mobile-touch">
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="gradient-blush-rose text-white mobile-touch"
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
                <Users className="text-blue-600" size={20} />
                <span>Attending</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{totalAttending}</div>
              <div className="text-sm text-gray-600">Including plus ones</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="text-red-600" size={20} />
                <span>Declined</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{declinedGuests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="text-gray-600" size={20} />
                <span>No Response</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{noResponseGuests}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Search guests by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <Select value={filterGroup} onValueChange={setFilterGroup}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterRsvp} onValueChange={setFilterRsvp}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by RSVP" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="attending">Attending</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="no_response">No Response</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No guests found matching your criteria.</p>
                </div>
              ) : (
                filteredGuests.map((guest: any) => (
                  <div key={guest.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{guest.name}</h3>
                          <Badge className={rsvpStatusColors[guest.rsvpStatus] || rsvpStatusColors.no_response}>
                            {guest.rsvpStatus === 'no_response' ? 'No Response' : 
                             guest.rsvpStatus === 'attending' ? 'Attending' :
                             guest.rsvpStatus}
                          </Badge>
                          <Badge variant="outline">{guest.group}</Badge>
                          {guest.plusOne && <Badge variant="secondary">+1</Badge>}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {guest.email && (
                            <div className="flex items-center space-x-1">
                              <Mail size={16} />
                              <span>{guest.email}</span>
                            </div>
                          )}
                          {guest.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone size={16} />
                              <span>{guest.phone}</span>
                            </div>
                          )}
                        </div>
                        {(guest.hotel || guest.notes) && (
                          <div className="mt-2 text-sm text-gray-600">
                            {guest.hotel && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Hotel:</span>
                                <span className="ml-1">{guest.hotel}</span>
                                {guest.hotelAddress && <span className="ml-1">({guest.hotelAddress})</span>}
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
                        <Select 
                          value={guest.rsvpStatus || "no_response"} 
                          onValueChange={(value) => updateRsvpStatus(guest.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attending">Attending</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                            <SelectItem value="no_response">No Response</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditGuest(guest)}
                          className="mobile-touch"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Guest Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto mobile-dialog">
          <DialogHeader>
            <DialogTitle>Edit Guest</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-3">
              <div className="space-y-3">
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
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
                  control={editForm.control}
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
                  control={editForm.control}
                  name="group"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select guest group" />
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
              </div>

              <FormField
                control={editForm.control}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
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
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any special notes, dietary restrictions, or other details..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingGuest(null);
                    editForm.reset();
                  }}
                  className="mobile-touch"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateGuestMutation.isPending}
                  className="gradient-blush-rose text-white mobile-touch"
                >
                  {updateGuestMutation.isPending ? "Updating..." : "Update Guest"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}