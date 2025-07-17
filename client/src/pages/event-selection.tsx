import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Gift, Users, Utensils, Building } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EventType {
  id: string;
  name: string;
  description: string;
  icon: typeof Heart;
  color: string;
  gradient: string;
}

const eventTypes: EventType[] = [
  {
    id: 'wedding',
    name: 'Wedding',
    description: 'Plan your perfect wedding with comprehensive tools for venues, vendors, and guests',
    icon: Heart,
    color: 'text-rose-600',
    gradient: 'from-rose-100 to-pink-100'
  },
  {
    id: 'birthday',
    name: 'Birthday Party',
    description: 'Celebrate life with party planning tools for invitations, decorations, and entertainment',
    icon: Calendar,
    color: 'text-purple-600',
    gradient: 'from-purple-100 to-violet-100'
  },
  {
    id: 'baby_shower',
    name: 'Baby Shower',
    description: 'Welcome the new arrival with thoughtful planning for gifts, games, and celebrations',
    icon: Gift,
    color: 'text-blue-600',
    gradient: 'from-blue-100 to-sky-100'
  },
  {
    id: 'reunion',
    name: 'Reunion',
    description: 'Reconnect with family and friends through organized events and shared memories',
    icon: Users,
    color: 'text-green-600',
    gradient: 'from-green-100 to-emerald-100'
  },
  {
    id: 'dinner_party',
    name: 'Dinner Party',
    description: 'Host intimate gatherings with menu planning, seating arrangements, and atmosphere',
    icon: Utensils,
    color: 'text-orange-600',
    gradient: 'from-orange-100 to-amber-100'
  },
  {
    id: 'corporate',
    name: 'Corporate Event',
    description: 'Professional event management for conferences, team building, and business gatherings',
    icon: Building,
    color: 'text-slate-600',
    gradient: 'from-slate-100 to-gray-100'
  }
];

interface EventSelectionProps {
  onEventTypeSelected: (eventType: string) => void;
}

export default function EventSelection({ onEventTypeSelected }: EventSelectionProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const { toast } = useToast();

  const selectEventMutation = useMutation({
    mutationFn: async (eventType: string) => {
      const response = await fetch('/api/auth/select-event-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
        },
        body: JSON.stringify({ eventType })
      });
      
      if (!response.ok) {
        throw new Error('Failed to select event type');
      }
      
      return response.json();
    },
    onSuccess: (data, eventType) => {
      toast({
        title: "Event Type Selected",
        description: `Ready to start planning your ${eventTypes.find(e => e.id === eventType)?.name.toLowerCase()}!`,
      });
      onEventTypeSelected(eventType);
    },
    onError: () => {
      toast({
        title: "Selection Failed",
        description: "Unable to save your event type. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEventSelect = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const handleContinue = () => {
    if (selectedEvent) {
      selectEventMutation.mutate(selectedEvent);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4">
            What are you planning?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your event type to get started with personalized planning tools and AI-powered recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {eventTypes.map((event) => {
            const Icon = event.icon;
            const isSelected = selectedEvent === event.id;
            
            return (
              <Card 
                key={event.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  isSelected 
                    ? 'ring-2 ring-rose-500 shadow-lg scale-105' 
                    : 'hover:ring-1 hover:ring-gray-200'
                }`}
                onClick={() => handleEventSelect(event.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${event.gradient} flex items-center justify-center`}>
                    <Icon className={`w-8 h-8 ${event.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    {event.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-sm leading-relaxed">
                    {event.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedEvent || selectEventMutation.isPending}
            className="px-8 py-3 text-lg gradient-blush-rose disabled:opacity-50"
          >
            {selectEventMutation.isPending ? (
              "Setting up your planning space..."
            ) : (
              "Continue to Planning"
            )}
          </Button>
          
          {selectedEvent && (
            <p className="mt-4 text-sm text-gray-500">
              You selected: <span className="font-medium">{eventTypes.find(e => e.id === selectedEvent)?.name}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}