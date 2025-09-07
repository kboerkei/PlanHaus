import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = "md", 
  text = "Loading...", 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <div className={cn(
        "gradient-blush-rose rounded-2xl flex items-center justify-center animate-pulse",
        sizeClasses[size]
      )}>
        <Heart className="text-white animate-bounce" size={size === "sm" ? 12 : size === "md" ? 16 : 20} />
      </div>
      {text && (
        <p className={cn("text-gray-600 animate-pulse", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
}

export function PageLoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}