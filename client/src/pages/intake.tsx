import { useState } from "react";
import { useLocation } from "wouter";
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
import { CalendarIcon, Heart, Users, Palette, ListChecks, UserPlus, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

export default function Intake() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
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
        weddingDate: data.weddingBasics.weddingDate,
        ceremonyLocation: data.weddingBasics.ceremonyLocation,
        receptionLocation: data.weddingBasics.receptionLocation,
        estimatedGuests: data.weddingBasics.estimatedGuests,
        totalBudget: data.weddingBasics.totalBudget,
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
      // Update local storage to reflect completed intake
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.hasCompletedIntake = true;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      toast({
        title: "Wedding intake completed!",
        description: "Your information has been saved. Let's start planning your perfect day!",
      });
      
      // Force a page reload to update the router with new user state
      window.location.href = "/";
    },
    onError: (error: any) => {
      console.error('Intake submission error:', error);
      toast({
        title: "Error saving intake",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.coupleInfo.partner1.firstName || !formData.coupleInfo.partner1.email) {
      toast({
        title: "Missing information",
        description: "Please fill in at least the first partner's name and email.",
        variant: "destructive",
      });
      return;
    }

    submitIntakeMutation.mutate(formData);
  };

  const addMustHaveElement = () => {
    if (newMustHave.trim()) {
      setFormData(prev => ({
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
    setFormData(prev => ({
      ...prev,
      styleVision: {
        ...prev.styleVision,
        mustHaveElements: prev.styleVision.mustHaveElements.filter((_, i) => i !== index)
      }
    }));
  };

  const addPinterestBoard = () => {
    if (newPinterestBoard.trim()) {
      // Validate Pinterest URL
      const pinterestRegex = /^https:\/\/(www\.)?pinterest\.(com|ca|co\.uk|fr|de|it|es|pt|dk|no|se|fi|pl|ru|jp|kr|au)\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/?$/;
      if (!pinterestRegex.test(newPinterestBoard.trim())) {
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
          pinterestBoards: [...prev.styleVision.pinterestBoards, newPinterestBoard.trim()]
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Wedding Planning Intake</h1>
        <p className="text-gray-600">Let's gather the essential information to create your perfect wedding plan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Couple Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-blush" />
              Couple Information
            </CardTitle>
            <CardDescription>
              Tell us about yourselves and your relationship
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Partner 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="p1-firstName">First Name *</Label>
                <Input
                  id="p1-firstName"
                  value={formData.coupleInfo.partner1.firstName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    coupleInfo: {
                      ...prev.coupleInfo,
                      partner1: { ...prev.coupleInfo.partner1, firstName: e.target.value }
                    }
                  }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="p1-lastName">Last Name</Label>
                <Input
                  id="p1-lastName"
                  value={formData.coupleInfo.partner1.lastName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    coupleInfo: {
                      ...prev.coupleInfo,
                      partner1: { ...prev.coupleInfo.partner1, lastName: e.target.value }
                    }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="p1-role">Role</Label>
                <Select
                  value={formData.coupleInfo.partner1.role}
                  onValueChange={(value) => setFormData(prev => ({
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
            
            <div>
              <Label htmlFor="p1-email">Email Address *</Label>
              <Input
                id="p1-email"
                type="email"
                value={formData.coupleInfo.partner1.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  coupleInfo: {
                    ...prev.coupleInfo,
                    partner1: { ...prev.coupleInfo.partner1, email: e.target.value }
                  }
                }))}
                required
              />
            </div>

            {/* Partner 2 */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Partner 2</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="p2-firstName">First Name</Label>
                  <Input
                    id="p2-firstName"
                    value={formData.coupleInfo.partner2.firstName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coupleInfo: {
                        ...prev.coupleInfo,
                        partner2: { ...prev.coupleInfo.partner2, firstName: e.target.value }
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="p2-lastName">Last Name</Label>
                  <Input
                    id="p2-lastName"
                    value={formData.coupleInfo.partner2.lastName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      coupleInfo: {
                        ...prev.coupleInfo,
                        partner2: { ...prev.coupleInfo.partner2, lastName: e.target.value }
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="p2-role">Role</Label>
                  <Select
                    value={formData.coupleInfo.partner2.role}
                    onValueChange={(value) => setFormData(prev => ({
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
              
              <div className="mt-4">
                <Label htmlFor="p2-email">Email Address</Label>
                <Input
                  id="p2-email"
                  type="email"
                  value={formData.coupleInfo.partner2.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    coupleInfo: {
                      ...prev.coupleInfo,
                      partner2: { ...prev.coupleInfo.partner2, email: e.target.value }
                    }
                  }))}
                />
              </div>
            </div>

            {/* Wedding Planner */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPlanner"
                checked={formData.coupleInfo.hasWeddingPlanner}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  coupleInfo: {
                    ...prev.coupleInfo,
                    hasWeddingPlanner: checked as boolean
                  }
                }))}
              />
              <Label htmlFor="hasPlanner">Do you already have a wedding planner?</Label>
            </div>
          </CardContent>
        </Card>

        {/* Wedding Basics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blush" />
              Wedding Basics
            </CardTitle>
            <CardDescription>
              The fundamental details of your special day
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Wedding Date */}
            <div>
              <Label>Wedding Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.weddingBasics.weddingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.weddingBasics.weddingDate ? (
                      format(formData.weddingBasics.weddingDate, "PPP")
                    ) : (
                      <span>Pick a date (or target timeframe)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.weddingBasics.weddingDate}
                    onSelect={(date) => setFormData(prev => ({
                      ...prev,
                      weddingBasics: { ...prev.weddingBasics, weddingDate: date }
                    }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Locations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ceremony-location">Ceremony Location</Label>
                <Input
                  id="ceremony-location"
                  placeholder="e.g., Garden, Church, Beach"
                  value={formData.weddingBasics.ceremonyLocation}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    weddingBasics: { ...prev.weddingBasics, ceremonyLocation: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="reception-location">Reception Location</Label>
                <Input
                  id="reception-location"
                  placeholder="e.g., Ballroom, Barn, Same as ceremony"
                  value={formData.weddingBasics.receptionLocation}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    weddingBasics: { ...prev.weddingBasics, receptionLocation: e.target.value }
                  }))}
                />
              </div>
            </div>

            {/* Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guest-count">Estimated Guest Count</Label>
                <Input
                  id="guest-count"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.weddingBasics.estimatedGuests || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    weddingBasics: { ...prev.weddingBasics, estimatedGuests: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="total-budget">Total Budget ($)</Label>
                <Input
                  id="total-budget"
                  type="number"
                  placeholder="e.g., 25000"
                  value={formData.weddingBasics.totalBudget || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    weddingBasics: { ...prev.weddingBasics, totalBudget: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Style & Vision */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blush" />
              Style & Vision
            </CardTitle>
            <CardDescription>
              Help us understand your dream wedding aesthetic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Vibe */}
            <div>
              <Label>Overall Wedding Vibe</Label>
              <Select
                value={formData.styleVision.overallVibe}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  styleVision: { ...prev.styleVision, overallVibe: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your style" />
                </SelectTrigger>
                <SelectContent>
                  {weddingVibes.map(vibe => (
                    <SelectItem key={vibe} value={vibe}>{vibe}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Palette */}
            <div>
              <Label htmlFor="color-palette">Color Palette</Label>
              <Input
                id="color-palette"
                placeholder="e.g., Blush pink, sage green, gold accents"
                value={formData.styleVision.colorPalette}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  styleVision: { ...prev.styleVision, colorPalette: e.target.value }
                }))}
              />
            </div>

            {/* Must-Have Elements */}
            <div>
              <Label>Must-Have Elements</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="e.g., Live band, outdoor setting, food trucks"
                  value={newMustHave}
                  onChange={(e) => setNewMustHave(e.target.value)}
                />
                <Button type="button" onClick={addMustHaveElement}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.styleVision.mustHaveElements.map((element, index) => (
                  <div key={index} className="bg-blush/10 px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="text-sm">{element}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMustHaveElement(index)}
                      className="h-4 w-4 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pinterest Boards */}
            <div>
              <Label>Pinterest Inspiration Boards</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="https://pinterest.com/username/board-name"
                  value={newPinterestBoard}
                  onChange={(e) => setNewPinterestBoard(e.target.value)}
                />
                <Button type="button" onClick={addPinterestBoard}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.styleVision.pinterestBoards.map((board, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm flex-1 font-mono">{board}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removePinterestBoard(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priorities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blush" />
              Priorities
            </CardTitle>
            <CardDescription>
              Help us focus on what matters most to you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Top 3 Priorities */}
            <div>
              <Label>Select Your Top 3 Priorities</Label>
              <p className="text-sm text-gray-600 mb-3">
                Choose up to 3 areas that are most important for your wedding
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {priorityOptions.map(priority => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={priority}
                      checked={formData.priorities.topPriorities.includes(priority)}
                      onCheckedChange={() => togglePriority(priority)}
                      disabled={
                        !formData.priorities.topPriorities.includes(priority) &&
                        formData.priorities.topPriorities.length >= 3
                      }
                    />
                    <Label htmlFor={priority} className="text-sm">{priority}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-negotiables */}
            <div>
              <Label htmlFor="non-negotiables">Non-negotiables & Special Traditions</Label>
              <Textarea
                id="non-negotiables"
                placeholder="Tell us about any must-haves, family traditions, religious requirements, or dealbreakers..."
                value={formData.priorities.nonNegotiables}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  priorities: { ...prev.priorities, nonNegotiables: e.target.value }
                }))}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Key People */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blush" />
              Key People
            </CardTitle>
            <CardDescription>
              Tell us about the important people in your wedding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* VIPs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>VIPs (Parents, Siblings, Close Family)</Label>
                <Button type="button" onClick={addVIP} size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add VIP
                </Button>
              </div>
              <div className="space-y-3">
                {formData.keyPeople.vips.map((vip, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Name"
                      value={vip.name}
                      onChange={(e) => {
                        const newVips = [...formData.keyPeople.vips];
                        newVips[index] = { ...newVips[index], name: e.target.value };
                        setFormData(prev => ({
                          ...prev,
                          keyPeople: { ...prev.keyPeople, vips: newVips }
                        }));
                      }}
                    />
                    <Input
                      placeholder="Role (e.g., Mother, Father, Sister)"
                      value={vip.role}
                      onChange={(e) => {
                        const newVips = [...formData.keyPeople.vips];
                        newVips[index] = { ...newVips[index], role: e.target.value };
                        setFormData(prev => ({
                          ...prev,
                          keyPeople: { ...prev.keyPeople, vips: newVips }
                        }));
                      }}
                    />
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
              </div>
            </div>

            {/* Wedding Party */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Wedding Party Members</Label>
                <Button type="button" onClick={addWeddingPartyMember} size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add Member
                </Button>
              </div>
              <div className="space-y-3">
                {formData.keyPeople.weddingParty.map((member, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => {
                        const newMembers = [...formData.keyPeople.weddingParty];
                        newMembers[index] = { ...newMembers[index], name: e.target.value };
                        setFormData(prev => ({
                          ...prev,
                          keyPeople: { ...prev.keyPeople, weddingParty: newMembers }
                        }));
                      }}
                    />
                    <Input
                      placeholder="Role (e.g., Maid of Honor, Best Man, Bridesmaid)"
                      value={member.role}
                      onChange={(e) => {
                        const newMembers = [...formData.keyPeople.weddingParty];
                        newMembers[index] = { ...newMembers[index], role: e.target.value };
                        setFormData(prev => ({
                          ...prev,
                          keyPeople: { ...prev.keyPeople, weddingParty: newMembers }
                        }));
                      }}
                    />
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
              </div>
            </div>

            {/* Officiant Status */}
            <div>
              <Label>Officiant Status</Label>
              <RadioGroup
                value={formData.keyPeople.officiantStatus}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  keyPeople: { ...prev.keyPeople, officiantStatus: value }
                }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="decided" id="officiant-decided" />
                  <Label htmlFor="officiant-decided">Already decided</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="considering" id="officiant-considering" />
                  <Label htmlFor="officiant-considering">Considering options</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="need-help" id="officiant-help" />
                  <Label htmlFor="officiant-help">Need help finding one</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button 
            type="submit" 
            className="gradient-blush-rose px-8 py-3 text-lg"
            disabled={submitIntakeMutation.isPending}
          >
            {submitIntakeMutation.isPending ? (
              "Saving your information..."
            ) : (
              "Complete Intake & Start Planning"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}