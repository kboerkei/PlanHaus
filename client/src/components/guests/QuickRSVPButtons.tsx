import { Button } from "@/components/ui/button";
import { Check, X, HelpCircle, Clock } from "lucide-react";
import { useUpdateGuest } from "@/hooks/useGuests";
import { useToast } from "@/hooks/use-toast";

interface QuickRSVPButtonsProps {
  guest: any;
  projectId: string;
}

export default function QuickRSVPButtons({ guest, projectId }: QuickRSVPButtonsProps) {
  const { toast } = useToast();
  const updateGuest = useUpdateGuest(projectId);

  const handleRSVPUpdate = async (status: 'pending' | 'yes' | 'no' | 'maybe') => {
    try {
      await updateGuest.mutateAsync({ 
        id: guest.id, 
        data: { rsvpStatus: status } 
      });
      
      const statusText = status === 'yes' ? 'Attending' : 
                        status === 'no' ? 'Not Attending' : 
                        status === 'maybe' ? 'Maybe' : 'Pending';
      
      toast({ 
        title: `${guest.name} marked as ${statusText}`,
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update RSVP status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant={guest.rsvpStatus === 'yes' ? 'default' : 'outline'}
        onClick={() => handleRSVPUpdate('yes')}
        className={`p-2 ${guest.rsvpStatus === 'yes' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50'}`}
        disabled={updateGuest.isPending}
      >
        <Check className="w-3 h-3" />
      </Button>
      
      <Button
        size="sm"
        variant={guest.rsvpStatus === 'maybe' ? 'default' : 'outline'}
        onClick={() => handleRSVPUpdate('maybe')}
        className={`p-2 ${guest.rsvpStatus === 'maybe' ? 'bg-yellow-600 hover:bg-yellow-700' : 'hover:bg-yellow-50'}`}
        disabled={updateGuest.isPending}
      >
        <HelpCircle className="w-3 h-3" />
      </Button>
      
      <Button
        size="sm"
        variant={guest.rsvpStatus === 'no' ? 'default' : 'outline'}
        onClick={() => handleRSVPUpdate('no')}
        className={`p-2 ${guest.rsvpStatus === 'no' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50'}`}
        disabled={updateGuest.isPending}
      >
        <X className="w-3 h-3" />
      </Button>
      
      <Button
        size="sm"
        variant={guest.rsvpStatus === 'pending' ? 'default' : 'outline'}
        onClick={() => handleRSVPUpdate('pending')}
        className={`p-2 ${guest.rsvpStatus === 'pending' ? 'bg-gray-600 hover:bg-gray-700' : 'hover:bg-gray-50'}`}
        disabled={updateGuest.isPending}
      >
        <Clock className="w-3 h-3" />
      </Button>
    </div>
  );
}