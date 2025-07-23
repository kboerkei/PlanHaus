import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Heart, Users, Palette, ListChecks, UserPlus, Plus, Trash2, ArrowLeft, ArrowRight, Sparkles, CheckCircle, AlertCircle, Save, Loader2, Star } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CoupleInfo {
  partner1: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  partner2: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  hasWeddingPlanner: boolean;
}

interface WeddingBasics {
  weddingDate: Date | undefined;
  ceremonyLocation: string;
  receptionLocation: string;
  estimatedGuests: number;
  totalBudget: number;
}

interface StyleVision {
  overallVibe: string;
  colorPalette: string;
  mustHaveElements: string[];
  pinterestBoards: string[];
}

interface Priorities {
  topPriorities: string[];
  nonNegotiables: string;
}

interface KeyPeople {
  vips: Array<{ name: string; role: string }>;
  weddingParty: Array<{ name: string; role: string }>;
  officiantStatus: string;
}

interface IntakeFormData {
  coupleInfo: CoupleInfo;
  weddingBasics: WeddingBasics;
  styleVision: StyleVision;
  priorities: Priorities;
  keyPeople: KeyPeople;
}

const weddingRoles = [
  "Bride", "Groom", "Partner", "Spouse-to-be"
];

const weddingVibes = [
  "Romantic & Classic",
  "Boho & Rustic",
  "Modern & Minimalist",
  "Vintage & Retro",
  "Garden & Natural",
  "Glamorous & Luxury",
  "Beach & Coastal",
  "Industrial & Urban",
  "Whimsical & Fun",
  "Traditional & Formal"
];

const priorityOptions = [
  "Venue", "Photography", "Food & Catering", "Music & Entertainment",
  "Flowers & Decor", "Wedding Dress", "Overall Vibe", "Budget Management",
  "Guest Experience", "Honeymoon"
];

const steps = [
  {
    id: 1,
    title: "Couple Info",
    description: "Tell us about yourselves",
    icon: Heart
  },
  {
    id: 2,
    title: "Wedding Basics",
    description: "Date, venue, and guests",
    icon: CalendarIcon
  },
  {
    id: 3,
    title: "Style & Vision",
    description: "Your dream wedding style",
    icon: Palette
  },
  {
    id: 4,
    title: "Priorities",
    description: "What matters most",
    icon: ListChecks
  },
  {
    id: 5,
    title: "Key People",
    description: "VIPs and wedding party",
    icon: Users
  }
];

interface IntakeProps {
  onComplete?: () => void;
}

