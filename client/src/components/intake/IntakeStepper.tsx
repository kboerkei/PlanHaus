import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  status: 'upcoming' | 'current' | 'completed';
}

interface IntakeStepperProps {
  currentStep: number;
  steps: Step[];
  onStepClick: (stepIndex: number) => void;
  className?: string;
}

export const IntakeStepper: React.FC<IntakeStepperProps> = ({
  currentStep,
  steps,
  onStepClick,
  className,
}) => {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className="md:flex-1">
            <button
              onClick={() => onStepClick(stepIdx)}
              className={cn(
                "group flex w-full flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                step.status === 'completed'
                  ? "border-emerald-600 hover:border-emerald-800"
                  : step.status === 'current'
                  ? "border-blue-600"
                  : "border-gray-200 hover:border-gray-300"
              )}
              disabled={step.status === 'upcoming'}
            >
              <span className="text-sm font-medium text-blue-600">
                Step {stepIdx + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  step.status === 'completed'
                    ? "text-emerald-600"
                    : step.status === 'current'
                    ? "text-blue-600"
                    : "text-gray-500"
                )}
              >
                {step.title}
              </span>
              <span className="text-sm text-gray-500">{step.description}</span>
              {step.status === 'completed' && (
                <span className="absolute right-0 top-0">
                  <Check className="h-5 w-5 text-emerald-600" />
                </span>
              )}
              {step.status === 'current' && (
                <span className="absolute right-0 top-0">
                  <ChevronRight className="h-5 w-5 text-blue-600" />
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Progress bar component
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  className,
}) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Progress
        </span>
        <span className="text-sm text-gray-500">
          {currentStep + 1} of {totalSteps}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}; 