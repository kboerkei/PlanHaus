import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Users, 
  Calendar, 
  DollarSign, 
  Palette, 
  Building, 
  Camera,
  Music,
  Utensils,
  Flower,
  Car,
  Gift
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: string;
  urgent?: boolean;
  onClick: () => void;
}

interface QuickActionPanelProps {
  actions: QuickAction[];
  title?: string;
  showCategories?: boolean;
}

export default function QuickActionPanel({ 
  actions, 
  title = "Quick Actions",
  showCategories = true 
}: QuickActionPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...new Set(actions.map(action => action.category))];
  const filteredActions = selectedCategory === "all" 
    ? actions 
    : actions.filter(action => action.category === selectedCategory);

  const getActionIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      users: <Users size={20} />,
      calendar: <Calendar size={20} />,
      dollar: <DollarSign size={20} />,
      palette: <Palette size={20} />,
      building: <Building size={20} />,
      camera: <Camera size={20} />,
      music: <Music size={20} />,
      utensils: <Utensils size={20} />,
      flower: <Flower size={20} />,
      car: <Car size={20} />,
      gift: <Gift size={20} />
    };
    return iconMap[iconName] || <Plus size={20} />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="secondary">{filteredActions.length}</Badge>
        </CardTitle>
        
        {showCategories && categories.length > 2 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className={`h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-all ${
                action.urgent ? 'border-red-200 bg-red-50' : ''
              }`}
              onClick={action.onClick}
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                {action.icon}
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                {action.urgent && (
                  <Badge variant="destructive" className="mt-2 text-xs">
                    Urgent
                  </Badge>
                )}
              </div>
            </Button>
          ))}
        </div>
        
        {filteredActions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="mx-auto mb-2" size={48} />
            <p>No actions available in this category</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}