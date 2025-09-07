import React, { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, Check } from 'lucide-react';
import { IntakeStepper, ProgressBar } from '../components/intake/IntakeStepper';
import { SectionCard } from '../components/intake/SectionCard';
import { 
  TextField, NumberField, MoneyField, SelectField, MultiSelectField,
  DateField, DateRangeField, PhoneField, EmailField, ToggleField,
  ChipsField, TextareaField 
} from '../components/intake/FieldComponents';
import { 
  intakeSchema, intakeDraftSchema, IntakeData, IntakeDraftData,
  validateStep, getPresetBudgetSplits 
} from '../schemas/intake';

// Step configurations
const STEPS = [
  {
    id: 'couple',
    title: 'Couple & Contacts',
    description: 'Basic information about you and your partner',
  },
  {
    id: 'basics',
    title: 'Wedding Basics',
    description: 'Date, location, and style preferences',
  },
  {
    id: 'budget',
    title: 'Budget Planning',
    description: 'Total budget and category allocations',
  },
  {
    id: 'ceremony',
    title: 'Ceremony & Reception',
    description: 'Details about your ceremony and reception',
  },
  {
    id: 'vendors',
    title: 'Vendor Preferences',
    description: 'Preferred vendors and requirements',
  },
  {
    id: 'logistics',
    title: 'Guests & Logistics',
    description: 'Guest management and travel arrangements',
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review your information and submit',
  },
];

// Form step components
const Step1Couple: React.FC = () => (
  <div className="space-y-6">
    <SectionCard
      title="Couple Information"
      description="Tell us about you and your partner"
      required
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Partner 1 First Name"
          name="step1.couple.firstName.0"
          required
        />
        <TextField
          label="Partner 1 Last Name"
          name="step1.couple.lastName.0"
          required
        />
        <TextField
          label="Partner 2 First Name"
          name="step1.couple.firstName.1"
          required
        />
        <TextField
          label="Partner 2 Last Name"
          name="step1.couple.lastName.1"
          required
        />
      </div>
    </SectionCard>

    <SectionCard
      title="Contact Information"
      description="How can we reach you?"
      required
    >
      <div className="space-y-4">
        <EmailField
          label="Primary Email"
          name="step1.emails.0"
          required
        />
        <EmailField
          label="Secondary Email (optional)"
          name="step1.emails.1"
        />
        <PhoneField
          label="Primary Phone"
          name="step1.phones.0"
          required
        />
        <PhoneField
          label="Secondary Phone (optional)"
          name="step1.phones.1"
        />
      </div>
    </SectionCard>

    <SectionCard
      title="Preferences"
      description="Communication and language preferences"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Pronouns"
          name="step1.pronouns"
          options={[
            { value: "he/him", label: "He/Him" },
            { value: "she/her", label: "She/Her" },
            { value: "they/them", label: "They/Them" },
            { value: "he/they", label: "He/They" },
            { value: "she/they", label: "She/They" },
            { value: "other", label: "Other" },
          ]}
        />
        <SelectField
          label="Preferred Language"
          name="step1.preferredLanguage"
          options={[
            { value: "en", label: "English" },
            { value: "de", label: "Deutsch" },
          ]}
        />
        <SelectField
          label="Communication Preference"
          name="step1.communicationPreferences"
          options={[
            { value: "email", label: "Email" },
            { value: "sms", label: "SMS" },
            { value: "both", label: "Both" },
          ]}
        />
      </div>
    </SectionCard>

    <SectionCard
      title="Decision Makers"
      description="Who will be making the key decisions?"
      required
    >
      <MultiSelectField
        label="Decision Makers"
        name="step1.decisionMakers"
        options={[
          { value: "Partner A", label: "Partner A" },
          { value: "Partner B", label: "Partner B" },
          { value: "Planner", label: "Wedding Planner" },
          { value: "Parent", label: "Parent" },
        ]}
        required
      />
    </SectionCard>
  </div>
);

