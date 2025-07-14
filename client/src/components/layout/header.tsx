import { Heart } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Simple Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Heart 
              className="h-6 w-6 text-rose-500" 
              fill="currentColor"
            />
            <span className="text-xl font-semibold text-gray-900 font-heading">Gatherly</span>
          </Link>

          {/* Clean right side */}
          <div className="text-sm text-gray-500 hidden sm:block">
            Wedding Planning
          </div>
        </div>
      </div>
    </header>
  );
}