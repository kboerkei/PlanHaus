import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle, 
  Trash2, 
  Edit3, 
  Mail, 
  FileDown, 
  Copy, 
  Archive,
  MoreHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BulkActionsProps {
  selectedItems: any[];
  onAction: (action: string, items: any[]) => void;
  availableActions: {
    key: string;
    label: string;
    icon: React.ComponentType<any>;
    color?: string;
    requiresConfirmation?: boolean;
  }[];
  className?: string;
}

export default function BulkActions({
  selectedItems,
  onAction,
  availableActions,
  className
}: BulkActionsProps) {
  const [selectedAction, setSelectedAction] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAction = (actionKey: string) => {
    const action = availableActions.find(a => a.key === actionKey);
    
    if (!action) return;

    if (action.requiresConfirmation) {
      setPendingAction(actionKey);
      setShowConfirmation(true);
    } else {
      executeAction(actionKey);
    }
  };

  const executeAction = (actionKey: string) => {
    onAction(actionKey, selectedItems);
    setSelectedAction("");
    setShowConfirmation(false);
    setPendingAction(null);
    
    toast({
      title: "Action completed",
      description: `${actionKey} applied to ${selectedItems.length} items`,
    });
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-lg">Bulk Actions</span>
            <Badge variant="secondary">
              {selectedItems.length} selected
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showConfirmation ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {availableActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.key}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(action.key)}
                    className={`flex items-center space-x-2 ${action.color || ''}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{action.label}</span>
                  </Button>
                );
              })}
            </div>
            
            <div className="text-xs text-gray-500">
              Selected items: {selectedItems.map(item => item.name || item.title).join(', ')}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="font-medium text-yellow-800">Confirm Action</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Are you sure you want to {pendingAction} {selectedItems.length} items? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowConfirmation(false);
                  setPendingAction(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => executeAction(pendingAction!)}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}