const Step2Basics: React.FC = () => (
  <div className="space-y-6">
    <SectionCard
      title="Wedding Basics"
      description="Essential information about your wedding"
      required
    >
      <div className="space-y-4">
        <TextField
          label="Working Title"
          name="step2.workingTitle"
          placeholder="e.g., Kat & Nolan's Wedding"
          required
        />
        <DateField
          label="Wedding Date"
          name="step2.date"
          required
          min={new Date().toISOString().split('T')[0]}
        />
        <ToggleField
          label="Date is flexible"
          name="step2.isDateFlexible"
        />
      </div>
    </SectionCard>

    <SectionCard
      title="Location"
      description="Where will your wedding take place?"
      required
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextField
          label="City"
          name="step2.location.city"
          required
        />
        <TextField
          label="State/Region"
          name="step2.location.state"
          required
        />
        <TextField
          label="Country"
          name="step2.location.country"
          required
        />
      </div>
    </SectionCard>

    <SectionCard
      title="Venues"
      description="Information about your ceremony and reception venues"
      required
    >
      <div className="space-y-4">
        <TextField
          label="Ceremony Venue Name"
          name="step2.venues.ceremonyVenueName"
          required
        />
        <ToggleField
          label="Same venue for ceremony and reception"
          name="step2.venues.bothSameVenue"
        />
        <TextField
          label="Reception Venue Name"
          name="step2.venues.receptionVenueName"
        />
      </div>
    </SectionCard>

    <SectionCard
      title="Guest Information"
      description="Details about your guest list"
      required
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberField
          label="Estimated Guest Count"
          name="step2.guests.estimatedGuestCount"
          min={1}
          max={5000}
          required
        />
        <ToggleField
          label="Adults only"
          name="step2.guests.adultsOnly"
        />
        <NumberField
          label="Number of Minors (if any)"
          name="step2.guests.minorsCount"
          min={0}
        />
      </div>
    </SectionCard>

    <SectionCard
      title="Style & Vision"
      description="Your wedding style and priorities"
      required
    >
      <div className="space-y-4">
        <ChipsField
          label="Style Vibes"
          name="step2.style.styleVibes"
          options={[
            { value: "modern", label: "Modern" },
            { value: "rustic", label: "Rustic" },
            { value: "moody", label: "Moody" },
            { value: "classic", label: "Classic" },
            { value: "whimsical", label: "Whimsical" },
            { value: "garden", label: "Garden" },
            { value: "industrial", label: "Industrial" },
            { value: "beach", label: "Beach" },
            { value: "mountain", label: "Mountain" },
            { value: "destination", label: "Destination" },
            { value: "boho", label: "Boho" },
          ]}
          required
        />
        <ChipsField
          label="Priorities (select up to 5)"
          name="step2.style.priorities"
          options={[
            { value: "music", label: "Music" },
            { value: "food", label: "Food" },
            { value: "photos", label: "Photos" },
            { value: "decor", label: "Decor" },
            { value: "convenience", label: "Convenience" },
            { value: "budget", label: "Budget" },
            { value: "late-night", label: "Late Night" },
            { value: "sustainability", label: "Sustainability" },
          ]}
          maxSelections={5}
          required
        />
      </div>
    </SectionCard>
  </div>
);

