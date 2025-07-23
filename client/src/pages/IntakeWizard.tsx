import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Save, CheckCircle, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

import Step1EventDetails from "./intake/Step1EventDetails";
import Step2StylePreferences from "./intake/Step2StylePreferences";
import Step3BudgetEstimate from "./intake/Step3BudgetEstimate";
import { 
  intakeWizardSchema, 
  type IntakeWizardData,
  type EventDetailsData,
  type StylePreferencesData,
  type BudgetEstimateData
} from "./intake/types";

interface Step {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Event Details",
    description: "Basic wedding information",
    component: Step1EventDetails
  },
  {
    id: 2,
    title: "Style Preferences", 
    description: "Your dream wedding aesthetic",
    component: Step2StylePreferences
  },
  {
    id: 3,
    title: "Budget Estimate",
    description: "Planning your investment",
    component: Step3BudgetEstimate
  }
];

const STORAGE_KEY = 'planhaus_intake_wizard_data';
const STEP_KEY = 'planhaus_intake_wizard_step';

export default function IntakeWizard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initialize form with default values
  const methods = useForm<IntakeWizardData>({
    resolver: zodResolver(intakeWizardSchema),
    defaultValues: {
      eventDetails: {
        partner1FirstName: "",
        partner1LastName: "",
        partner1Email: "",
        partner2FirstName: "",
        partner2LastName: "",
        partner2Email: "",
        weddingDate: undefined,
        ceremonyLocation: "",
        receptionLocation: "",
        estimatedGuests: 0,
      },
      stylePreferences: {
        overallVibe: "",
        colorPalette: "",
        mustHaveElements: [],
        pinterestBoards: [],
      },
      budgetEstimate: {
        totalBudget: 0,
        topPriorities: [],
        nonNegotiables: "",
      }
    },
    mode: "onChange"
  });

  const { watch, reset, trigger, getValues } = methods;
  const watchedData = watch();

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedStep = localStorage.getItem(STEP_KEY);

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Convert date string back to Date object
        if (parsedData.eventDetails?.weddingDate) {
          parsedData.eventDetails.weddingDate = new Date(parsedData.eventDetails.weddingDate);
        }
        reset(parsedData);
      } catch (error) {
        console.warn('Failed to parse saved data:', error);
      }
    }

    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10));
    }
  }, [reset]);

  // Auto-save to localStorage whenever form data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedData));
      localStorage.setItem(STEP_KEY, currentStep.toString());
      setLastSaved(new Date());
    }, 1000);

    return () => clearTimeout(timer);
  }, [watchedData, currentStep]);

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (data: IntakeWizardData) => {
      // Transform data to match API format
      const apiData = {
        userId: 0, // Will be set by server
        partner1FirstName: data.eventDetails.partner1FirstName,
        partner1LastName: data.eventDetails.partner1LastName,
        partner1Email: data.eventDetails.partner1Email,
        partner1Role: "Partner",
        partner2FirstName: data.eventDetails.partner2FirstName,
        partner2LastName: data.eventDetails.partner2LastName || "",
        partner2Email: data.eventDetails.partner2Email || "",
        partner2Role: "Partner",
        hasWeddingPlanner: false,
        weddingDate: data.eventDetails.weddingDate,
        ceremonyLocation: data.eventDetails.ceremonyLocation,
        receptionLocation: data.eventDetails.receptionLocation || "",
        estimatedGuests: data.eventDetails.estimatedGuests,
        totalBudget: data.budgetEstimate.totalBudget.toString(),
        overallVibe: data.stylePreferences.overallVibe,
        colorPalette: data.stylePreferences.colorPalette || "",
        mustHaveElements: data.stylePreferences.mustHaveElements,
        pinterestBoards: data.stylePreferences.pinterestBoards,
        topPriorities: data.budgetEstimate.topPriorities,
        nonNegotiables: data.budgetEstimate.nonNegotiables || "",
        vips: [],
        weddingParty: [],
        officiantStatus: "unsure"
      };

      return apiRequest("/api/intake", {
        method: "POST",
        body: JSON.stringify(apiData),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      // Clear saved progress
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);
      
      toast({
        title: "Welcome to PlanHaus!",
        description: "Your wedding planning journey has begun.",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      // Navigate to dashboard
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error saving information",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  // Navigation functions
  const nextStep = async () => {
    const currentStepKey = getCurrentStepKey();
    const isValid = await trigger(currentStepKey);
    
    if (isValid) {
      setDirection(1);
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setDirection(stepIndex > currentStep ? 1 : -1);
      setCurrentStep(stepIndex);
    }
  };

  const getCurrentStepKey = () => {
    switch (currentStep) {
      case 0: return "eventDetails" as const;
      case 1: return "stylePreferences" as const;
      case 2: return "budgetEstimate" as const;
      default: return "eventDetails" as const;
    }
  };

  const handleSubmit = async () => {
    const isValid = await trigger();
    if (isValid) {
      submitMutation.mutate(getValues());
    }
  };

  const saveAndContinueLater = () => {
    toast({
      title: "Progress saved",
      description: "You can continue later from where you left off.",
    });
    navigate("/");
  };

  // Animation variants
  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="h-10 w-10 text-white" fill="currentColor" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Wedding Planning Setup
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Let's create your perfect wedding plan together
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">
                Step {currentStep + 1} of {steps.length}
              </div>
              <div className="text-sm text-gray-500">
                {Math.round(progressPercentage)}% Complete
              </div>
            </div>
            
            <Progress value={progressPercentage} className="h-3 mb-6" />
            
            {/* Step indicators */}
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center cursor-pointer group",
                    index <= currentStep ? "cursor-pointer" : "cursor-not-allowed"
                  )}
                  onClick={() => goToStep(index)}
                  whileHover={{ scale: index <= currentStep ? 1.05 : 1 }}
                  whileTap={{ scale: index <= currentStep ? 0.95 : 1 }}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      currentStep === index
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 border-rose-500 text-white shadow-lg"
                        : index < currentStep
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    )}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-xs font-medium text-gray-700">
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 hidden md:block">
                      {step.description}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Form Content */}
        <FormProvider {...methods}>
          <Card className="shadow-xl mb-8">
            <CardHeader className="pb-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 mt-2">
                  {steps[currentStep].description}
                </p>
              </div>
            </CardHeader>
            <CardContent className="relative overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                >
                  <CurrentStepComponent
                    onNext={nextStep}
                    onBack={prevStep}
                    isFirstStep={currentStep === 0}
                    isLastStep={currentStep === steps.length - 1}
                  />
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </FormProvider>

        {/* Navigation */}
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              variant="ghost"
              onClick={saveAndContinueLater}
              className="flex items-center gap-2 text-gray-600"
            >
              <Save className="w-4 h-4" />
              Save & Continue Later
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {lastSaved && (
              <Badge variant="secondary" className="text-xs">
                <Save className="w-3 h-3 mr-1" />
                Auto-saved
              </Badge>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={nextStep}
                className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {submitMutation.isPending ? (
                  "Completing..."
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Complete Setup
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}