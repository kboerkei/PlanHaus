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
      className={`text-center transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg rounded-lg p-4 hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="relative w-20 h-20 mx-auto mb-4">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="6"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-800">{percentage}%</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <p className="text-xs text-gray-500 break-words">{sublabel}</p>
      </div>
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

  // Use dashboard stats for consistent global data
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!localStorage.getItem('sessionId')
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

  // Use dashboard stats for consistent calculations
  const project = currentProject;
  const confirmedGuests = guests?.filter(g => g.rsvpStatus === 'confirmed') || [];
  const bookedVendors = vendors?.filter(v => v.status === 'booked') || [];
  const paidBudgetItems = budgetItems?.filter(b => b.isPaid) || [];
  
  // Calculate budget progress based on estimated vs actual (not total budget)
  const totalEstimated = budgetItems?.reduce((sum, item) => sum + (parseFloat(item.estimatedCost || '0')), 0) || 0;
  const totalSpent = budgetItems?.reduce((sum, item) => sum + (parseFloat(item.actualCost || '0')), 0) || 0;
  
  // Progress calculations using dashboard stats
  const totalTasks = dashboardStats?.tasks?.total || 0;
  const completedTasks = dashboardStats?.tasks?.completed || 0;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // RSVP progress: count guests who have responded (confirmed + declined) vs total
  const confirmedCount = dashboardStats?.guests?.confirmed || 0;
  const declinedCount = dashboardStats?.guests?.declined || 0;
  const totalGuests = dashboardStats?.guests?.total || 0;
  const respondedGuests = confirmedCount + declinedCount;
  const guestProgress = totalGuests > 0 ? Math.round((respondedGuests / totalGuests) * 100) : 0;
  
  const vendorProgress = vendors?.length ? Math.round((bookedVendors.length / vendors.length) * 100) : 0;
  const budgetProgress = totalEstimated > 0 ? Math.round((totalSpent / totalEstimated) * 100) : 0;
  
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <ProgressRing
            percentage={budgetProgress}
            color="#F43F5E"
            label="Budget"
            sublabel={`$${Math.round(totalSpent).toLocaleString()} of $${Math.round(totalEstimated).toLocaleString()}`}
            onClick={() => setLocation('/budget')}
          />
          <ProgressRing
            percentage={taskProgress}
            color="#EC4899"
            label="Tasks"
            sublabel={`${completedTasks} of ${totalTasks} done`}
            onClick={() => setLocation('/timeline')}
          />
          <ProgressRing
            percentage={guestProgress}
            color="#F59E0B"
            label="RSVPs"
            sublabel={`${respondedGuests} of ${totalGuests} responded`}
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
