import { Plus, CalendarPlus, Upload, Users, DollarSign, Camera, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { WeddingProject } from "@/types";

export default function QuickActions() {
  const { data: projects } = useQuery<WeddingProject[]>({
    queryKey: ['/api/projects'],
    enabled: !!localStorage.getItem('sessionId')
  });
  
  const project = projects?.[0];
  const weddingDate = project?.weddingDate ? new Date(project.weddingDate) : null;
  const daysUntilWedding = weddingDate ? Math.ceil((weddingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  const actions = [
    { icon: Users, label: "Add Guest", action: "/guests", color: "text-blue-600" },
    { icon: DollarSign, label: "Track Expense", action: "/budget", color: "text-green-600" },
    { icon: Camera, label: "Add Vendor", action: "/vendors", color: "text-purple-600" },
    { icon: Heart, label: "Save Inspiration", action: "/inspiration", color: "text-pink-600" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h4 className="font-semibold text-gray-800 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.action}>
                <Button
                  variant="ghost"
                  className="w-full justify-center px-3 py-3 h-auto flex-col space-y-1"
                >
                  <Icon className={action.color} size={20} />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h4 className="font-semibold text-gray-800 mb-3">Wedding Day</h4>
        {project ? (
          <>
            <p className="text-2xl font-serif font-semibold text-blush">
              {weddingDate ? weddingDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              }) : 'Date TBD'}
            </p>
            <p className="text-sm text-gray-600">{project.venue || 'Venue TBD'}</p>
            {daysUntilWedding !== null && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-sm">
                  <span>⏰</span>
                  <span className={daysUntilWedding > 30 ? "text-gray-600" : "text-blush font-medium"}>
                    {daysUntilWedding > 0 ? `${daysUntilWedding} days to go!` : 
                     daysUntilWedding === 0 ? "Today's the day! 🎉" : 
                     "Congratulations! 🎊"}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">Create your wedding project to get started</p>
            <Link href="/profile">
              <Button size="sm" className="mt-2 bg-blush hover:bg-blush/90 text-white">
                Set Wedding Date
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
