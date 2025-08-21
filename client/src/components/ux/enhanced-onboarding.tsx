import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  ArrowRight, 
  X, 
  Calendar, 
  Users, 
  DollarSign, 
  MapPin, 
  Sparkles,
  Heart,
  Clock,
  Target,
  Award,
  BookOpen,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced onboarding flow with progress tracking
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  isCompleted: boolean;
  isActive: boolean;
  estimatedTime?: string;
  tips?: string[];
  action?: {
    label: string;
    href: string;
  };
}

interface EnhancedOnboardingProps {
  steps: OnboardingStep[];
  currentStep: number;
  onStepComplete: (stepId: string) => void;
  onStepClick: (stepId: string) => void;
  onSkip: () => void;
  onComplete: () => void;
  showProgress?: boolean;
  showTips?: boolean;
  className?: string;
}

export const EnhancedOnboarding = ({
  steps,
  currentStep,
  onStepComplete,
  onStepClick,
  onSkip,
  onComplete,
  showProgress = true,
  showTips = true,
  className
}: EnhancedOnboardingProps) => {
  const [showTipsState, setShowTipsState] = useState(showTips);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const handleStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    onStepComplete(stepId);
  };

  const progressPercentage = (completedSteps.length / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const nextStep = steps.find(step => !step.isCompleted && step.id !== currentStepData?.id);

  return (
    <div className={cn("max-w-4xl mx-auto p-6", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to PlanHaus
          </h1>
          <p className="text-lg text-gray-600">
            Let's get your wedding planning journey started
          </p>
        </motion.div>

        {/* Progress Bar */}
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Setup Progress
              </span>
              <span className="text-sm text-gray-500">
                {completedSteps.length} of {steps.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Current Step */}
      {currentStepData && (
        <motion.div
          key={currentStepData.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                currentStepData.isCompleted
                  ? "bg-green-100"
                  : "bg-blue-100"
              )}>
                {currentStepData.isCompleted ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <currentStepData.icon className="w-8 h-8 text-blue-600" />
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {currentStepData.title}
                </h2>
                {currentStepData.estimatedTime && (
                  <span className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {currentStepData.estimatedTime}
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {currentStepData.description}
              </p>

              {currentStepData.tips && showTipsState && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Quick Tips
                  </h4>
                  <ul className="space-y-1">
                    {currentStepData.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-blue-800 flex items-start">
                        <span className="w-1 h-1 bg-blue-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentStepData.action && (
                <button
                  onClick={() => onStepClick(currentStepData.id)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {currentStepData.action.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* All Steps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
              step.isCompleted
                ? "border-green-200 bg-green-50"
                : step.isActive
                ? "border-blue-200 bg-blue-50 shadow-md"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            )}
            onClick={() => onStepClick(step.id)}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                step.isCompleted
                  ? "bg-green-500"
                  : step.isActive
                  ? "bg-blue-500"
                  : "bg-gray-300"
              )}>
                {step.isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <step.icon className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "text-sm font-medium truncate",
                  step.isCompleted
                    ? "text-green-800"
                    : step.isActive
                    ? "text-blue-800"
                    : "text-gray-700"
                )}>
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {step.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onSkip}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          Skip for now
        </button>

        <div className="flex space-x-3">
          {nextStep && (
            <button
              onClick={() => onStepClick(nextStep.id)}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Next: {nextStep.title}
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          )}

          {completedSteps.length === steps.length && (
            <button
              onClick={onComplete}
              className="flex items-center px-6 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
            >
              <Award className="w-4 h-4 mr-2" />
              Complete Setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Feature discovery tour
interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface FeatureTourProps {
  steps: TourStep[];
  isActive: boolean;
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

export const FeatureTour = ({
  steps,
  isActive,
  currentStep,
  onNext,
  onPrevious,
  onComplete,
  onSkip
}: FeatureTourProps) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (isActive && currentStepData) {
      const element = document.querySelector(currentStepData.target) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isActive, currentStep, currentStepData]);

  if (!isActive || !currentStepData) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Highlight */}
      {targetElement && (
        <div
          className="absolute border-2 border-blue-500 rounded-lg shadow-lg bg-blue-500 bg-opacity-10"
          style={{
            top: targetElement.offsetTop - 8,
            left: targetElement.offsetLeft - 8,
            width: targetElement.offsetWidth + 16,
            height: targetElement.offsetHeight + 16,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={cn(
          "absolute bg-white rounded-lg shadow-xl p-4 max-w-sm pointer-events-auto",
          currentStepData.position === 'top' && "bottom-full mb-4",
          currentStepData.position === 'bottom' && "top-full mt-4",
          currentStepData.position === 'left' && "right-full mr-4",
          currentStepData.position === 'right' && "left-full ml-4"
        )}
        style={{
          top: targetElement ? targetElement.offsetTop + targetElement.offsetHeight / 2 : '50%',
          left: targetElement ? targetElement.offsetLeft + targetElement.offsetWidth / 2 : '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900">{currentStepData.title}</h3>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm">
          {currentStepData.description}
        </p>

        {currentStepData.action && (
          <button
            onClick={currentStepData.action.onClick}
            className="w-full mb-4 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors"
          >
            {currentStepData.action.label}
          </button>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {currentStep + 1} of {steps.length}
          </span>
          
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <button
                onClick={onPrevious}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={onNext}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Welcome message with personalized content
interface WelcomeMessageProps {
  userName?: string;
  weddingDate?: string;
  daysUntilWedding?: number;
  onGetStarted: () => void;
  onSkip: () => void;
  className?: string;
}

export const WelcomeMessage = ({
  userName,
  weddingDate,
  daysUntilWedding,
  onGetStarted,
  onSkip,
  className
}: WelcomeMessageProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    if (daysUntilWedding && daysUntilWedding < 30) {
      return "Your special day is almost here! Let's make sure everything is perfect.";
    } else if (daysUntilWedding && daysUntilWedding < 90) {
      return "You're in the final stretch! Let's check off those last few items.";
    } else {
      return "You have plenty of time to plan the wedding of your dreams!";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "text-center py-12 px-6 max-w-2xl mx-auto",
        className
      )}
    >
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Heart className="w-16 h-16 text-pink-500 mx-auto mb-6" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-gray-900 mb-4"
        >
          {getGreeting()}{userName ? `, ${userName}` : ''}! 👋
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600 mb-6"
        >
          {getMotivationalMessage()}
        </motion.p>

        {weddingDate && daysUntilWedding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 mb-8 border border-pink-200"
          >
            <div className="flex items-center justify-center space-x-4">
              <Calendar className="w-8 h-8 text-pink-500" />
              <div>
                <p className="text-sm text-gray-600">Your wedding is on</p>
                <p className="text-lg font-semibold text-gray-900">{weddingDate}</p>
                <p className="text-sm text-pink-600 font-medium">
                  {daysUntilWedding} days to go!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <button
          onClick={onGetStarted}
          className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Get Started
        </button>
        
        <button
          onClick={onSkip}
          className="px-8 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Skip for now
        </button>
      </motion.div>
    </motion.div>
  );
}; 