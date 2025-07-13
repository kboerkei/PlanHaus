import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

function getCoupleInitials(partner1FirstName?: string, partner2FirstName?: string): string {
  const initial1 = partner1FirstName?.charAt(0)?.toUpperCase() || '';
  const initial2 = partner2FirstName?.charAt(0)?.toUpperCase() || '';
  return initial1 + initial2 || 'G';
}

function getCoupleNames(partner1FirstName?: string, partner2FirstName?: string): string {
  if (partner1FirstName && partner2FirstName) {
    return `${partner1FirstName} & ${partner2FirstName}`;
  }
  if (partner1FirstName) {
    return partner1FirstName;
  }
  if (partner2FirstName) {
    return partner2FirstName;
  }
  return '';
}

function calculateDaysUntilWedding(weddingDate?: string): number | null {
  if (!weddingDate) return null;
  const wedding = new Date(weddingDate);
  const today = new Date();
  const diffTime = wedding.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : null;
}

interface HeaderProps {
  user?: any;
  onLogout?: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const { data: intakeData } = useQuery({
    queryKey: ['/api/intake'],
    enabled: !!user,
  });

  const coupleInitials = getCoupleInitials(intakeData?.partner1FirstName, intakeData?.partner2FirstName);
  const coupleNames = getCoupleNames(intakeData?.partner1FirstName, intakeData?.partner2FirstName);
  const daysUntilWedding = calculateDaysUntilWedding(intakeData?.weddingDate);

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-gray-800">
            {coupleNames ? `Welcome back, ${coupleNames}!` : 'Welcome to Gatherly!'}
          </h1>
          <p className="text-gray-600 mt-1">
            {daysUntilWedding 
              ? `${daysUntilWedding} days until your special day`
              : coupleNames 
                ? 'Let\'s plan your dream wedding!'
                : 'Complete your intake form to get started'
            }
          </p>
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Logout
              </button>
            )}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-blush-rose rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">{coupleInitials}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
