import { useQuery } from "@tanstack/react-query";
import { differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";
import { Calendar, MapPin, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CountdownTileProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

function CountdownTile({ icon, value, label }: CountdownTileProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center shadow-sm border border-white/40 hover:bg-white/80 transition-all duration-300">
      <div className="flex justify-center mb-2 text-rose-400">
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </div>
  );
}

export default function ElegantCountdown() {
  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!localStorage.getItem('sessionId')
  });

  // Get the current project (prioritizing Austin farmhouse wedding demo)
  const currentProject = projects?.find(p => p.name === "Emma & Jake's Wedding") || projects?.[0];
  
  if (!currentProject?.date) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-8 text-center">
        <div className="relative z-10">
          <Heart className="h-12 w-12 text-rose-300 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-gray-700 mb-2">Your Wedding</h2>
          <p className="text-gray-500">Set your wedding date to see the countdown</p>
        </div>
      </div>
    );
  }

  // Calculate countdown values
  const weddingDate = new Date(currentProject.date);
  const today = new Date();
  
  const daysUntil = differenceInDays(weddingDate, today);
  const weeksUntil = differenceInWeeks(weddingDate, today);
  const monthsUntil = differenceInMonths(weddingDate, today);

  const handleLocationClick = () => {
    if (currentProject.venue) {
      const query = encodeURIComponent(`${currentProject.venue}, Austin, Texas`);
      window.open(`https://www.google.com/maps/search/${query}`, '_blank');
    }
  };

  const handleShareCountdown = () => {
    // Placeholder for share functionality
    navigator.clipboard?.writeText(`Join us for ${currentProject.name} on ${weddingDate.toLocaleDateString()}! Only ${daysUntil} days to go! 💕`);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 shadow-lg">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-gradient-to-br from-rose-300 to-pink-300"></div>
        <div className="absolute top-12 right-8 w-8 h-8 rounded-full bg-gradient-to-br from-purple-300 to-pink-300"></div>
        <div className="absolute bottom-8 left-12 w-12 h-12 rounded-full bg-gradient-to-br from-rose-300 to-purple-300"></div>
        <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full bg-gradient-to-br from-pink-300 to-purple-300"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header with couple names */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <Heart className="h-6 w-6 text-rose-400" fill="currentColor" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-800 tracking-wide" 
                style={{ fontFamily: "'Playfair Display', serif" }}>
              {currentProject.name}
            </h1>
            <Heart className="h-6 w-6 text-rose-400" fill="currentColor" />
          </div>
          
          {/* Wedding date */}
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
            <Calendar className="h-4 w-4" />
            <span className="text-lg font-medium">
              {weddingDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>

          {/* Location */}
          {currentProject.venue && (
            <button
              onClick={handleLocationClick}
              className="flex items-center justify-center space-x-2 text-gray-600 hover:text-rose-600 transition-colors mx-auto group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 rounded-md p-2"
              aria-label={`View ${currentProject.venue} on map`}
            >
              <MapPin className="h-4 w-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <span className="text-base underline decoration-dotted underline-offset-4">
                {currentProject.venue}
              </span>
            </button>
          )}

          {/* Custom quote */}
          <p className="text-gray-500 italic text-lg mt-4 font-light" 
             style={{ fontFamily: "'Playfair Display', serif" }}>
            "The adventure begins..."
          </p>
        </div>

        {/* Main countdown number with gradient background */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-200/50 to-purple-200/50 rounded-3xl blur-xl scale-110"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/60">
              <div className="text-7xl md:text-8xl lg:text-9xl font-bold text-transparent bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 bg-clip-text leading-none">
                {daysUntil > 0 ? daysUntil : '🎉'}
              </div>
              <div className="text-xl md:text-2xl text-gray-600 font-light mt-2" 
                   style={{ fontFamily: "'Playfair Display', serif" }}>
                {daysUntil > 0 ? 'Days Until Forever' : 'Today is the Day!'}
              </div>
            </div>
          </div>
        </div>

        {/* Countdown tiles */}
        {daysUntil > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <CountdownTile
              icon={<Calendar className="h-5 w-5" />}
              value={monthsUntil}
              label={monthsUntil === 1 ? "Month" : "Months"}
            />
            <CountdownTile
              icon={<Calendar className="h-5 w-5" />}
              value={weeksUntil}
              label={weeksUntil === 1 ? "Week" : "Weeks"}
            />
            <CountdownTile
              icon={<Heart className="h-5 w-5" />}
              value={daysUntil}
              label={daysUntil === 1 ? "Day" : "Days"}
            />
          </div>
        )}

        {/* Share button */}
        <div className="text-center">
          <Button
            onClick={handleShareCountdown}
            variant="outline"
            className="bg-white/70 backdrop-blur-sm border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 transition-all duration-300 shadow-sm"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Countdown
          </Button>
        </div>
      </div>
    </div>
  );
}