const Step3Budget: React.FC = () => {
  const { watch, setValue } = useFormContext();
  const totalBudget = watch('step3.totalBudget');
  const presetSplit = watch('step3.presetSplit');
  const categories = watch('step3.categories') || [];

  const handlePresetChange = (preset: string) => {
    const presets = getPresetBudgetSplits();
    const selectedPreset = presets[preset as keyof typeof presets];
    if (selectedPreset) {
      setValue('step3.categories', selectedPreset);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Budget Overview"
        description="Set your total budget and currency"
        required
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MoneyField
            label="Total Budget"
            name="step3.totalBudget"
            required
          />
          <SelectField
            label="Currency"
            name="step3.currency"
            options={[
              { value: "USD", label: "USD ($)" },
              { value: "EUR", label: "EUR (€)" },
              { value: "GBP", label: "GBP (£)" },
              { value: "CAD", label: "CAD (C$)" },
              { value: "AUD", label: "AUD (A$)" },
            ]}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Budget Allocation"
        description="How would you like to allocate your budget?"
      >
        <div className="space-y-4">
          <SelectField
            label="Preset Allocation"
            name="step3.presetSplit"
            options={[
              { value: "classic", label: "Classic (45/30/10/8/7)" },
              { value: "diy-heavy", label: "DIY Heavy (50/25/15/5/5)" },
              { value: "luxury", label: "Luxury (35/25/15/12/8/5)" },
              { value: "minimalist", label: "Minimalist (60/25/10/5)" },
              { value: "custom", label: "Custom" },
            ]}
            onChange={(e) => handlePresetChange(e.target.value)}
          />
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Category Breakdown</h4>
            {categories.map((category: any, index: number) => (
              <div key={category.name} className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-700 capitalize">
                    {category.name}
                  </label>
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    value={category.percent}
                    onChange={(e) => {
                      const newCategories = [...categories];
                      newCategories[index].percent = parseFloat(e.target.value) || 0;
                      setValue('step3.categories', newCategories);
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div className="w-20 text-sm text-gray-500">
                  {totalBudget ? `$${((category.percent / 100) * totalBudget).toLocaleString()}` : '-'}
                </div>
              </div>
            ))}
            <div className="flex justify-between text-sm">
              <span>Total: {categories.reduce((sum: number, cat: any) => sum + (cat.percent || 0), 0)}%</span>
              <span className={categories.reduce((sum: number, cat: any) => sum + (cat.percent || 0), 0) === 100 ? 'text-green-600' : 'text-red-600'}>
                {categories.reduce((sum: number, cat: any) => sum + (cat.percent || 0), 0) === 100 ? '✓ Balanced' : 'Needs adjustment'}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

const Step4Ceremony: React.FC = () => (
  <div className="space-y-6">
    <SectionCard
      title="Ceremony Details"
      description="Information about your ceremony"
    >
      <div className="space-y-4">
        <SelectField
          label="Ceremony Type"
          name="step4.ceremony.type"
          options={[
            { value: "civil", label: "Civil" },
            { value: "religious-light", label: "Religious (Light)" },
            { value: "religious-traditional", label: "Religious (Traditional)" },
            { value: "symbolic", label: "Symbolic" },
          ]}
        />
        <ToggleField
          label="Need an officiant"
          name="step4.ceremony.officiantNeeded"
        />
        <TextareaField
          label="Officiant Notes"
          name="step4.ceremony.officiantNotes"
          rows={3}
        />
      </div>
    </SectionCard>

    <SectionCard
      title="Dining & Bar"
      description="Food and beverage preferences"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Meal Style"
          name="step4.dining.mealStyle"
          options={[
            { value: "plated", label: "Plated" },
            { value: "buffet", label: "Buffet" },
            { value: "family-style", label: "Family Style" },
            { value: "stations", label: "Stations" },
            { value: "cocktail-style", label: "Cocktail Style" },
          ]}
        />
        <SelectField
          label="Bar Preference"
          name="step4.dining.barPreference"
          options={[
            { value: "open", label: "Open Bar" },
            { value: "limited", label: "Limited Bar" },
            { value: "cash", label: "Cash Bar" },
            { value: "dry", label: "Dry Wedding" },
          ]}
        />
      </div>
    </SectionCard>

    <SectionCard
      title="Seating & Layout"
      description="Seating arrangements and special requirements"
    >
      <div className="space-y-4">
        <SelectField
          label="Seating Style"
          name="step4.seating.style"
          options={[
            { value: "long-tables", label: "Long Tables" },
            { value: "u-shape", label: "U-Shape" },
            { value: "rounds", label: "Round Tables" },
            { value: "mixed", label: "Mixed" },
          ]}
        />
        <ToggleField
          label="Dance floor required"
          name="step4.seating.danceFloorRequired"
        />
        <ToggleField
          label="Stage required"
          name="step4.seating.stageRequired"
        />
      </div>
    </SectionCard>
  </div>
);

const Step5Vendors: React.FC = () => (
  <div className="space-y-6">
    <SectionCard
      title="Required Vendors"
      description="Which vendors do you need?"
      required
    >
      <MultiSelectField
        label="Required Vendors"
        name="step5.requiredVendors"
        options={[
          { value: "photographer", label: "Photographer" },
          { value: "videographer", label: "Videographer" },
          { value: "florist", label: "Florist" },
          { value: "caterer", label: "Caterer" },
          { value: "musician", label: "Musician/DJ" },
          { value: "officiant", label: "Officiant" },
          { value: "transportation", label: "Transportation" },
          { value: "beauty", label: "Beauty Services" },
          { value: "attire", label: "Attire" },
          { value: "stationery", label: "Stationery" },
        ]}
        required
      />
    </SectionCard>

    <SectionCard
      title="Vendor Preferences"
      description="Specific preferences for different vendor types"
    >
      <div className="space-y-4">
        <SelectField
          label="Photographer Style"
          name="step5.photographer.style"
          options={[
            { value: "editorial", label: "Editorial" },
            { value: "documentary", label: "Documentary" },
            { value: "fine-art", label: "Fine Art" },
            { value: "flash", label: "Flash" },
            { value: "film", label: "Film" },
          ]}
        />
        <SelectField
          label="Music Preference"
          name="step5.music.bandOrDJ"
          options={[
            { value: "band", label: "Band" },
            { value: "dj", label: "DJ" },
            { value: "both", label: "Both" },
            { value: "unsure", label: "Unsure" },
          ]}
        />
        <SelectField
          label="Floral Style"
          name="step5.florals.style"
          options={[
            { value: "minimal", label: "Minimal" },
            { value: "lush", label: "Lush" },
            { value: "moody", label: "Moody" },
            { value: "seasonal-wild", label: "Seasonal Wild" },
          ]}
        />
      </div>
    </SectionCard>
  </div>
);

const Step6Logistics: React.FC = () => (
  <div className="space-y-6">
    <SectionCard
      title="Travel & Accommodations"
      description="Information about guest travel and accommodations"
    >
      <div className="space-y-4">
        <ToggleField
          label="Majority of guests from out of town"
          name="step6.travel.majorityFromOutOfTown"
        />
        <NumberField
          label="Hotel blocks needed"
          name="step6.travel.hotelBlocksNeeded"
          min={0}
        />
        <ToggleField
          label="Shuttle service needed"
          name="step6.travel.shuttleNeeded"
        />
        <NumberField
          label="Travel time between ceremony and reception (minutes)"
          name="step6.travel.ceremonyToReceptionTravelTime"
          min={0}
        />
      </div>
    </SectionCard>

    <SectionCard
      title="Guest Management"
      description="Policies and preferences for guest management"
    >
      <div className="space-y-4">
        <SelectField
          label="Kids Policy"
          name="step6.guests.kidsPolicy"
          options={[
            { value: "all", label: "All children welcome" },
            { value: "family-only", label: "Family children only" },
            { value: "none", label: "Adults only" },
          ]}
        />
        <SelectField
          label="RSVP Preference"
          name="step6.guests.rsvpPreference"
          options={[
            { value: "site", label: "Wedding website" },
            { value: "email", label: "Email" },
            { value: "qr-code", label: "QR code" },
          ]}
        />
      </div>
    </SectionCard>

    <SectionCard
      title="Wedding Website"
      description="Website preferences and requirements"
    >
      <div className="space-y-4">
        <ToggleField
          label="Need a wedding website"
          name="step6.website.needed"
        />
        <SelectField
          label="Copy Tone"
          name="step6.website.copyTone"
          options={[
            { value: "friendly", label: "Friendly" },
            { value: "formal", label: "Formal" },
            { value: "playful", label: "Playful" },
          ]}
        />
        <ToggleField
          label="Bilingual website (EN/DE)"
          name="step6.website.bilingualSite"
        />
      </div>
    </SectionCard>
  </div>
);

const Step7Review: React.FC = () => {
  const { watch } = useFormContext();
  const formData = watch();

  return (
    <div className="space-y-6">
      <SectionCard
        title="Review Your Information"
        description="Please review all the information you've provided"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Couple Information</h4>
            <p className="text-sm text-gray-600">
              {formData.step1?.couple?.firstName?.[0]} {formData.step1?.couple?.lastName?.[0]} & {formData.step1?.couple?.firstName?.[1]} {formData.step1?.couple?.lastName?.[1]}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Wedding Details</h4>
            <p className="text-sm text-gray-600">
              {formData.step2?.workingTitle} on {formData.step2?.date} in {formData.step2?.location?.city}, {formData.step2?.location?.state}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Budget</h4>
            <p className="text-sm text-gray-600">
              {formData.step3?.currency} {formData.step3?.totalBudget?.toLocaleString()} total budget
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Consent & Submission"
        description="Please provide consent and submit your information"
        required
      >
        <div className="space-y-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="consent"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="consent" className="ml-2 text-sm text-gray-700">
              I consent to the use of my data for wedding planning purposes and agree to the terms of service.
            </label>
          </div>
          
          <div className="flex items-start">
            <input
              type="checkbox"
              id="emailCopy"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="emailCopy" className="ml-2 text-sm text-gray-700">
              Send me a copy of my intake information via email.
            </label>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

// Main intake form component
const IntakeForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const projectId = searchParams.get('projectId');

  const methods = useForm<IntakeData>({
    resolver: zodResolver(intakeDraftSchema),
    defaultValues: {
      step1: {
        couple: { firstName: ['', ''], lastName: ['', ''] },
        emails: ['', ''],
        phones: ['', ''],
        pronouns: 'they/them',
        preferredLanguage: 'en',
        communicationPreferences: 'email',
        decisionMakers: [],
      },
      step2: {
        workingTitle: '',
        date: '',
        isDateFlexible: false,
        location: { city: '', state: '', country: '' },
        venues: { ceremonyVenueName: '', receptionVenueName: '', bothSameVenue: false },
        settings: { indoorOutdoor: [], accessibilityNeeds: '' },
        guests: { estimatedGuestCount: 0, adultsOnly: false, minorsCount: 0 },
        vips: [],
        style: { styleVibes: [], colorPalette: [], priorities: [] },
      },
      step3: {
        totalBudget: 0,
        currency: 'USD',
        presetSplit: 'classic',
        categories: getPresetBudgetSplits().classic,
        mustHaves: [],
        niceToHaves: [],
      },
      step4: {
        ceremony: { type: 'civil', officiantNeeded: false, officiantNotes: '' },
        timeline: { preferences: '', sunsetCeremony: false },
        dining: { mealStyle: 'plated', barPreference: 'open' },
        seating: { style: 'rounds', danceFloorRequired: true, stageRequired: false },
        specialMoments: [],
        timing: { noiseOrdinanceTime: '', venueCutoffTime: '' },
      },
      step5: {
        requiredVendors: [],
        photographer: { style: undefined },
        music: { bandOrDJ: undefined, genres: [] },
        florals: { style: undefined },
        catering: { notes: '', dietaryRestrictions: [], cuisinePreferences: [] },
        rentals: [],
        budgetBands: {},
        search: { radiusMiles: 50, preferredZip: '', availabilityWindow: undefined },
        inspiration: [],
      },
      step6: {
        travel: { majorityFromOutOfTown: false, hotelBlocksNeeded: 0, shuttleNeeded: false, ceremonyToReceptionTravelTime: 0, accessibilityNotes: '' },
        guests: { kidsPolicy: 'all', rsvpPreference: 'site' },
        website: { needed: false, copyTone: 'friendly', bilingualSite: false },
      },
      step7: {
        consent: false,
        emailCopy: false,
      },
    },
  });

  const { handleSubmit, formState: { errors, isValid }, watch, setValue } = methods;

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (currentStep === 6) return; // Don't auto-save on review step
    
    setSaveStatus('saving');
    try {
      const formData = watch();
      const stepData = formData[`step${currentStep + 1}` as keyof IntakeData];
      
      if (stepData) {
        const response = await fetch('/api/intake/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            step: currentStep + 1,
            data: stepData,
          }),
        });
        
        if (response.ok) {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          setSaveStatus('error');
        }
      }
    } catch (error) {
      setSaveStatus('error');
    }
  }, [currentStep, watch, projectId]);

  // Auto-save on step change
  useEffect(() => {
    if (currentStep > 0) {
      autoSave();
    }
  }, [currentStep, autoSave]);

  // Load existing data if projectId is provided
  useEffect(() => {
    if (projectId) {
      // Load existing intake data
      fetch(`/api/intake?projectId=${projectId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            Object.entries(data).forEach(([key, value]) => {
              setValue(key as any, value);
            });
          }
        })
        .catch(console.error);
    }
  }, [projectId, setValue]);

  const handleNext = async () => {
    const currentStepData = watch(`step${currentStep + 1}` as keyof IntakeData);
    const validation = validateStep(`step${currentStep + 1}` as keyof IntakeData, currentStepData);
    
    if (validation.success) {
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      console.error('Validation errors:', validation.error);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow navigation to completed steps or current step
    const completedSteps = Array.from({ length: 7 }, (_, i) => i).filter(i => {
      const stepData = watch(`step${i + 1}` as keyof IntakeData);
      return stepData && Object.keys(stepData).length > 0;
    });
    
    if (stepIndex <= currentStep || completedSteps.includes(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const onSubmit = async (data: IntakeData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          data,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        navigate(`/dashboard?projectId=${result.projectId}`);
      } else {
        console.error('Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaveStatus('saving');
    try {
      const formData = watch();
      const response = await fetch('/api/intake/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          data: formData,
        }),
      });
      
      if (response.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
    }
  };

  const steps = STEPS.map((step, index) => ({
    ...step,
    status: index < currentStep ? 'completed' : index === currentStep ? 'current' : 'upcoming',
  }));

  const stepComponents = [
    Step1Couple,
    Step2Basics,
    Step3Budget,
    Step4Ceremony,
    Step5Vendors,
    Step6Logistics,
    Step7Review,
  ];

  const CurrentStepComponent = stepComponents[currentStep];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Wedding Intake Form
          </h1>
          <p className="text-gray-600">
            Let's gather all the details about your perfect wedding day
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <ProgressBar currentStep={currentStep} totalSteps={7} />
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <IntakeStepper
            currentStep={currentStep}
            steps={steps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Form */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <CurrentStepComponent />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </button>

              <div className="flex items-center gap-4">
                {saveStatus === 'saving' && (
                  <span className="text-sm text-gray-500 flex items-center">
                    <Save className="h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-sm text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Saved
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-sm text-red-600">Save failed</span>
                )}

                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !isValid}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit & Apply'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default IntakeForm;
