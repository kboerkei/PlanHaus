import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle, Heart, Calendar as CalendarLucide, Gift, Users, Utensils, Building } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { eventIntakeConfigs } from "@/config/eventIntakeConfigs";

interface DynamicIntakeProps {
  onComplete: () => void;
}

const eventIcons = {
  wedding: Heart,
  birthday: CalendarLucide,
  baby_shower: Gift,
  reunion: Users,
  dinner_party: Utensils,
  corporate: Building
};

const eventDisplayNames = {
  wedding: 'Wedding',
  birthday: 'Birthday Party',
  baby_shower: 'Baby Shower',
  reunion: 'Reunion',
  dinner_party: 'Dinner Party',
  corporate: 'Corporate Event'
};

export default function DynamicIntake({ onComplete }: DynamicIntakeProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentEventType, setCurrentEventType] = useState<string>('');

  // Get current user to determine event type
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: () => apiRequest('/api/auth/me')
  });

  useEffect(() => {
    if (user?.eventType) {
      setCurrentEventType(user.eventType);
    }
  }, [user]);

  const submitMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      // Create a project based on the event type and form data
      const projectData = formatProjectData(data, currentEventType);
      return await apiRequest("/api/projects", {
        method: "POST",
        body: projectData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Setup Complete!",
        description: `Your ${eventDisplayNames[currentEventType]} planning details have been saved.`,
      });
      onComplete();
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatProjectData = (data: Record<string, any>, eventType: string) => {
    // Format the data based on event type
    switch (eventType) {
      case 'wedding':
        return {
          name: data.partnerName ? `${user?.username} & ${data.partnerName}'s Wedding` : `${user?.username}'s Wedding`,
          date: data.weddingDate,
          venue: data.city || 'TBD',
          theme: data.vision || 'Classic Wedding',
          budget: data.budget?.toString() || '25000',
          guestCount: data.guestCount || 100,
          style: data.venueType || 'Indoor',
          description: data.vision || `A beautiful ${data.venueType?.toLowerCase()} wedding celebration`,
          eventType: 'wedding'
        };
      
      case 'birthday':
        return {
          name: data.name ? `${data.name}'s ${data.age ? `${data.age}th ` : ''}Birthday Party` : `Birthday Party`,
          date: data.birthdayDate,
          venue: 'TBD',
          theme: data.theme || 'Birthday Celebration',
          budget: '1000',
          guestCount: data.guestCount || 20,
          style: data.theme || 'Birthday Party',
          description: data.activities || `A fun birthday celebration${data.age ? ` for turning ${data.age}` : ''}`,
          eventType: 'birthday'
        };
      
      case 'baby_shower':
        return {
          name: data.parentName ? `${data.parentName}'s Baby Shower` : 'Baby Shower',
          date: data.babyShowerDate,
          venue: 'TBD',
          theme: data.theme || 'Baby Shower',
          budget: '500',
          guestCount: data.guestCount || 15,
          style: data.gender || 'Neutral',
          description: data.activities || `A lovely baby shower celebration${data.dueDate ? ` with baby due ${format(new Date(data.dueDate), 'MMMM yyyy')}` : ''}`,
          eventType: 'baby_shower'
        };
      
      case 'reunion':
        return {
          name: data.groupName ? `${data.groupName} Reunion` : `${data.reunionType} Reunion`,
          date: data.reunionDate,
          venue: 'TBD',
          theme: data.reunionType || 'Reunion',
          budget: '2000',
          guestCount: data.guestCount || 50,
          style: data.reunionType || 'Family',
          description: data.activities || `A ${data.reunionType?.toLowerCase()} reunion${data.yearsApart ? ` after ${data.yearsApart} years` : ''}`,
          eventType: 'reunion'
        };
      
      case 'dinner_party':
        return {
          name: data.occasion ? `${data.occasion} Dinner Party` : 'Dinner Party',
          date: data.dinnerDate,
          venue: 'TBD',
          theme: data.cuisine || 'Dinner Party',
          budget: '300',
          guestCount: data.guestCount || 8,
          style: data.seatingStyle || 'Formal Seated',
          description: data.specialNotes || `An elegant ${data.cuisine?.toLowerCase()} dinner party`,
          eventType: 'dinner_party'
        };
      
      case 'corporate':
        return {
          name: data.company ? `${data.company} ${data.eventType}` : data.eventType || 'Corporate Event',
          date: data.eventDate,
          venue: 'TBD',
          theme: data.eventType || 'Corporate Event',
          budget: data.budget?.toString() || '5000',
          guestCount: data.attendeeCount || 100,
          style: data.eventType || 'Professional',
          description: data.objectives || `A professional ${data.eventType?.toLowerCase()} event`,
          eventType: 'corporate'
        };
      
      default:
        return {
          name: 'Event Planning',
          date: new Date(),
          venue: 'TBD',
          theme: 'Event',
          budget: '1000',
          guestCount: 50,
          style: 'General',
          description: 'Event planning',
          eventType: eventType
        };
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const renderField = (field: any) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              value={value}
              onChange={(e) => handleInputChange(field.id, parseInt(e.target.value) || '')}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              rows={3}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), "PPP") : `Pick ${field.label.toLowerCase()}`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => handleInputChange(field.id, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      default:
        return null;
    }
  };

  if (!currentEventType || !eventIntakeConfigs[currentEventType]) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600">Loading your event planning form...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = eventIntakeConfigs[currentEventType];
  const Icon = eventIcons[currentEventType] || Heart;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 p-4 pb-20 lg:pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-rose-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">
            {eventDisplayNames[currentEventType]} Planning Setup
          </h1>
          <p className="text-gray-600">
            Tell us about your {eventDisplayNames[currentEventType].toLowerCase()} to get personalized planning tools
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-rose-600" />
              {eventDisplayNames[currentEventType]} Details
            </CardTitle>
            <CardDescription>
              Please fill out the information below to customize your planning experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {config.map(renderField)}

              <div className="pt-6 border-t">
                <Button 
                  type="submit" 
                  className="w-full gradient-blush-rose text-white"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    "Setting up your planning workspace..."
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Setup & Start Planning
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}