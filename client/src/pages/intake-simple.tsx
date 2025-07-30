import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { WeddingButton } from "@/components/ui/wedding-button";

export default function IntakeSimple() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    partner1FirstName: "",
    partner1LastName: "",
    partner1Email: "",
    partner2FirstName: "",
    partner2LastName: "",
    partner2Email: "",
    weddingDate: undefined as Date | undefined,
    ceremonyLocation: "",
    receptionLocation: "",
    estimatedGuests: "",
    totalBudget: "",
    overallVibe: "",
    colorPalette: "",
    nonNegotiables: "",
    officiantStatus: ""
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({
          partner1FirstName: formData.partner1FirstName,
          partner1LastName: formData.partner1LastName,
          partner1Email: formData.partner1Email,
          partner2FirstName: formData.partner2FirstName,
          partner2LastName: formData.partner2LastName,
          partner2Email: formData.partner2Email,
          weddingDate: formData.weddingDate?.toISOString(),
          ceremonyLocation: formData.ceremonyLocation,
          receptionLocation: formData.receptionLocation,
          estimatedGuests: formData.estimatedGuests ? parseInt(formData.estimatedGuests) : null,
          totalBudget: formData.totalBudget,
          overallVibe: formData.overallVibe,
          colorPalette: formData.colorPalette,
          nonNegotiables: formData.nonNegotiables,
          officiantStatus: formData.officiantStatus
        })
      });

      if (response.ok) {
        toast({
          title: "Welcome to PlanHaus!",
          description: "Your wedding planning journey begins now.",
        });
        setLocation('/dashboard');
      } else {
        throw new Error('Failed to save intake form');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blush mb-2">Tell us about yourselves</h2>
              <p className="text-gray-600">Let's get to know the happy couple!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Partner 1</h3>
                <div>
                  <Label htmlFor="partner1FirstName">First Name</Label>
                  <Input
                    id="partner1FirstName"
                    value={formData.partner1FirstName}
                    onChange={(e) => updateField('partner1FirstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="partner1LastName">Last Name</Label>
                  <Input
                    id="partner1LastName"
                    value={formData.partner1LastName}
                    onChange={(e) => updateField('partner1LastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label htmlFor="partner1Email">Email</Label>
                  <Input
                    id="partner1Email"
                    type="email"
                    value={formData.partner1Email}
                    onChange={(e) => updateField('partner1Email', e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Partner 2</h3>
                <div>
                  <Label htmlFor="partner2FirstName">First Name</Label>
                  <Input
                    id="partner2FirstName"
                    value={formData.partner2FirstName}
                    onChange={(e) => updateField('partner2FirstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="partner2LastName">Last Name</Label>
                  <Input
                    id="partner2LastName"
                    value={formData.partner2LastName}
                    onChange={(e) => updateField('partner2LastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label htmlFor="partner2Email">Email</Label>
                  <Input
                    id="partner2Email"
                    type="email"
                    value={formData.partner2Email}
                    onChange={(e) => updateField('partner2Email', e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blush mb-2">Wedding Basics</h2>
              <p className="text-gray-600">When and where is the big day?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Wedding Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.weddingDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.weddingDate ? format(formData.weddingDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.weddingDate}
                      onSelect={(date) => updateField('weddingDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="ceremonyLocation">Ceremony Location</Label>
                <Input
                  id="ceremonyLocation"
                  value={formData.ceremonyLocation}
                  onChange={(e) => updateField('ceremonyLocation', e.target.value)}
                  placeholder="Where will you say 'I do'?"
                />
              </div>
              
              <div>
                <Label htmlFor="receptionLocation">Reception Location</Label>
                <Input
                  id="receptionLocation"
                  value={formData.receptionLocation}
                  onChange={(e) => updateField('receptionLocation', e.target.value)}
                  placeholder="Where will you celebrate?"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedGuests">Estimated Guests</Label>
                  <Input
                    id="estimatedGuests"
                    type="number"
                    value={formData.estimatedGuests}
                    onChange={(e) => updateField('estimatedGuests', e.target.value)}
                    placeholder="100"
                  />
                </div>
                
                <div>
                  <Label htmlFor="totalBudget">Total Budget</Label>
                  <Input
                    id="totalBudget"
                    value={formData.totalBudget}
                    onChange={(e) => updateField('totalBudget', e.target.value)}
                    placeholder="$50,000"
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blush mb-2">Style & Vision</h2>
              <p className="text-gray-600">What's your dream wedding style?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="overallVibe">Overall Vibe</Label>
                <Select value={formData.overallVibe} onValueChange={(value) => updateField('overallVibe', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your wedding vibe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="romantic-classic">Romantic & Classic</SelectItem>
                    <SelectItem value="boho-rustic">Boho & Rustic</SelectItem>
                    <SelectItem value="modern-minimalist">Modern & Minimalist</SelectItem>
                    <SelectItem value="vintage-retro">Vintage & Retro</SelectItem>
                    <SelectItem value="garden-natural">Garden & Natural</SelectItem>
                    <SelectItem value="glamorous-luxury">Glamorous & Luxury</SelectItem>
                    <SelectItem value="beach-coastal">Beach & Coastal</SelectItem>
                    <SelectItem value="industrial-urban">Industrial & Urban</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="colorPalette">Color Palette</Label>
                <Input
                  id="colorPalette"
                  value={formData.colorPalette}
                  onChange={(e) => updateField('colorPalette', e.target.value)}
                  placeholder="Blush pink, sage green, ivory..."
                />
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blush mb-2">Priorities</h2>
              <p className="text-gray-600">What matters most to you?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="nonNegotiables">Non-Negotiables</Label>
                <Textarea
                  id="nonNegotiables"
                  value={formData.nonNegotiables}
                  onChange={(e) => updateField('nonNegotiables', e.target.value)}
                  placeholder="What are the must-haves for your wedding day?"
                  rows={4}
                />
              </div>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blush mb-2">Key People</h2>
              <p className="text-gray-600">Who will help make your day special?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="officiantStatus">Officiant Status</Label>
                <Select value={formData.officiantStatus} onValueChange={(value) => updateField('officiantStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Do you have an officiant?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booked">Already booked</SelectItem>
                    <SelectItem value="researching">Still researching</SelectItem>
                    <SelectItem value="friend-family">Friend/family member</SelectItem>
                    <SelectItem value="need-help">Need help finding one</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush/5 to-champagne/10 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-serif text-blush">Welcome to PlanHaus</CardTitle>
            <p className="text-gray-600">Step {currentStep} of 5</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div 
                className="bg-gradient-to-r from-blush to-rose-gold h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {renderStep()}
            
            <div className="flex justify-between mt-8 pt-6 border-t">
              <WeddingButton
                variant="soft"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </WeddingButton>
              
              {currentStep === 5 ? (
                <WeddingButton
                  variant="wedding"
                  onClick={handleSubmit}
                  className="flex items-center gap-2"
                >
                  Complete Setup
                </WeddingButton>
              ) : (
                <WeddingButton
                  variant="wedding"
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </WeddingButton>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}