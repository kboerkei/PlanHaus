import { memo } from "react";
import { motion } from "framer-motion";
import { Loader2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "wedding" | "minimal";
  className?: string;
  text?: string;
}

export const LoadingSpinner = memo(({ 
  size = "md", 
  variant = "default", 
  className,
  text 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const variants = {
    default: "text-muted-foreground",
    wedding: "text-blush",
    minimal: "text-gray-400"
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={cn(sizeClasses[size], variants[variant])}
      >
        {variant === "wedding" ? <Heart className="fill-current" /> : <Loader2 />}
      </motion.div>
      {text && (
        <span className={cn("text-sm", variants[variant])}>
          {text}
        </span>
      )}
    </div>
  );
});

LoadingSpinner.displayName = "LoadingSpinner";

// Skeleton components for better loading UX
export const SkeletonCard = memo(() => (
  <div className="animate-pulse">
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 w-full mb-4" />
    <div className="space-y-2">
      <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-3/4" />
      <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-1/2" />
    </div>
  </div>
));

SkeletonCard.displayName = "SkeletonCard";

export const SkeletonTable = memo(() => (
  <div className="animate-pulse space-y-4">
    <div className="bg-gray-200 dark:bg-gray-700 rounded h-8 w-full" />
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-6 flex-1" />
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-6 w-20" />
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-6 w-16" />
      </div>
    ))}
  </div>
));

SkeletonTable.displayName = "SkeletonTable";

export const SkeletonStats = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6">
          <div className="bg-gray-300 dark:bg-gray-600 rounded h-4 w-1/2 mb-2" />
          <div className="bg-gray-300 dark:bg-gray-600 rounded h-8 w-3/4" />
        </div>
      </div>
    ))}
  </div>
));

SkeletonStats.displayName = "SkeletonStats";

// Enhanced loading states with context
interface PageLoadingProps {
  message?: string;
  variant?: "default" | "wedding";
}

export const PageLoading = memo(({ 
  message = "Loading your wedding plans...", 
  variant = "wedding" 
}: PageLoadingProps) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
    <LoadingSpinner size="lg" variant={variant} />
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-muted-foreground text-center"
    >
      {message}
    </motion.p>
  </div>
));

PageLoading.displayName = "PageLoading";

// Progressive loading with stages
interface ProgressiveLoadingProps {
  stages: string[];
  currentStage: number;
}

export const ProgressiveLoading = memo(({ stages, currentStage }: ProgressiveLoadingProps) => (
  <div className="flex flex-col items-center space-y-6 p-8">
    <LoadingSpinner size="lg" variant="wedding" />
    <div className="w-full max-w-md">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          Step {currentStage + 1} of {stages.length}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round(((currentStage + 1) / stages.length) * 100)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-blush h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-center mt-4 text-sm text-muted-foreground">
        {stages[currentStage]}
      </p>
    </div>
  </div>
));

ProgressiveLoading.displayName = "ProgressiveLoading";