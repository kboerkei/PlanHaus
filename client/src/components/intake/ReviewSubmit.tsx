import React from 'react';
import { useFormContext } from 'react-hook-form';
import { IntakeData } from '../../schemas/intake';
import { SectionCard } from './SectionCard';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Heart, 
  Building2, 
  Car, 
  Globe,
  Edit3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ReviewSubmitProps {
  onEditStep: (step: number) => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  isSubmitting: boolean;
}

export const ReviewSubmit: React.FC<ReviewSubmitProps> = ({
  onEditStep,
  onSubmit,
  onSaveDraft,
  isSubmitting,
}) => {
  const { watch, setValue, formState: { errors } } = useFormContext<IntakeData>();
  const formData = watch();

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatMoney = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const renderStep1Summary = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Couple & Contacts
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditStep(0)}
          className="h-8 w-8 p-0"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Partner 1</h4>
            <p className="text-sm">
              {formData.step1?.couple?.firstName?.[0]} {formData.step1?.couple?.lastName?.[0]}
            </p>
            <p className="text-xs text-muted-foreground">
              {formData.step1?.emails?.[0]} • {formData.step1?.phones?.[0]}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Partner 2</h4>
            <p className="text-sm">
              {formData.step1?.couple?.firstName?.[1]} {formData.step1?.couple?.lastName?.[1]}
            </p>
            <p className="text-xs text-muted-foreground">
              {formData.step1?.emails?.[1]} • {formData.step1?.phones?.[1]}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{formData.step1?.pronouns}</Badge>
          <Badge variant="secondary">{formData.step1?.preferredLanguage?.toUpperCase()}</Badge>
          <Badge variant="secondary">{formData.step1?.communicationPreferences}</Badge>
        </div>
        {formData.step1?.decisionMakers && formData.step1.decisionMakers.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Decision Makers</h4>
            <div className="flex flex-wrap gap-1">
              {formData.step1.decisionMakers.map((maker, index) => (
                <Badge key={index} variant="outline">{maker}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep2Summary = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Wedding Basics
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditStep(1)}
          className="h-8 w-8 p-0"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">Working Title</h4>
          <p className="text-sm">{formData.step2?.workingTitle || 'Not specified'}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Wedding Date
            </h4>
            <p className="text-sm">{formatDate(formData.step2?.date || '')}</p>
            {formData.step2?.isDateFlexible && (
              <p className="text-xs text-muted-foreground">Date is flexible</p>
            )}
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Location
            </h4>
            <p className="text-sm">
              {formData.step2?.location?.city}, {formData.step2?.location?.state}, {formData.step2?.location?.country}
            </p>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">Venues</h4>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Ceremony:</span> {formData.step2?.venues?.ceremonyVenueName || 'Not specified'}
            </p>
            {!formData.step2?.venues?.bothSameVenue && (
              <p className="text-sm">
                <span className="font-medium">Reception:</span> {formData.step2?.venues?.receptionVenueName || 'Not specified'}
              </p>
            )}
          </div>
        </div>
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">Guest Count</h4>
          <p className="text-sm">
            {formData.step2?.guests?.estimatedGuestCount} guests
            {formData.step2?.guests?.adultsOnly && ' (Adults only)'}
            {(formData.step2?.guests?.minorsCount || 0) > 0 && ` (${formData.step2?.guests?.minorsCount} minors)`}
          </p>
        </div>
        {formData.step2?.style?.styleVibes && formData.step2.style.styleVibes.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Style & Vibes</h4>
            <div className="flex flex-wrap gap-1">
              {formData.step2.style.styleVibes.map((vibe, index) => (
                <Badge key={index} variant="outline">{vibe}</Badge>
              ))}
            </div>
          </div>
        )}
        {formData.step2?.style?.priorities && formData.step2.style.priorities.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Top Priorities</h4>
            <div className="flex flex-wrap gap-1">
              {formData.step2.style.priorities.map((priority, index) => (
                <Badge key={index} variant="secondary">{priority}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep3Summary = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Budget
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditStep(2)}
          className="h-8 w-8 p-0"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">Total Budget</h4>
          <p className="text-lg font-semibold">
            {formatMoney(formData.step3?.totalBudget || 0, formData.step3?.currency)}
          </p>
        </div>
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Budget Allocation</h4>
          <div className="space-y-2">
            {formData.step3?.categories && formData.step3.categories.map((category) => (
              <div key={category.name} className="flex justify-between items-center">
                <span className="text-sm capitalize">{category.name.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-sm font-medium">{category.percent}%</span>
              </div>
            ))}
          </div>
        </div>
        {(formData.step3?.mustHaves && formData.step3.mustHaves.length > 0) && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Must Haves</h4>
            <div className="flex flex-wrap gap-1">
              {formData.step3.mustHaves.map((item, index) => (
                <Badge key={index} variant="default">{item}</Badge>
              ))}
            </div>
          </div>
        )}
        {(formData.step3?.niceToHaves && formData.step3.niceToHaves.length > 0) && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Nice to Haves</h4>
            <div className="flex flex-wrap gap-1">
              {formData.step3.niceToHaves.map((item, index) => (
                <Badge key={index} variant="outline">{item}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep4Summary = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Ceremony & Reception Details
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditStep(3)}
          className="h-8 w-8 p-0"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Ceremony Type</h4>
            <Badge variant="secondary">{formData.step4?.ceremony?.type}</Badge>
            {formData.step4?.ceremony?.officiantNeeded && (
              <p className="text-xs text-muted-foreground mt-1">Officiant needed</p>
            )}
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Dining Style</h4>
            <Badge variant="secondary">{formData.step4?.dining?.mealStyle}</Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Bar: {formData.step4?.dining?.barPreference}
            </p>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">Seating & Setup</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{formData.step4?.seating?.style}</Badge>
            {formData.step4?.seating?.danceFloorRequired && (
              <Badge variant="outline">Dance Floor</Badge>
            )}
            {formData.step4?.seating?.stageRequired && (
              <Badge variant="outline">Stage</Badge>
            )}
          </div>
        </div>
        {formData.step4?.specialMoments && formData.step4.specialMoments.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Special Moments</h4>
            <div className="flex flex-wrap gap-1">
              {formData.step4.specialMoments.map((moment, index) => (
                <Badge key={index} variant="outline">{moment}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep5Summary = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Vendor Preferences
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditStep(4)}
          className="h-8 w-8 p-0"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {formData.step5?.requiredVendors && formData.step5.requiredVendors.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Required Vendors</h4>
            <div className="flex flex-wrap gap-1">
              {formData.step5.requiredVendors.map((vendor, index) => (
                <Badge key={index} variant="default">{vendor}</Badge>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.step5?.photographer?.style && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Photography Style</h4>
              <Badge variant="secondary">{formData.step5.photographer.style}</Badge>
            </div>
          )}
          {formData.step5?.music?.bandOrDJ && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Music Preference</h4>
              <Badge variant="secondary">{formData.step5.music.bandOrDJ}</Badge>
            </div>
          )}
        </div>
        {formData.step5?.search?.radiusMiles && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Search Radius</h4>
            <p className="text-sm">{formData.step5.search.radiusMiles} miles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep6Summary = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Car className="h-4 w-4" />
          Travel & Logistics
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEditStep(5)}
          className="h-8 w-8 p-0"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Travel Needs</h4>
            <div className="space-y-1">
              {formData.step6?.travel?.majorityFromOutOfTown && (
                <Badge variant="outline">Majority out-of-town</Badge>
              )}
              {(formData.step6?.travel?.hotelBlocksNeeded || 0) > 0 && (
                <p className="text-sm">{formData.step6.travel.hotelBlocksNeeded} hotel blocks needed</p>
              )}
              {formData.step6?.travel?.shuttleNeeded && (
                <Badge variant="outline">Shuttle needed</Badge>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Guest Policy</h4>
            <Badge variant="secondary">{formData.step6?.guests?.kidsPolicy}</Badge>
            <p className="text-xs text-muted-foreground mt-1">
              RSVP: {formData.step6?.guests?.rsvpPreference}
            </p>
          </div>
        </div>
        {formData.step6?.website?.needed && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Website</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{formData.step6.website.copyTone} tone</Badge>
              {formData.step6.website.bilingualSite && (
                <Badge variant="outline">Bilingual</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <SectionCard
        title="Review & Submit"
        description="Please review all your information before submitting. You can edit any section by clicking the edit button."
      >
        <div className="space-y-6">
          {renderStep1Summary()}
          {renderStep2Summary()}
          {renderStep3Summary()}
          {renderStep4Summary()}
          {renderStep5Summary()}
          {renderStep6Summary()}
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={formData.step7?.consent || false}
              onCheckedChange={(checked) => setValue('step7.consent', checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="consent" className="text-sm font-medium">
                I consent to the use of my data for wedding planning purposes
              </Label>
              <p className="text-xs text-muted-foreground">
                By checking this box, you agree to allow PlanHaus to use your information to help plan your wedding and provide personalized recommendations.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="emailCopy"
              checked={formData.step7?.emailCopy || false}
              onCheckedChange={(checked) => setValue('step7.emailCopy', checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="emailCopy" className="text-sm font-medium">
                Email me a copy of my intake form
              </Label>
              <p className="text-xs text-muted-foreground">
                We'll send you a PDF copy of your completed intake form for your records.
              </p>
            </div>
          </div>
        </div>

        {errors.step7 && (
          <div className="flex items-center gap-2 text-sm text-destructive mt-2">
            <AlertCircle className="h-4 w-4" />
            {errors.step7?.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="flex-1"
          >
            Save Draft
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !formData.step7?.consent}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit & Apply
              </>
            )}
          </Button>
        </div>

        {!formData.step7?.consent && (
          <p className="text-sm text-muted-foreground text-center mt-2">
            Please check the consent box to submit your intake form.
          </p>
        )}
      </SectionCard>
    </div>
  );
}; 