export default function Intake({ onComplete }: IntakeProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  const [formData, setFormData] = useState<IntakeFormData>({
    coupleInfo: {
      partner1: { firstName: "", lastName: "", email: "", role: "" },
      partner2: { firstName: "", lastName: "", email: "", role: "" },
      hasWeddingPlanner: false
    },
    weddingBasics: {
      weddingDate: undefined,
      ceremonyLocation: "",
      receptionLocation: "",
      estimatedGuests: 0,
      totalBudget: 0
    },
    styleVision: {
      overallVibe: "",
      colorPalette: "",
      mustHaveElements: [],
      pinterestBoards: []
    },
    priorities: {
      topPriorities: [],
      nonNegotiables: ""
    },
    keyPeople: {
      vips: [{ name: "", role: "" }],
      weddingParty: [{ name: "", role: "" }],
      officiantStatus: ""
    }
  });

  const [newMustHave, setNewMustHave] = useState("");
  const [newPinterestBoard, setNewPinterestBoard] = useState("");
  const [newColorPalette, setNewColorPalette] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Constants for localStorage keys
  const FORM_DATA_KEY = 'planhaus_intake_form_data';
  const CURRENT_STEP_KEY = 'planhaus_intake_current_step';
  const COMPLETED_STEPS_KEY = 'planhaus_intake_completed_steps';

  // Load form data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem(FORM_DATA_KEY);
    const savedCurrentStep = localStorage.getItem(CURRENT_STEP_KEY);
    const savedCompletedSteps = localStorage.getItem(COMPLETED_STEPS_KEY);

    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        // Convert date string back to Date object
        if (parsedData.weddingBasics?.weddingDate) {
          parsedData.weddingBasics.weddingDate = new Date(parsedData.weddingBasics.weddingDate);
        }
        setFormData(parsedData);
      } catch (error) {
        console.warn('Failed to parse saved form data:', error);
      }
    }

    if (savedCurrentStep) {
      setCurrentStep(parseInt(savedCurrentStep, 10));
    }

    if (savedCompletedSteps) {
      try {
        const parsedSteps = JSON.parse(savedCompletedSteps);
        setCompletedSteps(new Set(parsedSteps));
      } catch (error) {
        console.warn('Failed to parse completed steps:', error);
      }
    }
  }, []);

  // Auto-save to localStorage whenever form data changes
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      setIsAutoSaving(true);
      localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
      localStorage.setItem(CURRENT_STEP_KEY, currentStep.toString());
      localStorage.setItem(COMPLETED_STEPS_KEY, JSON.stringify(Array.from(completedSteps)));
      setLastSaved(new Date());
      setIsAutoSaving(false);
    }, 1000);

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [formData, currentStep, completedSteps]);

  // Clear localStorage when form is completed
  const clearSavedProgress = () => {
    localStorage.removeItem(FORM_DATA_KEY);
    localStorage.removeItem(CURRENT_STEP_KEY);
    localStorage.removeItem(COMPLETED_STEPS_KEY);
  };

  // Load existing intake data
  const { data: existingIntake, isLoading: intakeLoading } = useQuery({
    queryKey: ['/api/intake'],
    queryFn: () => apiRequest('/api/intake'),
    retry: false,
  });

  // Enhanced validation with better user feedback
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 1: // Couple Info
        if (!formData.coupleInfo.partner1.firstName.trim()) {
          errors.partner1FirstName = "First name is required";
        }
        if (!formData.coupleInfo.partner2.firstName.trim()) {
          errors.partner2FirstName = "Partner's first name is required";
        }
        break;
      case 2: // Wedding Basics
        if (!formData.weddingBasics.weddingDate) {
          errors.weddingDate = "Wedding date is required";
        }
        if (formData.weddingBasics.estimatedGuests <= 0) {
          errors.estimatedGuests = "Please enter estimated guest count";
        }
        break;
      case 3: // Style & Vision
        if (!formData.styleVision.overallVibe) {
          errors.overallVibe = "Please select your wedding vibe";
        }
        break;
      // Steps 4 and 5 are optional, no strict validation
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      // Mark current step as completed
      setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));
      
      // Generate AI suggestions when moving from certain steps
      if (currentStep === 2 && formData.weddingBasics.totalBudget > 0) {
        generateBudgetSuggestions();
      } else if (currentStep === 3 && formData.styleVision.overallVibe) {
        generateStyleSuggestions();
      }
      
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    // Allow navigation to any completed step or current step
    if (step <= Math.max(currentStep, Math.max(...Array.from(completedSteps), 0))) {
      setCurrentStep(step);
    }
  };

  // AI Enhancement: Generate budget suggestions
  const generateBudgetSuggestions = async () => {
    if (!formData.weddingBasics.totalBudget || formData.weddingBasics.totalBudget <= 0) return;
    
    setIsLoadingAiSuggestions(true);
    try {
      const response = await apiRequest('/api/ai/budget-suggestions', {
        method: 'POST',
        body: JSON.stringify({
          totalBudget: formData.weddingBasics.totalBudget,
          guestCount: formData.weddingBasics.estimatedGuests,
          location: formData.weddingBasics.ceremonyLocation
        })
      });
      setAiSuggestions({ type: 'budget', data: response });
    } catch (error) {
      console.warn('Failed to generate budget suggestions:', error);
    } finally {
      setIsLoadingAiSuggestions(false);
    }
  };

  // AI Enhancement: Generate style suggestions
  const generateStyleSuggestions = async () => {
    if (!formData.styleVision.overallVibe) return;
    
    setIsLoadingAiSuggestions(true);
    try {
      const response = await apiRequest('/api/ai/style-suggestions', {
        method: 'POST',
        body: JSON.stringify({
          vibe: formData.styleVision.overallVibe,
          colorPalette: formData.styleVision.colorPalette,
          mustHaveElements: formData.styleVision.mustHaveElements
        })
      });
      setAiSuggestions({ type: 'style', data: response });
    } catch (error) {
      console.warn('Failed to generate style suggestions:', error);
    } finally {
      setIsLoadingAiSuggestions(false);
    }
  };

  // Load existing intake data if it exists
  useEffect(() => {
    const loadExistingData = async () => {
      setIsLoadingExisting(true);
      try {
        const response = await fetch("/api/intake", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("sessionId")}`
          }
        });
        
        if (response.ok) {
          const existingData = await response.json();
          // Convert the API data back to form structure
          setFormData({
            coupleInfo: {
              partner1: {
                firstName: existingData.partner1FirstName || "",
                lastName: existingData.partner1LastName || "",
                email: existingData.partner1Email || "",
                role: existingData.partner1Role || ""
              },
              partner2: {
                firstName: existingData.partner2FirstName || "",
                lastName: existingData.partner2LastName || "",
                email: existingData.partner2Email || "",
                role: existingData.partner2Role || ""
              },
              hasWeddingPlanner: existingData.hasWeddingPlanner || false
            },
            weddingBasics: {
              weddingDate: existingData.weddingDate ? new Date(existingData.weddingDate) : undefined,
              ceremonyLocation: existingData.ceremonyLocation || "",
              receptionLocation: existingData.receptionLocation || "",
              estimatedGuests: existingData.estimatedGuests || 0,
              totalBudget: existingData.totalBudget ? parseFloat(existingData.totalBudget) : 0
            },
            styleVision: {
              overallVibe: existingData.overallVibe || "",
              colorPalette: existingData.colorPalette || "",
              mustHaveElements: existingData.mustHaveElements || [],
              pinterestBoards: existingData.pinterestBoards || []
            },
            priorities: {
              topPriorities: existingData.topPriorities || [],
              nonNegotiables: existingData.nonNegotiables || ""
            },
            keyPeople: {
              vips: existingData.vips && existingData.vips.length > 0 ? existingData.vips : [{ name: "", role: "" }],
              weddingParty: existingData.weddingParty && existingData.weddingParty.length > 0 ? existingData.weddingParty : [{ name: "", role: "" }],
              officiantStatus: existingData.officiantStatus || ""
            }
          });
          // Data loaded successfully
        }
      } catch (error) {
        // No existing data or error loading - continue with empty form
      } finally {
        setIsLoadingExisting(false);
      }
    };

    loadExistingData();
  }, []);

  const submitIntakeMutation = useMutation({
    mutationFn: (data: IntakeFormData) => {
      // Transform form data to match API structure
      const apiData = {
        userId: 0, // This will be set by the server from the auth token
        partner1FirstName: data.coupleInfo.partner1.firstName,
        partner1LastName: data.coupleInfo.partner1.lastName,
        partner1Email: data.coupleInfo.partner1.email,
        partner1Role: data.coupleInfo.partner1.role,
        partner2FirstName: data.coupleInfo.partner2.firstName,
        partner2LastName: data.coupleInfo.partner2.lastName,
        partner2Email: data.coupleInfo.partner2.email,
        partner2Role: data.coupleInfo.partner2.role,
        hasWeddingPlanner: data.coupleInfo.hasWeddingPlanner,
        weddingDate: data.weddingBasics.weddingDate ? new Date(data.weddingBasics.weddingDate) : null,
        ceremonyLocation: data.weddingBasics.ceremonyLocation,
        receptionLocation: data.weddingBasics.receptionLocation,
        estimatedGuests: data.weddingBasics.estimatedGuests || null,
        totalBudget: data.weddingBasics.totalBudget ? data.weddingBasics.totalBudget.toString() : null,
        overallVibe: data.styleVision.overallVibe,
        colorPalette: data.styleVision.colorPalette,
        mustHaveElements: data.styleVision.mustHaveElements,
        pinterestBoards: data.styleVision.pinterestBoards,
        topPriorities: data.priorities.topPriorities,
        nonNegotiables: data.priorities.nonNegotiables,
        vips: data.keyPeople.vips,
        weddingParty: data.keyPeople.weddingParty,
        officiantStatus: data.keyPeople.officiantStatus,
      };

      return apiRequest("/api/intake", {
        method: "POST",
        body: JSON.stringify(apiData),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Changes saved!",
        description: "Your wedding information has been updated successfully.",
      });
      
      // Comprehensive invalidation to reflect intake changes throughout the app
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/intake'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects/15/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects/1/tasks'] });
      
      // Call the completion callback to update the app state
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error: any) => {

      toast({
        title: "Error saving intake",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  // Auto-save mutation for real-time updates
  const autoSaveMutation = useMutation({
    mutationFn: (data: IntakeFormData) => {
      const apiData = {
        userId: 0,
        partner1FirstName: data.coupleInfo.partner1.firstName,
        partner1LastName: data.coupleInfo.partner1.lastName,
        partner1Email: data.coupleInfo.partner1.email,
        partner1Role: data.coupleInfo.partner1.role,
        partner2FirstName: data.coupleInfo.partner2.firstName,
        partner2LastName: data.coupleInfo.partner2.lastName,
        partner2Email: data.coupleInfo.partner2.email,
        partner2Role: data.coupleInfo.partner2.role,
        hasWeddingPlanner: data.coupleInfo.hasWeddingPlanner,
        weddingDate: data.weddingBasics.weddingDate ? new Date(data.weddingBasics.weddingDate) : null,
        ceremonyLocation: data.weddingBasics.ceremonyLocation,
        receptionLocation: data.weddingBasics.receptionLocation,
        estimatedGuests: data.weddingBasics.estimatedGuests || null,
        totalBudget: data.weddingBasics.totalBudget ? data.weddingBasics.totalBudget.toString() : null,
        overallVibe: data.styleVision.overallVibe,
        colorPalette: data.styleVision.colorPalette,
        mustHaveElements: data.styleVision.mustHaveElements,
        pinterestBoards: data.styleVision.pinterestBoards,
        topPriorities: data.priorities.topPriorities,
        nonNegotiables: data.priorities.nonNegotiables,
        vips: data.keyPeople.vips,
        weddingParty: data.keyPeople.weddingParty,
        officiantStatus: data.keyPeople.officiantStatus
      };
      
      return apiRequest("/api/intake", {
        method: "POST",
        body: JSON.stringify(apiData),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      setLastSaved(new Date());
      // Comprehensive query invalidation for real-time updates throughout the app
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/intake'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects/15/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects/1/tasks'] });
      // Project updates are handled by the intake API endpoint
    },
    onError: (error: any) => {
      // Auto-save error handling - silent for better UX
    },
  });

  // Auto-save function with debouncing
  const scheduleAutoSave = (data: IntakeFormData) => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      autoSaveMutation.mutate(data);
    }, 2000); // Save after 2 seconds of inactivity
    
    setAutoSaveTimer(timer);
  };

  // Update form data and trigger auto-save
  const updateFormData = (updates: Partial<IntakeFormData> | ((prev: IntakeFormData) => IntakeFormData)) => {
    setFormData(prev => {
      const newData = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      scheduleAutoSave(newData);
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Submit form with current data - no strict validation required
    submitIntakeMutation.mutate(formData);
    clearSavedProgress(); // Clear saved progress on successful completion
  };

  // Calculate progress percentage
  const progressPercentage = (currentStep / steps.length) * 100;

  // Animation variants for step transitions
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

  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
  };

  // Enhanced step navigation with animation direction
  const enhancedNextStep = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));
      
      if (currentStep === 2 && formData.weddingBasics.totalBudget > 0) {
        generateBudgetSuggestions();
      } else if (currentStep === 3 && formData.styleVision.overallVibe) {
        generateStyleSuggestions();
      }
      
      paginate(1);
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const enhancedPrevStep = () => {
    paginate(-1);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const addColorPalette = () => {
    if (newColorPalette.trim()) {
      const currentColors = formData.styleVision.colorPalette 
        ? formData.styleVision.colorPalette.split(',').map(c => c.trim())
        : [];
      const updatedColors = [...currentColors, newColorPalette.trim()];
      
      updateFormData(prev => ({
        ...prev,
        styleVision: { ...prev.styleVision, colorPalette: updatedColors.join(', ') }
      }));
      setNewColorPalette("");
    }
  };

  const removeColorFromPalette = (indexToRemove: number) => {
    const currentColors = formData.styleVision.colorPalette 
      ? formData.styleVision.colorPalette.split(',').map(c => c.trim())
      : [];
    const updatedColors = currentColors.filter((_, index) => index !== indexToRemove);
    
    updateFormData(prev => ({
      ...prev,
      styleVision: { ...prev.styleVision, colorPalette: updatedColors.join(', ') }
    }));
  };

  const clearColorPalette = () => {
    updateFormData(prev => ({
      ...prev,
      styleVision: { ...prev.styleVision, colorPalette: "" }
    }));
  };

  const addMustHaveElement = () => {
    if (newMustHave.trim()) {
      updateFormData(prev => ({
        ...prev,
        styleVision: {
          ...prev.styleVision,
          mustHaveElements: [...prev.styleVision.mustHaveElements, newMustHave.trim()]
        }
      }));
      setNewMustHave("");
    }
  };

  const removeMustHaveElement = (index: number) => {
    updateFormData(prev => ({
      ...prev,
      styleVision: {
        ...prev.styleVision,
        mustHaveElements: prev.styleVision.mustHaveElements.filter((_, i) => i !== index)
      }
    }));
  };

  const addPinterestBoard = () => {
    if (newPinterestBoard.trim()) {
      // Validate Pinterest URL - Accept various Pinterest URL formats
      const url = newPinterestBoard.trim();
      const pinterestRegex = /^https?:\/\/(www\.)?pinterest\.[a-z.]+\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/;
      
      // Also accept pin URLs and other Pinterest formats
      const isValidPinterest = pinterestRegex.test(url) || 
                              url.includes('pinterest.') && (url.includes('/pin/') || url.includes('/board/'));
      
      if (!isValidPinterest) {
        toast({
          title: "Invalid Pinterest URL",
          description: "Please enter a valid Pinterest board URL.",
          variant: "destructive",
        });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        styleVision: {
          ...prev.styleVision,
          pinterestBoards: [...prev.styleVision.pinterestBoards, url]
        }
      }));
      setNewPinterestBoard("");
    }
  };

  const removePinterestBoard = (index: number) => {
    setFormData(prev => ({
      ...prev,
      styleVision: {
        ...prev.styleVision,
        pinterestBoards: prev.styleVision.pinterestBoards.filter((_, i) => i !== index)
      }
    }));
  };

  const togglePriority = (priority: string) => {
    setFormData(prev => {
      const currentPriorities = prev.priorities.topPriorities;
      const isSelected = currentPriorities.includes(priority);
      
      if (isSelected) {
        return {
          ...prev,
          priorities: {
            ...prev.priorities,
            topPriorities: currentPriorities.filter(p => p !== priority)
          }
        };
      } else if (currentPriorities.length < 3) {
        return {
          ...prev,
          priorities: {
            ...prev.priorities,
            topPriorities: [...currentPriorities, priority]
          }
        };
      }
      return prev;
    });
  };

  const addVIP = () => {
    setFormData(prev => ({
      ...prev,
      keyPeople: {
        ...prev.keyPeople,
        vips: [...prev.keyPeople.vips, { name: "", role: "" }]
      }
    }));
  };

  const removeVIP = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyPeople: {
        ...prev.keyPeople,
        vips: prev.keyPeople.vips.filter((_, i) => i !== index)
      }
    }));
  };

  const addWeddingPartyMember = () => {
    setFormData(prev => ({
      ...prev,
      keyPeople: {
        ...prev.keyPeople,
        weddingParty: [...prev.keyPeople.weddingParty, { name: "", role: "" }]
      }
    }));
  };

  const removeWeddingPartyMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyPeople: {
        ...prev.keyPeople,
        weddingParty: prev.keyPeople.weddingParty.filter((_, i) => i !== index)
      }
    }));
  };

  const getStepLabel = () => {
    const steps = ["Couple Info", "Wedding Basics", "Style Vision", "Priorities", "Key People"];
    const totalSteps = 5;
    const currentSection = Math.floor((Object.keys(formData).filter(key => {
      const section = formData[key as keyof IntakeFormData];
      return typeof section === 'object' && Object.values(section).some(val => 
        val !== "" && val !== 0 && val !== false && (!Array.isArray(val) || val.length > 0)
      );
    }).length * totalSteps) / Object.keys(formData).length);
    
    return `${steps[Math.min(currentSection, totalSteps - 1)]} (${Math.min(currentSection + 1, totalSteps)} of ${totalSteps})`;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderCoupleInfo();
      case 2:
        return renderWeddingBasics();
      case 3:
        return renderStyleVision();
      case 4:
        return renderPriorities();
      case 5:
        return renderKeyPeople();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Heart className="h-10 w-10 text-white" fill="currentColor" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Wedding Planning Intake
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Let's gather the essential information to create your perfect wedding plan
            </p>
            {/* Auto-save indicator */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              {autoSaveMutation.isPending ? (
                <>
                  <div className="w-3 h-3 border border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                  <span className="text-blue-600">Saving changes...</span>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="text-green-600">
                    Last saved at {format(lastSaved, 'h:mm a')}
                  </span>
                </>
              ) : (
                <span className="text-gray-500">Changes auto-save as you type</span>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="mb-8">
          <div className="max-w-3xl mx-auto">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">
                Step {currentStep} of {steps.length}
              </div>
              <div className="text-sm text-gray-500">
                {Math.round(progressPercentage)}% Complete
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <Progress value={progressPercentage} className="h-3 mb-6" />
              <div className="absolute top-0 left-0 right-0 flex justify-between">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className={cn(
                      "relative flex flex-col items-center cursor-pointer group",
                      index + 1 <= Math.max(currentStep, Math.max(...Array.from(completedSteps), 0)) ? "cursor-pointer" : "cursor-not-allowed"
                    )}
                    onClick={() => goToStep(index + 1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 -mt-2.5",
                        currentStep === index + 1
                          ? "bg-gradient-to-r from-rose-500 to-pink-500 border-rose-500 text-white shadow-lg"
                          : completedSteps.has(index + 1)
                          ? "bg-green-500 border-green-500 text-white"
                          : index + 1 < currentStep
                          ? "bg-green-100 border-green-300 text-green-600"
                          : "bg-gray-100 border-gray-300 text-gray-400"
                      )}
                    >
                      {completedSteps.has(index + 1) ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : currentStep === index + 1 ? (
                        <step.icon className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <div className="mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="text-xs font-medium text-gray-700 whitespace-nowrap">
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {step.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Content with Animation */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
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
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* AI Suggestions Panel */}
          {aiSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">
                  AI-Powered {aiSuggestions.type === 'budget' ? 'Budget' : 'Style'} Suggestions
                </h3>
                {isLoadingAiSuggestions && (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                )}
              </div>
              <div className="space-y-3">
                {aiSuggestions.data?.suggestions?.map((suggestion: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-purple-800">{suggestion}</span>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAiSuggestions(null)}
                className="mt-4 text-purple-600 hover:text-purple-700"
              >
                Dismiss
              </Button>
            </motion.div>
          )}
        </div>

        {/* Enhanced Navigation Buttons */}
        <motion.div 
          className="flex justify-between items-center py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            onClick={enhancedPrevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 border-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            {/* Save Indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isAutoSaving ? (
                <>
                  <Save className="w-4 h-4 animate-pulse" />
                  <span>Auto-saving...</span>
                </>
              ) : (
                <span>Progress saved</span>
              )}
            </div>

            {/* Validation Errors Badge */}
            {Object.keys(validationErrors).length > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {Object.keys(validationErrors).length} error{Object.keys(validationErrors).length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {currentStep < steps.length ? (
            <Button
              onClick={enhancedNextStep}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitIntakeMutation.isPending}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
            >
              {submitIntakeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete Setup
                </>
              )}
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );

  // Step rendering functions

  // Step 1: Couple Information
  function renderCoupleInfo() {
    return (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Couple Information</h2>
              <p className="text-gray-600">Tell us about yourselves and your relationship</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Partner 1 */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Primary Partner</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="p1-firstName">First Name *</Label>
                  <Input
                    id="p1-firstName"
                    value={formData.coupleInfo.partner1.firstName}
                    onChange={(e) => updateFormData(prev => ({
                      ...prev,
                      coupleInfo: {
                        ...prev.coupleInfo,
                        partner1: { ...prev.coupleInfo.partner1, firstName: e.target.value }
                      }
                    }))}
                    className={cn(validationErrors.partner1FirstName && "border-red-500")}
                    required
                  />
                  {validationErrors.partner1FirstName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.partner1FirstName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="p1-lastName">Last Name</Label>
                  <Input
                    id="p1-lastName"
                    value={formData.coupleInfo.partner1.lastName}
                    onChange={(e) => updateFormData(prev => ({
                      ...prev,
                      coupleInfo: {
                        ...prev.coupleInfo,
                        partner1: { ...prev.coupleInfo.partner1, lastName: e.target.value }
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="p1-email">Email Address *</Label>
                  <Input
                    id="p1-email"
                    type="email"
                    value={formData.coupleInfo.partner1.email}
                    onChange={(e) => updateFormData(prev => ({
                      ...prev,
                      coupleInfo: {
                        ...prev.coupleInfo,
                        partner1: { ...prev.coupleInfo.partner1, email: e.target.value }
                      }
                    }))}
                    className={cn(validationErrors.partner1Email && "border-red-500")}
                  />
                  {validationErrors.partner1Email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.partner1Email}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="p1-role">Role</Label>
                  <Select
                    value={formData.coupleInfo.partner1.role}
                    onValueChange={(value) => updateFormData(prev => ({
                      ...prev,
                      coupleInfo: {
                        ...prev.coupleInfo,
                        partner1: { ...prev.coupleInfo.partner1, role: value }
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {weddingRoles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Partner 2 */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Partner</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="p2-firstName">First Name *</Label>
                  <Input
                    id="p2-firstName"
                    value={formData.coupleInfo.partner2.firstName}
                    onChange={(e) => updateFormData(prev => ({
                      ...prev,
                      coupleInfo: {
                        ...prev.coupleInfo,
                        partner2: { ...prev.coupleInfo.partner2, firstName: e.target.value }
                      }
                    }))}
                    className={cn(validationErrors.partner2FirstName && "border-red-500")}
                    required
                  />
                  {validationErrors.partner2FirstName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.partner2FirstName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="p2-lastName">Last Name</Label>
                  <Input
                    id="p2-lastName"
                    value={formData.coupleInfo.partner2.lastName}
                    onChange={(e) => updateFormData(prev => ({
                      ...prev,
                      coupleInfo: {
                        ...prev.coupleInfo,
                        partner2: { ...prev.coupleInfo.partner2, lastName: e.target.value }
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="p2-email">Email Address</Label>
                  <Input
                    id="p2-email"
                    type="email"
                    value={formData.coupleInfo.partner2.email}
                    onChange={(e) => updateFormData(prev => ({
                      ...prev,
                      coupleInfo: {
                        ...prev.coupleInfo,
                        partner2: { ...prev.coupleInfo.partner2, email: e.target.value }
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="p2-role">Role</Label>
                  <Select
                    value={formData.coupleInfo.partner2.role}
                    onValueChange={(value) => updateFormData(prev => ({
                      ...prev,
                      coupleInfo: {
                        ...prev.coupleInfo,
                        partner2: { ...prev.coupleInfo.partner2, role: value }
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {weddingRoles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Wedding Planner */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasWeddingPlanner"
                checked={formData.coupleInfo.hasWeddingPlanner}
                onCheckedChange={(checked) => updateFormData(prev => ({
                  ...prev,
                  coupleInfo: { ...prev.coupleInfo, hasWeddingPlanner: !!checked }
                }))}
              />
              <Label htmlFor="hasWeddingPlanner" className="text-sm font-medium">
                We are working with a wedding planner
              </Label>
            </div>
          </div>
        </div>
    );
  }

  // Step 2: Wedding Basics
  function renderWeddingBasics() {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Wedding Basics</h2>
            <p className="text-gray-600">Essential details about your big day</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Wedding Date */}
          <div>
            <Label>Wedding Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.weddingBasics.weddingDate && "text-muted-foreground",
                    validationErrors.weddingDate && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.weddingBasics.weddingDate ? 
                    format(formData.weddingBasics.weddingDate, "PPP") : 
                    "Pick your wedding date"
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.weddingBasics.weddingDate}
                  onSelect={(date) => updateFormData(prev => ({
                    ...prev,
                    weddingBasics: { ...prev.weddingBasics, weddingDate: date }
                  }))}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {validationErrors.weddingDate && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.weddingDate}
              </p>
            )}
          </div>

          {/* Ceremony Location */}
          <div>
            <Label htmlFor="ceremonyLocation">Ceremony Location</Label>
            <Input
              id="ceremonyLocation"
              value={formData.weddingBasics.ceremonyLocation}
              onChange={(e) => updateFormData(prev => ({
                ...prev,
                weddingBasics: { ...prev.weddingBasics, ceremonyLocation: e.target.value }
              }))}
              placeholder="City, State or venue name"
            />
          </div>

          {/* Reception Location */}
          <div>
            <Label htmlFor="receptionLocation">Reception Location</Label>
            <Input
              id="receptionLocation"
              value={formData.weddingBasics.receptionLocation}
              onChange={(e) => updateFormData(prev => ({
                ...prev,
                weddingBasics: { ...prev.weddingBasics, receptionLocation: e.target.value }
              }))}
              placeholder="Same as ceremony or different venue"
            />
          </div>

          {/* Guest Count */}
          <div>
            <Label htmlFor="estimatedGuests">Estimated Guest Count *</Label>
            <Input
              id="estimatedGuests"
              type="number"
              min="1"
              value={formData.weddingBasics.estimatedGuests || ""}
              onChange={(e) => updateFormData(prev => ({
                ...prev,
                weddingBasics: { ...prev.weddingBasics, estimatedGuests: parseInt(e.target.value) || 0 }
              }))}
              className={cn(validationErrors.estimatedGuests && "border-red-500")}
              placeholder="How many guests will attend?"
            />
            {validationErrors.estimatedGuests && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.estimatedGuests}
              </p>
            )}
          </div>

          {/* Total Budget */}
          <div>
            <Label htmlFor="totalBudget">Total Budget (Optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="totalBudget"
                type="number"
                min="0"
                className="pl-8"
                value={formData.weddingBasics.totalBudget || ""}
                onChange={(e) => updateFormData(prev => ({
                  ...prev,
                  weddingBasics: { ...prev.weddingBasics, totalBudget: parseInt(e.target.value) || 0 }
                }))}
                placeholder="Your total wedding budget"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              This helps us provide better recommendations
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Style & Vision
  function renderStyleVision() {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Style & Vision</h2>
            <p className="text-gray-600">Define your dream wedding aesthetic</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Wedding Vibe */}
          <div>
            <Label>Overall Wedding Vibe *</Label>
            <Select
              value={formData.styleVision.overallVibe}
              onValueChange={(value) => updateFormData(prev => ({
                ...prev,
                styleVision: { ...prev.styleVision, overallVibe: value }
              }))}
            >
              <SelectTrigger className={cn(validationErrors.overallVibe && "border-red-500")}>
                <SelectValue placeholder="Choose your wedding style" />
              </SelectTrigger>
              <SelectContent>
                {weddingVibes.map(vibe => (
                  <SelectItem key={vibe} value={vibe}>{vibe}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.overallVibe && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.overallVibe}
              </p>
            )}
          </div>

          {/* Color Palette */}
          <div>
            <Label htmlFor="colorPalette">Color Palette</Label>
            <Textarea
              id="colorPalette"
              value={formData.styleVision.colorPalette}
              onChange={(e) => updateFormData(prev => ({
                ...prev,
                styleVision: { ...prev.styleVision, colorPalette: e.target.value }
              }))}
              placeholder="Describe your wedding colors (e.g., blush pink, sage green, gold accents)"
              rows={3}
            />
          </div>

          {/* Must-Have Elements */}
          <div>
            <Label>Must-Have Wedding Elements</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newMustHave}
                  onChange={(e) => setNewMustHave(e.target.value)}
                  placeholder="Add a must-have element (e.g., live band, photo booth)"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMustHaveElement())}
                />
                <Button type="button" onClick={addMustHaveElement} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.styleVision.mustHaveElements.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.styleVision.mustHaveElements.map((element, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {element}
                      <button 
                        type="button"
                        onClick={() => removeMustHaveElement(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pinterest Boards */}
          <div>
            <Label>Pinterest Inspiration Boards</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newPinterestBoard}
                  onChange={(e) => setNewPinterestBoard(e.target.value)}
                  placeholder="Add Pinterest board URL"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPinterestBoard())}
                />
                <Button type="button" onClick={addPinterestBoard} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.styleVision.pinterestBoards.length > 0 && (
                <div className="space-y-2">
                  {formData.styleVision.pinterestBoards.map((board, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <a href={board} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate">
                        {board}
                      </a>
                      <button 
                        type="button"
                        onClick={() => removePinterestBoard(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Priorities
  function renderPriorities() {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
            <ListChecks className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Wedding Priorities</h2>
            <p className="text-gray-600">What matters most to you?</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Top Priorities */}
          <div>
            <Label>Top 3 Wedding Priorities</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {priorityOptions.map(priority => (
                <label key={priority} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={formData.priorities.topPriorities.includes(priority)}
                    onCheckedChange={(checked) => {
                      const current = formData.priorities.topPriorities;
                      if (checked) {
                        if (current.length < 3) {
                          updateFormData(prev => ({
                            ...prev,
                            priorities: { 
                              ...prev.priorities, 
                              topPriorities: [...current, priority] 
                            }
                          }));
                        }
                      } else {
                        updateFormData(prev => ({
                          ...prev,
                          priorities: { 
                            ...prev.priorities, 
                            topPriorities: current.filter(p => p !== priority) 
                          }
                        }));
                      }
                    }}
                    disabled={!formData.priorities.topPriorities.includes(priority) && formData.priorities.topPriorities.length >= 3}
                  />
                  <span className="text-sm">{priority}</span>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Selected: {formData.priorities.topPriorities.length}/3
            </p>
          </div>

          {/* Non-Negotiables */}
          <div>
            <Label htmlFor="nonNegotiables">Non-Negotiables</Label>
            <Textarea
              id="nonNegotiables"
              value={formData.priorities.nonNegotiables}
              onChange={(e) => updateFormData(prev => ({
                ...prev,
                priorities: { ...prev.priorities, nonNegotiables: e.target.value }
              }))}
              placeholder="Things that are absolutely essential for your wedding day"
              rows={4}
            />
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Key People
  function renderKeyPeople() {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Key People</h2>
            <p className="text-gray-600">Your VIPs and wedding party</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* VIPs */}
          <div>
            <Label>VIP Guests</Label>
            <p className="text-sm text-gray-500 mb-3">Important people who require special consideration</p>
            <div className="space-y-3">
              {formData.keyPeople.vips.map((vip, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Name"
                      value={vip.name}
                      onChange={(e) => updateFormData(prev => ({
                        ...prev,
                        keyPeople: {
                          ...prev.keyPeople,
                          vips: prev.keyPeople.vips.map((v, i) => 
                            i === index ? { ...v, name: e.target.value } : v
                          )
                        }
                      }))}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Relationship/Role"
                      value={vip.role}
                      onChange={(e) => updateFormData(prev => ({
                        ...prev,
                        keyPeople: {
                          ...prev.keyPeople,
                          vips: prev.keyPeople.vips.map((v, i) => 
                            i === index ? { ...v, role: e.target.value } : v
                          )
                        }
                      }))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeVIP(index)}
                    disabled={formData.keyPeople.vips.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addVIP} size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add VIP
              </Button>
            </div>
          </div>

          {/* Wedding Party */}
          <div>
            <Label>Wedding Party</Label>
            <p className="text-sm text-gray-500 mb-3">Bridesmaids, groomsmen, flower girls, etc.</p>
            <div className="space-y-3">
              {formData.keyPeople.weddingParty.map((member, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => updateFormData(prev => ({
                        ...prev,
                        keyPeople: {
                          ...prev.keyPeople,
                          weddingParty: prev.keyPeople.weddingParty.map((m, i) => 
                            i === index ? { ...m, name: e.target.value } : m
                          )
                        }
                      }))}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Role (e.g., Maid of Honor)"
                      value={member.role}
                      onChange={(e) => updateFormData(prev => ({
                        ...prev,
                        keyPeople: {
                          ...prev.keyPeople,
                          weddingParty: prev.keyPeople.weddingParty.map((m, i) => 
                            i === index ? { ...m, role: e.target.value } : m
                          )
                        }
                      }))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeWeddingPartyMember(index)}
                    disabled={formData.keyPeople.weddingParty.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addWeddingPartyMember} size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Wedding Party Member
              </Button>
            </div>
          </div>

          {/* Officiant Status */}
          <div>
            <Label>Officiant Status</Label>
            <RadioGroup
              value={formData.keyPeople.officiantStatus}
              onValueChange={(value) => updateFormData(prev => ({
                ...prev,
                keyPeople: { ...prev.keyPeople, officiantStatus: value }
              }))}
              className="mt-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="booked" id="booked" />
                <Label htmlFor="booked">We have booked our officiant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="searching" id="searching" />
                <Label htmlFor="searching">We are still searching for an officiant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="friend" id="friend" />
                <Label htmlFor="friend">A friend or family member will officiate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unsure" id="unsure" />
                <Label htmlFor="unsure">We're not sure yet</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    );
  }
}

  // Step 2: Wedding Basics
  function renderWeddingBasics() {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Wedding Basics</h2>
            <p className="text-gray-600">Essential details about your special day</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Wedding Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.weddingBasics.weddingDate && "text-muted-foreground",
                      validationErrors.weddingDate && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.weddingBasics.weddingDate ? (
                      format(formData.weddingBasics.weddingDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.weddingBasics.weddingDate}
                    onSelect={(date) => updateFormData(prev => ({
                      ...prev,
                      weddingBasics: { ...prev.weddingBasics, weddingDate: date }
                    }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {validationErrors.weddingDate && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.weddingDate}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="estimatedGuests">Estimated Guests *</Label>
              <Input
                id="estimatedGuests"
                type="number"
                value={formData.weddingBasics.estimatedGuests || ""}
                onChange={(e) => updateFormData(prev => ({
                  ...prev,
                  weddingBasics: { ...prev.weddingBasics, estimatedGuests: parseInt(e.target.value) || 0 }
                }))}
                className={cn(validationErrors.estimatedGuests && "border-red-500")}
                placeholder="How many guests?"
              />
              {validationErrors.estimatedGuests && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.estimatedGuests}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="ceremonyLocation">Ceremony Location *</Label>
            <Input
              id="ceremonyLocation"
              value={formData.weddingBasics.ceremonyLocation}
              onChange={(e) => updateFormData(prev => ({
                ...prev,
                weddingBasics: { ...prev.weddingBasics, ceremonyLocation: e.target.value }
              }))}
              className={cn(validationErrors.ceremonyLocation && "border-red-500")}
              placeholder="Where will your ceremony take place?"
            />
            {validationErrors.ceremonyLocation && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.ceremonyLocation}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="receptionLocation">Reception Location</Label>
            <Input
              id="receptionLocation"
              value={formData.weddingBasics.receptionLocation}
              onChange={(e) => updateFormData(prev => ({
                ...prev,
                weddingBasics: { ...prev.weddingBasics, receptionLocation: e.target.value }
              }))}
              placeholder="Where will your reception be? (leave blank if same as ceremony)"
            />
          </div>

          <div>
            <Label htmlFor="totalBudget">Total Budget</Label>
            <Input
              id="totalBudget"
              type="number"
              value={formData.weddingBasics.totalBudget || ""}
              onChange={(e) => updateFormData(prev => ({
                ...prev,
                weddingBasics: { ...prev.weddingBasics, totalBudget: parseInt(e.target.value) || 0 }
              }))}
              placeholder="Your total wedding budget (optional)"
            />
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Style & Vision
  function renderStyleVision() {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Style & Vision</h2>
            <p className="text-gray-600">Help us understand your dream wedding aesthetic</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label>Overall Wedding Vibe *</Label>
            <RadioGroup
              value={formData.styleVision.overallVibe}
              onValueChange={(value) => updateFormData(prev => ({
                ...prev,
                styleVision: { ...prev.styleVision, overallVibe: value }
              }))}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3"
            >
              {weddingVibes.map(vibe => (
                <Label
                  key={vibe}
                  className={cn(
                    "flex items-center space-x-2 p-4 rounded-lg border cursor-pointer transition-colors",
                    formData.styleVision.overallVibe === vibe
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <RadioGroupItem value={vibe} />
                  <span className="text-sm font-medium">{vibe}</span>
                </Label>
              ))}
            </RadioGroup>
            {validationErrors.overallVibe && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.overallVibe}
              </p>
            )}
          </div>

          <div>
            <Label>Color Palette</Label>
            <div className="mt-2">
              <div className="flex gap-2 mb-3">
                <Input
                  value={newColorPalette}
                  onChange={(e) => setNewColorPalette(e.target.value)}
                  placeholder="Add a color (e.g., Blush Pink, Navy Blue)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColorPalette())}
                />
                <Button type="button" onClick={addColorPalette} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.styleVision.colorPalette.split(',').filter(c => c.trim()).map((color, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm"
                  >
                    {color.trim()}
                    <button
                      type="button"
                      onClick={() => removeColorFromPalette(index)}
                      className="hover:text-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Must-Have Elements</Label>
            <div className="mt-2">
              <div className="flex gap-2 mb-3">
                <Input
                  value={newMustHave}
                  onChange={(e) => setNewMustHave(e.target.value)}
                  placeholder="Add a must-have element (e.g., Live band, Garden ceremony)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMustHaveElement())}
                />
                <Button type="button" onClick={addMustHaveElement} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.styleVision.mustHaveElements.map((element, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm">{element}</span>
                    <Button
                      type="button"
                      onClick={() => removeMustHaveElement(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Pinterest Inspiration Boards</Label>
            <div className="mt-2">
              <div className="flex gap-2 mb-3">
                <Input
                  value={newPinterestBoard}
                  onChange={(e) => setNewPinterestBoard(e.target.value)}
                  placeholder="Add Pinterest board URL"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPinterestBoard())}
                />
                <Button type="button" onClick={addPinterestBoard} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.styleVision.pinterestBoards.map((board, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <a href={board} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                      {board}
                    </a>
                    <Button
                      type="button"
                      onClick={() => removePinterestBoard(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Priorities
  function renderPriorities() {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
            <ListChecks className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Priorities</h2>
            <p className="text-gray-600">What matters most for your perfect day?</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label>Top 3 Priorities *</Label>
            <p className="text-sm text-gray-600 mb-4">Select up to 3 most important aspects of your wedding</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {priorityOptions.map(priority => (
                <Label
                  key={priority}
                  className={cn(
                    "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors",
                    formData.priorities.topPriorities.includes(priority)
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <Checkbox
                    checked={formData.priorities.topPriorities.includes(priority)}
                    onCheckedChange={() => togglePriority(priority)}
                  />
                  <span className="text-sm font-medium">{priority}</span>
                </Label>
              ))}
            </div>
            {validationErrors.topPriorities && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.topPriorities}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="nonNegotiables">Non-Negotiables</Label>
            <Textarea
              id="nonNegotiables"
              value={formData.priorities.nonNegotiables}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                priorities: { ...prev.priorities, nonNegotiables: e.target.value }
              }))}
              placeholder="Describe anything that's absolutely essential for your wedding day..."
              rows={4}
            />
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Key People
  function renderKeyPeople() {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Key People</h2>
            <p className="text-gray-600">Tell us about your VIPs and wedding party</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>VIP Guests *</Label>
              <Button type="button" onClick={addVIP} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add VIP
              </Button>
            </div>
            <div className="space-y-3">
              {formData.keyPeople.vips.map((vip, index) => (
                <div key={index} className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg">
                  <Input
                    value={vip.name}
                    onChange={(e) => updateFormData(prev => ({
                      ...prev,
                      keyPeople: {
                        ...prev.keyPeople,
                        vips: prev.keyPeople.vips.map((v, i) => 
                          i === index ? { ...v, name: e.target.value } : v
                        )
                      }
                    }))}
                    placeholder="Name"
                  />
                  <Input
                    value={vip.role}
                    onChange={(e) => updateFormData(prev => ({
                      ...prev,
                      keyPeople: {
                        ...prev.keyPeople,
                        vips: prev.keyPeople.vips.map((v, i) => 
                          i === index ? { ...v, role: e.target.value } : v
                        )
                      }
                    }))}
                    placeholder="Relationship (e.g., Mother, Best Friend)"
                  />
                  <Button
                    type="button"
                    onClick={() => removeVIP(index)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            {validationErrors.vips && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.vips}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Wedding Party</Label>
              <Button type="button" onClick={addWeddingPartyMember} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Member
              </Button>
            </div>
            <div className="space-y-3">
              {formData.keyPeople.weddingParty.map((member, index) => (
                <div key={index} className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg">
                  <Input
                    value={member.name}
                    onChange={(e) => updateFormData(prev => ({
                      ...prev,
                      keyPeople: {
                        ...prev.keyPeople,
                        weddingParty: prev.keyPeople.weddingParty.map((m, i) => 
                          i === index ? { ...m, name: e.target.value } : m
                        )
                      }
                    }))}
                    placeholder="Name"
                  />
                  <Input
                    value={member.role}
                    onChange={(e) => updateFormData(prev => ({
                      ...prev,
                      keyPeople: {
                        ...prev.keyPeople,
                        weddingParty: prev.keyPeople.weddingParty.map((m, i) => 
                          i === index ? { ...m, role: e.target.value } : m
                        )
                      }
                    }))}
                    placeholder="Role (e.g., Maid of Honor, Best Man)"
                  />
                  <Button
                    type="button"
                    onClick={() => removeWeddingPartyMember(index)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Officiant Status</Label>
            <RadioGroup
              value={formData.keyPeople.officiantStatus}
              onValueChange={(value) => updateFormData(prev => ({
                ...prev,
                keyPeople: { ...prev.keyPeople, officiantStatus: value }
              }))}
              className="mt-3"
            >
              <Label className="flex items-center space-x-2">
                <RadioGroupItem value="booked" />
                <span>We have already booked our officiant</span>
              </Label>
              <Label className="flex items-center space-x-2">
                <RadioGroupItem value="searching" />
                <span>We are still looking for an officiant</span>
              </Label>
              <Label className="flex items-center space-x-2">
                <RadioGroupItem value="friend-family" />
                <span>A friend or family member will officiate</span>
              </Label>
            </RadioGroup>
          </div>
        </div>
      </div>
    );
  }
