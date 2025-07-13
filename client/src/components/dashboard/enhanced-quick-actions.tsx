import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import QuickActionPanel from "@/components/ui/quick-action-panel";
import { 
  Plus, 
  Users, 
  Calendar, 
  DollarSign, 
  Building, 
  Camera,
  Music,
  Utensils,
  Car,
  AlertTriangle
} from "lucide-react";

export default function EnhancedQuickActions() {
  const [, setLocation] = useLocation();
  
  const { data: quickActionsData = [] } = useQuery({
    queryKey: ['/api/dashboard/quick-actions']
  });

  // Convert backend data to component format
  const quickActions = quickActionsData.map((action: any) => {
    const iconMap: Record<string, React.ReactNode> = {
      users: <Users size={20} />,
      calendar: <Calendar size={20} />,
      dollar: <DollarSign size={20} />,
      building: <Building size={20} />,
      camera: <Camera size={20} />,
      music: <Music size={20} />,
      utensils: <Utensils size={20} />,
      car: <Car size={20} />,
      alert: <AlertTriangle size={20} />
    };

    return {
      id: action.id,
      title: action.title,
      description: action.description,
      icon: iconMap[action.icon] || <Plus size={20} />,
      color: action.color,
      category: action.category,
      urgent: action.urgent || false,
      onClick: () => {
        // Navigate based on action type
        switch (action.id) {
          case 'add-guest':
            setLocation('/guests');
            break;
          case 'add-vendor':
            setLocation('/vendors');
            break;
          case 'add-task':
            setLocation('/timeline');
            break;
          case 'overdue-tasks':
            setLocation('/timeline');
            break;
          case 'budget-warning':
            setLocation('/budget');
            break;
          case 'follow-up-rsvps':
            setLocation('/guests');
            break;
          case 'book-vendors':
            setLocation('/vendors');
            break;
          default:
            setLocation('/dashboard');
        }
      }
    };
  });

  return (
    <QuickActionPanel 
      actions={quickActions}
      title="Smart Actions"
      showCategories={true}
    />
  );
}