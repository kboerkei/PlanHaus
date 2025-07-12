import { Bot } from "lucide-react";

interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
  avatar: string;
  color: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    user: 'Alex',
    action: 'updated the guest list',
    time: '2 hours ago',
    avatar: 'A',
    color: 'bg-blush',
  },
  {
    id: '2',
    user: 'AI Assistant',
    action: 'suggested 3 florists in your area',
    time: '4 hours ago',
    avatar: 'AI',
    color: 'bg-green-500',
  },
  {
    id: '3',
    user: 'You',
    action: 'uploaded venue photos to inspiration board',
    time: 'Yesterday',
    avatar: 'S',
    color: 'bg-rose-gold',
  },
  {
    id: '4',
    user: 'Mom',
    action: 'commented on seating arrangements',
    time: 'Yesterday',
    avatar: 'M',
    color: 'bg-champagne',
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-semibold text-gray-800">Recent Activity</h3>
        <span className="text-sm text-gray-500">Today</span>
      </div>
      
      <div className="space-y-4">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}>
              {activity.user === 'AI Assistant' ? (
                <Bot className="text-white" size={12} />
              ) : (
                <span className="text-white text-sm font-medium">{activity.avatar}</span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{activity.user}</span> {activity.action}
              </p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
