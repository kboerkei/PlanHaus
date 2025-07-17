interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
  className?: string;
}

export default function ProgressBar({ 
  currentStep, 
  totalSteps, 
  stepLabel, 
  className = "" 
}: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Step indicator */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600 font-medium">
          {stepLabel ? `${stepLabel}` : `Step ${currentStep} of ${totalSteps}`}
        </span>
        <span className="text-rose-400 font-semibold">
          {Math.round(progress)}%
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill animate-fade-in-up"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}