import { Heart } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Elegant Logo */}
          <Link href="/" className="flex items-center space-x-2 group transition-all hover:scale-105">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 flex items-center justify-center shadow-sm">
              <Heart className="h-4 w-4 text-white" fill="currentColor" />
            </div>
            <span className="text-lg font-bold text-gray-800 tracking-tight">Gatherly</span>
          </Link>

          {/* Minimal tagline */}
          <div className="text-xs text-gray-400 font-medium tracking-wide uppercase hidden sm:block">
            Wedding Planning
          </div>
        </div>
      </div>
    </header>
  );
}