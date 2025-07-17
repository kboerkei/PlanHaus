import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  allowNavigation?: boolean;
}

export function Stepper({ steps, currentStep, onStepClick, allowNavigation = false }: StepperProps) {
  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isClickable = allowNavigation && (isCompleted || isActive);
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center">
                <button
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                    isCompleted 
                      ? "bg-rose-500 border-rose-500 text-white"
                      : isActive
                      ? "border-rose-500 text-rose-500 bg-rose-50"
                      : "border-gray-300 text-gray-400",
                    isClickable && "hover:scale-105 cursor-pointer",
                    !isClickable && "cursor-default"
                  )}
                  disabled={!isClickable}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </button>
                <div className="ml-3 min-w-0">
                  <div className={cn(
                    "text-sm font-medium",
                    isActive || isCompleted ? "text-gray-900" : "text-gray-500"
                  )}>
                    {step.title}
                  </div>
                  <div className={cn(
                    "text-xs",
                    isActive || isCompleted ? "text-gray-600" : "text-gray-400"
                  )}>
                    {step.description}
                  </div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <ChevronRight className={cn(
                  "w-5 h-5 mx-4 flex-shrink-0",
                  currentStep > step.id ? "text-rose-400" : "text-gray-300"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">
            Step {currentStep} of {steps.length}
          </span>
          <div className="flex space-x-1">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "w-2 h-2 rounded-full",
                  currentStep >= step.id ? "bg-rose-500" : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {steps.find(s => s.id === currentStep)?.title}
          </h3>
          <p className="text-sm text-gray-600">
            {steps.find(s => s.id === currentStep)?.description}
          </p>
        </div>
      </div>
    </div>
  );
}