import { Bell } from "lucide-react";

export default function Header() {
  // Mock data - in real app this would come from user context
  const daysUntilWedding = 127;
  const userInitial = "S";

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-gray-800">
            Welcome back, Sarah & Alex!
          </h1>
          <p className="text-gray-600 mt-1">
            {daysUntilWedding} days until your special day
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-blush-rose rounded-full flex items-center justify-center">
              <span className="text-white font-medium">{userInitial}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
