import { useState, useMemo, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Mail, Phone, MapPin, Filter, UserPlus, Send } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useGuests, useGuestStats, useBulkUpdateGuests } from "@/hooks/useGuests";
import GuestFormDialog from "@/components/guests/GuestFormDialog";
import LoadingSpinner from "@/components/ui/loading-spinner";

const groupFilters = [
  { value: "", label: "All Groups" },
  { value: "wedding_party", label: "Wedding Party" },
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
  { value: "colleagues", label: "Colleagues" },
  { value: "other", label: "Other" }
];

const rsvpFilters = [
  { value: "", label: "All RSVP Status" },
  { value: "pending", label: "Pending" },
  { value: "yes", label: "Attending" },
  { value: "no", label: "Not Attending" },
  { value: "maybe", label: "Maybe" }
];

const rsvpStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  yes: "bg-green-100 text-green-800",
  no: "bg-red-100 text-red-800",
  maybe: "bg-blue-100 text-blue-800"
};

export default function Guests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterRsvp, setFilterRsvp] = useState("");
  const [selectedGuests, setSelectedGuests] = useState<number[]>([]);

  // Fetch data using hooks
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const currentProject = projects?.find(p => p.name === "Emma & Jake's Wedding") || projects?.[0];
  const projectId = currentProject?.id?.toString();
  
  const { data: guests = [], isLoading: guestsLoading, error: guestsError } = useGuests(projectId);
  const guestStats = useGuestStats(projectId);
  const bulkUpdate = useBulkUpdateGuests(projectId || "");

  // Filter logic
  const filteredGuests = useMemo(() => {
    if (!guests) return [];
    
    return guests.filter(guest => {
      const matchesSearch = !searchTerm || 
        guest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.group?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGroup = !filterGroup || guest.group === filterGroup;
      const matchesRsvp = !filterRsvp || guest.rsvpStatus === filterRsvp;
      
      return matchesSearch && matchesGroup && matchesRsvp;
    });
  }, [guests, searchTerm, filterGroup, filterRsvp]);

  const handleSelectGuest = (guestId: number, checked: boolean) => {
    if (checked) {
      setSelectedGuests([...selectedGuests, guestId]);
    } else {
      setSelectedGuests(selectedGuests.filter(id => id !== guestId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGuests(filteredGuests.map(guest => guest.id));
    } else {
      setSelectedGuests([]);
    }
  };

  const handleBulkRsvpUpdate = async (rsvpStatus: string) => {
    if (selectedGuests.length === 0) return;
    
    try {
      await bulkUpdate.mutateAsync({
        guestIds: selectedGuests,
        updates: { rsvpStatus }
      });
      setSelectedGuests([]);
    } catch (error) {
      console.error('Failed to update guests:', error);
    }
  };

  // Loading and error states
  if (projectsLoading || guestsLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading your guest list..." />
      </div>
    );
  }

  if (guestsError) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>Error loading guests. Please try again.</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600">
          <p>No wedding project found. Please create a project first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Guest List</h1>
            <p className="text-gray-600">
              Manage your wedding guests and track RSVPs
            </p>
          </div>
          <GuestFormDialog projectId={projectId} />
        </div>

        {/* Quick Stats */}
        {guestStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{guestStats.total}</div>
                <div className="text-sm text-gray-600">Total Guests</div>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{guestStats.confirmed}</div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{guestStats.declined}</div>
                <div className="text-sm text-gray-600">Declined</div>
              </CardContent>
            </Card>
            <Card className="border-yellow-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{guestStats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            <Card className="border-purple-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{guestStats.totalAttending}</div>
                <div className="text-sm text-gray-600">Expected Attending</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <Select value={filterGroup} onValueChange={setFilterGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by group" />
            </SelectTrigger>
            <SelectContent>
              {groupFilters.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterRsvp} onValueChange={setFilterRsvp}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by RSVP" />
            </SelectTrigger>
            <SelectContent>
              {rsvpFilters.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedGuests.length === filteredGuests.length && filteredGuests.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm">
              Select all ({selectedGuests.length})
            </label>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedGuests.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                {selectedGuests.length} guest{selectedGuests.length === 1 ? '' : 's'} selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkRsvpUpdate('yes')}
                  disabled={bulkUpdate.isPending}
                >
                  Mark Attending
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkRsvpUpdate('no')}
                  disabled={bulkUpdate.isPending}
                >
                  Mark Declined
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedGuests([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guest List */}
      {filteredGuests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto mb-4 w-16 h-16 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No guests found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterGroup || filterRsvp 
                ? "Try adjusting your filters to see more guests."
                : "Get started by adding your first guest."
              }
            </p>
            {(!searchTerm && !filterGroup && !filterRsvp) && (
              <GuestFormDialog projectId={projectId} />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredGuests.map((guest: any) => (
            <Card key={guest.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedGuests.includes(guest.id)}
                    onCheckedChange={(checked) => handleSelectGuest(guest.id, checked as boolean)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{guest.name}</h3>
                      <div className="flex gap-2">
                        <Badge 
                          className={`${rsvpStatusColors[guest.rsvpStatus as keyof typeof rsvpStatusColors]} border-0`}
                        >
                          {guest.rsvpStatus === 'yes' ? 'Attending' : 
                           guest.rsvpStatus === 'no' ? 'Declined' : 
                           guest.rsvpStatus === 'maybe' ? 'Maybe' : 'Pending'}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {guest.group?.replace('_', ' ') || 'other'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      {guest.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{guest.email}</span>
                        </div>
                      )}
                      {guest.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{guest.phone}</span>
                        </div>
                      )}
                      {guest.attendingCount && guest.attendingCount > 1 && (
                        <div className="flex items-center gap-1">
                          <UserPlus className="w-4 h-4" />
                          <span>+{guest.attendingCount - 1} guest{guest.attendingCount > 2 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    {(guest.dietaryRestrictions || guest.mealChoice) && (
                      <div className="mt-2 text-sm text-gray-600">
                        {guest.mealChoice && <span className="mr-2">Meal: {guest.mealChoice}</span>}
                        {guest.dietaryRestrictions && <span>Dietary: {guest.dietaryRestrictions}</span>}
                      </div>
                    )}
                    
                    {guest.notes && (
                      <p className="text-sm text-gray-600 mt-2">{guest.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!guest.inviteSent && (
                      <Button size="sm" variant="outline">
                        <Send className="w-4 h-4 mr-1" />
                        Send Invite
                      </Button>
                    )}
                    <GuestFormDialog
                      projectId={projectId}
                      guest={guest}
                      trigger={
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}