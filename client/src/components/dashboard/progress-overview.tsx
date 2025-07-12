interface ProgressRingProps {
  percentage: number;
  color: string;
  label: string;
  sublabel: string;
}

function ProgressRing({ percentage, color, label, sublabel }: ProgressRingProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="text-center">
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
  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-semibold text-gray-800">
            Wedding Planning Progress
          </h2>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            68% Complete
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ProgressRing
            percentage={80}
            color="var(--blush)"
            label="Budget"
            sublabel="$28K of $35K"
          />
          <ProgressRing
            percentage={60}
            color="var(--rose-gold)"
            label="Tasks"
            sublabel="24 of 40 done"
          />
          <ProgressRing
            percentage={75}
            color="var(--champagne)"
            label="RSVPs"
            sublabel="90 of 120"
          />
          <ProgressRing
            percentage={90}
            color="#10B981"
            label="Vendors"
            sublabel="9 of 10 booked"
          />
        </div>
      </div>
    </div>
  );
}
