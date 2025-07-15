import { Heart, Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer-elegant mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Logo and tagline */}
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-rose-400" fill="currentColor" />
            <span className="font-semibold text-gray-700">PlanHaus</span>
          </div>
          
          <p className="text-center text-gray-600">
            Made with <Heart className="h-4 w-4 inline text-rose-400" fill="currentColor" /> by PlanHaus
          </p>
          
          {/* Social links placeholder */}
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-rose-400 transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-rose-400 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-rose-400 transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
          
          <div className="flex items-center space-x-6 text-xs text-gray-500">
            <span>© 2025 PlanHaus</span>
            <a href="#" className="hover:text-rose-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-rose-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}