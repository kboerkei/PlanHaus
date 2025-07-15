import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import EnhancedDashboardStats from "@/components/enhanced-dashboard-stats";

interface ProgressRingProps {
  percentage: number;
  color: string;
  label: string;
  sublabel: string;
  onClick?: () => void;
}

function ProgressRing({ percentage, color, label, sublabel, onClick }: ProgressRingProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      className={`text-center transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg rounded-lg p-2 hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="relative w-16 h-16 mx-auto mb-3">
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="8"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-800">{percentage}%</span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-500">{sublabel}</p>
    </div>
  );
}

export default function ProgressOverview() {
  const [, setLocation] = useLocation();
  
  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!localStorage.getItem('sessionId')
  });

  // Prioritize Austin farmhouse wedding demo
  const currentProject = projects?.find(p => p.name === "Emma & Jake's Wedding") || projects?.[0];

  const { data: tasks } = useQuery({
    queryKey: ['/api/projects', currentProject?.id, 'tasks'],
    enabled: !!currentProject?.id
  });

  const { data: guests } = useQuery({
    queryKey: ['/api/projects', currentProject?.id, 'guests'],
    enabled: !!currentProject?.id
  });

  const { data: vendors } = useQuery({
    queryKey: ['/api/projects', currentProject?.id, 'vendors'],
    enabled: !!currentProject?.id
  });

  const { data: budgetItems } = useQuery({
    queryKey: ['/api/projects', currentProject?.id, 'budget'],
    enabled: !!currentProject?.id
  });

  // Calculate real progress
  const project = currentProject;
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];
  const confirmedGuests = guests?.filter(g => g.rsvpStatus === 'confirmed') || [];
  const bookedVendors = vendors?.filter(v => v.status === 'booked') || [];
  const paidBudgetItems = budgetItems?.filter(b => b.isPaid) || [];
  
  // Calculate budget spent vs total budget
  const totalBudget = project?.budget ? parseFloat(project.budget) : 0;
  const totalSpent = budgetItems?.reduce((sum, item) => sum + (parseFloat(item.actualCost || '0')), 0) || 0;
  
  const taskProgress = tasks?.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const guestProgress = guests?.length ? Math.round((confirmedGuests.length / guests.length) * 100) : 0;
  const vendorProgress = vendors?.length ? Math.round((bookedVendors.length / vendors.length) * 100) : 0;
  const budgetProgress = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  
  const overallProgress = Math.round((taskProgress + guestProgress + vendorProgress + budgetProgress) / 4);

  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-semibold text-gray-800">
            Wedding Planning Progress
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            overallProgress >= 75 ? 'bg-green-100 text-green-800' :
            overallProgress >= 50 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {overallProgress}% Complete
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ProgressRing
            percentage={budgetProgress}
            color="var(--blush)"
            label="Budget"
            sublabel={`$${Math.round(totalSpent).toLocaleString()} of $${Math.round(totalBudget).toLocaleString()}`}
            onClick={() => setLocation('/budget')}
          />
          <ProgressRing
            percentage={taskProgress}
            color="var(--rose-gold)"
            label="Tasks"
            sublabel={`${completedTasks.length} of ${tasks?.length || 0} done`}
            onClick={() => setLocation('/timeline')}
          />
          <ProgressRing
            percentage={guestProgress}
            color="var(--champagne)"
            label="RSVPs"
            sublabel={`${confirmedGuests.length} of ${guests?.length || 0} confirmed`}
            onClick={() => setLocation('/guests')}
          />
          <ProgressRing
            percentage={vendorProgress}
            color="#10B981"
            label="Vendors"
            sublabel={`${bookedVendors.length} of ${vendors?.length || 0} booked`}
            onClick={() => setLocation('/vendors')}
          />
        </div>
      </div>
    </div>
  );
}
