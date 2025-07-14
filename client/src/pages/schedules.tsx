import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, Users, Camera } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const scheduleSchema = z.object({
  name: z.string().min(1, "Schedule name is required"),
  date: z.string().min(1, "Date is required"),
  type: z.string().min(1, "Schedule type is required"),
  description: z.string().optional(),
  location: z.string().optional(),
});

const eventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  location: z.string().optional(),
  type: z.string().min(1, "Event type is required"),
  notes: z.string().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;
type EventFormData = z.infer<typeof eventSchema>;

const scheduleTypes = [
  { value: "wedding_day", label: "Wedding Day" },
  { value: "rehearsal", label: "Rehearsal Dinner" },
  { value: "welcome_party", label: "Welcome Party" },
  { value: "brunch", label: "Day After Brunch" },
  { value: "custom", label: "Custom Event" },
];

const eventTypes = [
  { value: "ceremony", label: "Ceremony" },
  { value: "reception", label: "Reception" },
  { value: "photos", label: "Photography" },
  { value: "transportation", label: "Transportation" },
  { value: "vendor", label: "Vendor Arrival" },
  { value: "personal", label: "Personal Time" },
];

export default function Schedules() {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [activeScheduleTab, setActiveScheduleTab] = useState("");
  const { toast } = useToast();

  const { data: projects } = useQuery({
    queryKey: ['/api/wedding-projects']
  });

  const { data: schedules = [], isLoading, error } = useQuery({
    queryKey: ['/api/projects', '1', 'schedules']
  });

  const { data: events = [] } = useQuery({
    queryKey: ['/api/schedule-events', selectedSchedule?.id],
    enabled: !!selectedSchedule?.id
  });

  const scheduleForm = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      name: "",
      date: "",
      type: "",
      description: "",
      location: "",
    },
  });

  const eventForm = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      location: "",
      type: "",
      notes: "",
    },
  });

  // Handle null or error states
  if (error || schedules === null) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Schedule Management</h3>
            <p className="text-gray-600 mb-6">Create detailed schedules for your wedding day and events.</p>
            <Button className="gradient-blush-rose text-white">
              <Plus size={16} className="mr-2" />
              Create First Schedule
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const createScheduleMutation = useMutation({
    mutationFn: (data: ScheduleFormData) => apiRequest(`/api/projects/${projects?.[0]?.id}/schedules`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', '1', 'schedules'] });
      scheduleForm.reset();
      setIsScheduleDialogOpen(false);
      toast({ title: "Schedule created successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create schedule",
        variant: "destructive",
      });
    }
  });

  const createEventMutation = useMutation({
    mutationFn: (data: EventFormData) => {
      if (!selectedSchedule?.id) {
        throw new Error("No schedule selected");
      }
      return apiRequest(`/api/schedule-events`, {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          scheduleId: selectedSchedule.id,
          projectId: projects?.[0]?.id || 1,
          createdBy: 1 // Demo user
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedule-events', selectedSchedule?.id] });
      eventForm.reset();
      setIsEventDialogOpen(false);
      toast({ title: "Event added successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to add event",
        variant: "destructive",
      });
    }
  });

  const onScheduleSubmit = (data: ScheduleFormData) => {
    createScheduleMutation.mutate(data);
  };

  const onEventSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  // Set initial active tab when schedules load
  if (schedules.length > 0 && !activeScheduleTab) {
    setActiveScheduleTab(schedules[0].id.toString());
    setSelectedSchedule(schedules[0]);
  }

  const handleTabChange = (scheduleId: string) => {
    setActiveScheduleTab(scheduleId);
    const schedule = schedules.find(s => s.id.toString() === scheduleId);
    setSelectedSchedule(schedule);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      wedding_day: "bg-red-100 text-red-800",
      rehearsal: "bg-blue-100 text-blue-800",
      welcome_party: "bg-green-100 text-green-800",
      brunch: "bg-yellow-100 text-yellow-800",
      custom: "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      ceremony: "bg-pink-100 text-pink-800",
      reception: "bg-purple-100 text-purple-800",
      photos: "bg-blue-100 text-blue-800",
      transportation: "bg-green-100 text-green-800",
      vendor: "bg-orange-100 text-orange-800",
      personal: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (!projects?.[0]) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Create a wedding project to get started with schedules.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-gray-800 mb-2">
              Wedding Schedules
            </h1>
            <p className="text-gray-600">
              Organize your wedding events across multiple days
            </p>
          </div>
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-blush-rose text-white">
                    <Plus size={16} className="mr-2" />
                    New Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Schedule</DialogTitle>
                    <DialogDescription>
                      Create a timeline for wedding events like rehearsal dinner, ceremony, or reception.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...scheduleForm}>
                    <form onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)} className="space-y-4">
                      <FormField
                        control={scheduleForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Schedule Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Wedding Day Schedule" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={scheduleForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={scheduleForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Schedule Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {scheduleTypes.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={scheduleForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Main venue or location" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={scheduleForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Schedule overview..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="gradient-blush-rose text-white"
                          disabled={createScheduleMutation.isPending}
                        >
                          {createScheduleMutation.isPending ? "Creating..." : "Create Schedule"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
          </Dialog>
        </div>

        {schedules.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No schedules yet</h3>
                  <p className="text-gray-500 text-center mb-6">
                    Create your first schedule to organize wedding day events and activities.
                  </p>
                  <Button 
                    onClick={() => setIsScheduleDialogOpen(true)}
                    className="gradient-blush-rose text-white"
                  >
                    <Plus size={16} className="mr-2" />
                    Create First Schedule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Tabs value={activeScheduleTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 h-auto bg-transparent">
                  {schedules.map((schedule) => (
                    <TabsTrigger
                      key={schedule.id}
                      value={schedule.id.toString()}
                      className="flex flex-col items-start p-4 h-auto data-[state=active]:bg-white data-[state=active]:shadow-sm border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-medium text-sm">{schedule.name}</span>
                        <Badge className={getTypeColor(schedule.type)}>
                          {scheduleTypes.find(t => t.value === schedule.type)?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar size={12} className="mr-1" />
                        {schedule.date ? (() => {
                          try {
                            return format(new Date(schedule.date), 'MMM dd, yyyy');
                          } catch {
                            return 'Invalid date';
                          }
                        })() : 'Date not set'}
                      </div>
                      {schedule.location && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin size={12} className="mr-1" />
                          {schedule.location}
                        </div>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {schedules.map((schedule) => (
                  <TabsContent key={schedule.id} value={schedule.id.toString()}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center space-x-3">
                              <span>{schedule.name}</span>
                              <Badge className={getTypeColor(schedule.type)}>
                                {scheduleTypes.find(t => t.value === schedule.type)?.label}
                              </Badge>
                            </CardTitle>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                              <div className="flex items-center">
                                <Calendar size={16} className="mr-1" />
                                {schedule.date ? (() => {
                                  try {
                                    return format(new Date(schedule.date), 'EEEE, MMMM dd, yyyy');
                                  } catch {
                                    return 'Invalid date';
                                  }
                                })() : 'Date not set'}
                              </div>
                              {schedule.location && (
                                <div className="flex items-center">
                                  <MapPin size={16} className="mr-1" />
                                  {schedule.location}
                                </div>
                              )}
                            </div>
                            {schedule.description && (
                              <p className="text-gray-600 mt-2">{schedule.description}</p>
                            )}
                          </div>
                          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="gradient-blush-rose text-white">
                                <Plus size={16} className="mr-2" />
                                Add Event
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Add Event to {schedule.name}</DialogTitle>
                              </DialogHeader>
                              <Form {...eventForm}>
                                <form onSubmit={eventForm.handleSubmit(onEventSubmit)} className="space-y-4">
                                  <FormField
                                    control={eventForm.control}
                                    name="title"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Event Title *</FormLabel>
                                        <FormControl>
                                          <Input placeholder="e.g., Ceremony" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={eventForm.control}
                                    name="type"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Event Type *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {eventTypes.map(type => (
                                              <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                      control={eventForm.control}
                                      name="startTime"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Start Time *</FormLabel>
                                          <FormControl>
                                            <Input type="time" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={eventForm.control}
                                      name="endTime"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>End Time</FormLabel>
                                          <FormControl>
                                            <Input type="time" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <FormField
                                    control={eventForm.control}
                                    name="location"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Event location" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={eventForm.control}
                                    name="description"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                          <Textarea placeholder="Event details..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                                      Cancel
                                    </Button>
                                    <Button 
                                      type="submit" 
                                      className="gradient-blush-rose text-white"
                                      disabled={createEventMutation.isPending}
                                    >
                                      {createEventMutation.isPending ? "Adding..." : "Add Event"}
                                    </Button>
                                  </div>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {events.length === 0 ? (
                          <div className="text-center py-8">
                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">No events scheduled</p>
                            <p className="text-sm text-gray-500 mb-4">Add your first event to this schedule</p>
                            <Button 
                              onClick={() => setIsEventDialogOpen(true)}
                              className="gradient-blush-rose text-white"
                            >
                              <Plus size={16} className="mr-2" />
                              Add Event
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {events
                              .sort((a, b) => {
                                try {
                                  // Helper function to extract time for comparison
                                  const getTimeForSort = (timeStr) => {
                                    if (timeStr.includes('T')) {
                                      // Extract time from ISO string like "2000-01-01T08:00:00.000Z"
                                      const timeMatch = timeStr.match(/T(\d{2}):(\d{2})/);
                                      if (timeMatch) {
                                        return parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
                                      }
                                    }
                                    // Handle simple time format like "08:00"
                                    const [hours, minutes] = timeStr.split(':').map(Number);
                                    return hours * 60 + minutes;
                                  };
                                  
                                  return getTimeForSort(a.startTime) - getTimeForSort(b.startTime);
                                } catch {
                                  return 0;
                                }
                              })
                              .map((event) => (
                              <div key={event.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blush to-rose-gold flex items-center justify-center">
                                    {event.type === 'ceremony' && <Users className="text-white" size={20} />}
                                    {event.type === 'reception' && <Calendar className="text-white" size={20} />}
                                    {event.type === 'photos' && <Camera className="text-white" size={20} />}
                                    {!['ceremony', 'reception', 'photos'].includes(event.type) && <Clock className="text-white" size={20} />}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-800">{event.title}</h4>
                                    <Badge className={getEventTypeColor(event.type)}>
                                      {eventTypes.find(t => t.value === event.type)?.label}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                    <div className="flex items-center">
                                      <Clock size={14} className="mr-1" />
                                      {(() => {
                                        try {
                                          // Handle both time strings and ISO date strings
                                          let timeStr = event.startTime;
                                          if (timeStr.includes('T')) {
                                            // Extract time from ISO string like "2000-01-01T08:00:00.000Z"
                                            const timeMatch = timeStr.match(/T(\d{2}):(\d{2})/);
                                            if (timeMatch) {
                                              const hours = parseInt(timeMatch[1]);
                                              const minutes = timeMatch[2];
                                              const period = hours >= 12 ? 'PM' : 'AM';
                                              const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                                              return `${displayHours}:${minutes} ${period}`;
                                            }
                                          }
                                          return format(new Date(`2000-01-01T${timeStr}`), 'h:mm a');
                                        } catch {
                                          return event.startTime;
                                        }
                                      })()}
                                      {event.endTime && (
                                        <span> - {(() => {
                                          try {
                                            // Handle both time strings and ISO date strings
                                            let timeStr = event.endTime;
                                            if (timeStr.includes('T')) {
                                              // Extract time from ISO string like "2000-01-01T17:00:00.000Z"
                                              const timeMatch = timeStr.match(/T(\d{2}):(\d{2})/);
                                              if (timeMatch) {
                                                const hours = parseInt(timeMatch[1]);
                                                const minutes = timeMatch[2];
                                                const period = hours >= 12 ? 'PM' : 'AM';
                                                const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                                                return `${displayHours}:${minutes} ${period}`;
                                              }
                                            }
                                            return format(new Date(`2000-01-01T${timeStr}`), 'h:mm a');
                                          } catch {
                                            return event.endTime;
                                          }
                                        })()}</span>
                                      )}
                                    </div>
                                    {event.location && (
                                      <div className="flex items-center">
                                        <MapPin size={14} className="mr-1" />
                                        {event.location}
                                      </div>
                                    )}
                                  </div>
                                  {event.description && (
                                    <p className="text-sm text-gray-600">{event.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            )}
      </div>
    </div>
  );
}