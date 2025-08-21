import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Circle, 
  HelpCircle, 
  Lightbulb,
  ArrowRight,
  Sparkles,
  Heart,
  Users,
  Calendar,
  DollarSign,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced multi-step form with progress tracking
interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  isCompleted: boolean;
  isActive: boolean;
  validation?: () => boolean;
}

interface EnhancedMultiStepFormProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  children: React.ReactNode;
  showProgress?: boolean;
  allowBackNavigation?: boolean;
}

export const EnhancedMultiStepForm = ({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  children,
  showProgress = true,
  allowBackNavigation = true
}: EnhancedMultiStepFormProps) => {
  const [direction, setDirection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setIsTransitioning(true);
      setTimeout(() => {
        onStepChange(currentStep + 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      onComplete();
    }
  }, [currentStep, steps.length, onStepChange, onComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0 && allowBackNavigation) {
      setDirection(-1);
      setIsTransitioning(true);
      setTimeout(() => {
        onStepChange(currentStep - 1);
        setIsTransitioning(false);
      }, 300);
    }
  }, [currentStep, allowBackNavigation, onStepChange]);

  const canProceed = steps[currentStep]?.validation ? steps[currentStep].validation!() : true;
  const canGoBack = currentStep > 0 && allowBackNavigation;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Indicator */}
      {showProgress && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      step.isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : step.isActive
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-500"
                    )}
                  >
                    {step.isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{step.title}</h3>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-16 h-0.5 mx-4 transition-colors duration-300",
                      step.isCompleted ? "bg-green-500" : "bg-gray-300"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ 
              opacity: 0, 
              x: direction > 0 ? 100 : -100 
            }}
            animate={{ 
              opacity: 1, 
              x: 0 
            }}
            exit={{ 
              opacity: 0, 
              x: direction > 0 ? -100 : 100 
            }}
            transition={{ 
              duration: 0.3, 
              ease: "easeInOut" 
            }}
            className="min-h-[400px]"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          {canGoBack && (
            <button
              onClick={handlePrevious}
              disabled={isTransitioning}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
          
          <button
            onClick={handleNext}
            disabled={!canProceed || isTransitioning}
            className={cn(
              "flex items-center px-6 py-2 rounded-lg font-medium transition-all duration-200",
              canProceed
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transform hover:-translate-y-0.5"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            {currentStep === steps.length - 1 ? (
              <>
                Complete
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Smart onboarding with contextual hints
interface OnboardingHintProps {
  type: 'tip' | 'suggestion' | 'reminder';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  showIcon?: boolean;
}

export const OnboardingHint = ({
  type,
  message,
  action,
  onDismiss,
  showIcon = true
}: OnboardingHintProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getIcon = () => {
    switch (type) {
      case 'tip': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'suggestion': return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'reminder': return <Heart className="w-5 h-5 text-pink-500" />;
      default: return <HelpCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'tip': return 'bg-yellow-50 border-yellow-200';
      case 'suggestion': return 'bg-purple-50 border-purple-200';
      case 'reminder': return 'bg-pink-50 border-pink-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "p-4 rounded-lg border-l-4 shadow-sm",
        getBackgroundColor()
      )}
    >
      <div className="flex items-start space-x-3">
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
        )}
        
        <div className="flex-1">
          <p className="text-sm text-gray-700">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {action.label} →
            </button>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="sr-only">Dismiss</span>
            ×
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Contextual help system
interface ContextualHelpProps {
  title: string;
  content: string;
  examples?: string[];
  relatedTopics?: Array<{
    title: string;
    href: string;
  }>;
  onClose: () => void;
}

export const ContextualHelp = ({
  title,
  content,
  examples,
  relatedTopics,
  onClose
}: ContextualHelpProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">{content}</p>
            
            {examples && examples.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Examples:</h4>
                <ul className="space-y-1">
                  {examples.map((example, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      • {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {relatedTopics && relatedTopics.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Related Topics:</h4>
                <ul className="space-y-1">
                  {relatedTopics.map((topic, index) => (
                    <li key={index}>
                      <a
                        href={topic.href}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {topic.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Smart form validation with real-time feedback
interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
  type: 'error' | 'warning' | 'info';
}

interface SmartFormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  validationRules?: ValidationRule[];
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  helpText?: string;
}

export const SmartFormField = ({
  label,
  value,
  onChange,
  validationRules = [],
  placeholder,
  type = 'text',
  required = false,
  helpText
}: SmartFormFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);

  const validationResults = validationRules.map(rule => ({
    ...rule,
    isValid: rule.test(value)
  }));

  const errors = validationResults.filter(result => !result.isValid && result.type === 'error');
  const warnings = validationResults.filter(result => !result.isValid && result.type === 'warning');
  const shouldShowValidation = hasBlurred || (isFocused && value.length > 0);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setHasBlurred(true);
          }}
          placeholder={placeholder}
          className={cn(
            "w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            errors.length > 0
              ? "border-red-300 focus:ring-red-500"
              : warnings.length > 0
              ? "border-yellow-300 focus:ring-yellow-500"
              : "border-gray-300 focus:ring-blue-500"
          )}
        />
        
        {shouldShowValidation && (
          <div className="mt-2 space-y-1">
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600 flex items-center">
                <span className="w-1 h-1 bg-red-600 rounded-full mr-2" />
                {error.message}
              </p>
            ))}
            {warnings.map((warning, index) => (
              <p key={index} className="text-sm text-yellow-600 flex items-center">
                <span className="w-1 h-1 bg-yellow-600 rounded-full mr-2" />
                {warning.message}
              </p>
            ))}
          </div>
        )}
      </div>
      
      {helpText && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

// Usage example for wedding planning steps
export const WeddingPlanningSteps: Step[] = [
  {
    id: 'couple-info',
    title: 'Couple Information',
    description: 'Tell us about yourselves',
    icon: Users,
    isCompleted: false,
    isActive: true,
    validation: () => true
  },
  {
    id: 'wedding-details',
    title: 'Wedding Details',
    description: 'Date, venue, and guest count',
    icon: Calendar,
    isCompleted: false,
    isActive: false,
    validation: () => true
  },
  {
    id: 'budget-planning',
    title: 'Budget Planning',
    description: 'Set your budget and priorities',
    icon: DollarSign,
    isCompleted: false,
    isActive: false,
    validation: () => true
  },
  {
    id: 'venue-selection',
    title: 'Venue Selection',
    description: 'Choose your perfect venue',
    icon: MapPin,
    isCompleted: false,
    isActive: false,
    validation: () => true
  }
]; 