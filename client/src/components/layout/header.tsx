import { Heart } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  return (
    <header className="nav-elegant sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Heart 
                className="h-8 w-8 text-rose-400 group-hover:text-rose-500 transition-colors" 
                fill="currentColor"
              />
              <div className="absolute inset-0 bg-rose-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="logo">Gatherly</span>
          </Link>

          {/* Right side - could add user menu or notifications here */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 font-medium hidden sm:block">
              Your Wedding Planning Journey
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}