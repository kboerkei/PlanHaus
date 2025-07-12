import { Plus, CalendarPlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuickActions() {
  const actions = [
    { icon: Plus, label: "Add Guest", action: () => {} },
    { icon: CalendarPlus, label: "Schedule Appointment", action: () => {} },
    { icon: Upload, label: "Upload Documents", action: () => {} },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h4 className="font-semibold text-gray-800 mb-3">Quick Actions</h4>
        <div className="space-y-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start px-3 py-2 h-auto"
                onClick={action.action}
              >
                <Icon className="text-blush mr-3" size={16} />
                <span className="text-sm">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h4 className="font-semibold text-gray-800 mb-3">Wedding Day</h4>
        <p className="text-2xl font-serif font-semibold text-blush">May 15, 2024</p>
        <p className="text-sm text-gray-600">Garden Springs Venue</p>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>📍</span>
            <span>Ceremony at 4:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
