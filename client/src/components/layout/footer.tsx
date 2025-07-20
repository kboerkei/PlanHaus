import { Heart, Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer-elegant mt-auto bg-white/95 backdrop-blur-xl border-t border-gray-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Enhanced Logo and tagline */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-sm">
              <Heart className="h-5 w-5 text-white" fill="currentColor" />
            </div>
            <span className="font-heading text-xl font-bold text-gray-800">PlanHaus</span>
          </div>
          
          <p className="text-center text-gray-600 text-lg">
            Made with <Heart className="h-4 w-4 inline text-rose-500 animate-pulse-slow" fill="currentColor" /> by PlanHaus
          </p>
          
          {/* Enhanced Social links */}
          <div className="flex space-x-8">
            <a href="#" className="p-2 rounded-xl bg-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 hover:scale-110">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="p-2 rounded-xl bg-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 hover:scale-110">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="p-2 rounded-xl bg-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 hover:scale-110">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
          
          <div className="flex items-center space-x-8 text-sm text-gray-500">
            <span className="font-medium">© 2025 PlanHaus</span>
            <a href="#" className="hover:text-rose-500 transition-colors font-medium">Privacy Policy</a>
            <a href="#" className="hover:text-rose-500 transition-colors font-medium">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}